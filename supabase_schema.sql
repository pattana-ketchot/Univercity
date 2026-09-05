-- ============================================================================
-- supabase_schema.sql
--
-- หมายเหตุ: ไฟล์นี้ถูกสร้างใหม่โดยการดึงโครงสร้างจริงจาก Supabase project ที่ใช้งาน
-- อยู่ (ผ่าน Supabase MCP tools แบบ read-only) เนื่องจากไฟล์ schema/migration ชุดเดิม
-- (ที่ไม่เคย commit เข้า git) หายไปจากเครื่อง ไฟล์นี้จึงเป็น "snapshot" รวมของ schema
-- ปัจจุบัน ไม่ใช่ประวัติ migration ทีละขั้นเหมือนไฟล์ supabase_migration_*.sql เดิม
--
-- ใช้สำหรับ:ตั้งค่า Supabase project ใหม่ (dev/staging/disaster recovery) ให้ได้
-- โครงสร้างตาราง, RLS policy, trigger และ storage bucket แบบเดียวกับ production
-- รันทั้งไฟล์นี้ในลำดับจากบนลงล่างใน SQL editor ของ Supabase project ใหม่
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Extensions ที่ต้องใช้
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS vector;     -- ชนิดข้อมูล embedding ของ rag_documents

-- ----------------------------------------------------------------------------
-- 1. ตาราง user_profiles (สำหรับจัดการ Role ของ Admin Panel)
-- ----------------------------------------------------------------------------
CREATE TABLE public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE,
  role VARCHAR(50) DEFAULT 'user',
  full_name VARCHAR(255),
  email TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- หมายเหตุ: production ปัจจุบันมี unique index ซ้ำอีก 1 ตัวบน user_id
-- (user_profiles_user_id_key, user_profiles_user_id_unique) ที่ UNIQUE ด้านบน
-- ครอบคลุมความหมายเดียวกันแล้ว ไม่จำเป็นต้องสร้างซ้ำในโปรเจกต์ใหม่

CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_status ON public.user_profiles(status);

-- ----------------------------------------------------------------------------
-- 2. ตาราง courses (หลักสูตร)
-- ----------------------------------------------------------------------------
CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  logo TEXT,
  careers TEXT[], -- อาชีพหลังจบ (ใช้ในหน้า /careers)
  -- ข้อมูลเสริมสำหรับหน้ารายละเอียด/เปรียบเทียบ (โครงสร้างยืดหยุ่น ไม่ตายตัวทุกฟิลด์):
  -- { level, duration, tuition_per_semester, tuition_total, about, qualifications[],
  --   highlights[{title, description}],
  --   faculty[{name, nameEn, positionTh, positionEn, email, image, image_path}],
  --   documents[{name, size, type, url, path}], important_info[{label, value}] }
  detail JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES auth.users(id),
  updated_by UUID REFERENCES public.user_profiles(user_id)
);

CREATE INDEX idx_courses_created_at ON public.courses(created_at DESC);

-- ----------------------------------------------------------------------------
-- 3. ตาราง news (ข่าวสารของคณะ — จัดการเองผ่าน Admin)
-- ----------------------------------------------------------------------------
CREATE TABLE public.news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  image TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'published', -- published | draft
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES auth.users(id),
  updated_by UUID REFERENCES public.user_profiles(user_id)
);

CREATE INDEX idx_news_date ON public.news(date DESC);
CREATE INDEX idx_news_created_at ON public.news(created_at DESC);
CREATE INDEX idx_news_category ON public.news(category);
CREATE INDEX idx_news_status ON public.news(status);

-- ----------------------------------------------------------------------------
-- 4. ตาราง ai_settings (ตั้งค่าโมเดล AI ที่ใช้ทั้งระบบ — มีแถวเดียวเสมอ id=1)
-- ----------------------------------------------------------------------------
CREATE TABLE public.ai_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  model VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- ----------------------------------------------------------------------------
-- 5. ตาราง rag_documents (chunk ข้อมูล + embedding สำหรับ SCI Advisor RAG)
-- ----------------------------------------------------------------------------
CREATE TABLE public.rag_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('major', 'news', 'article', 'knowledge')),
  source_id UUID,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  embedding vector, -- ขนาด vector ขึ้นกับโมเดล embedding ที่ใช้ (ปรับ dimension ตาม provider จริง)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (source_type, source_id, chunk_index)
);

CREATE INDEX idx_rag_documents_source ON public.rag_documents(source_type, source_id);
CREATE INDEX idx_rag_documents_embedding ON public.rag_documents
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = '100');

-- ----------------------------------------------------------------------------
-- 6. ตาราง knowledge_articles (คลังความรู้ทั่วไปสำหรับ RAG — หน้า Admin "คลังความรู้")
-- ----------------------------------------------------------------------------
CREATE TABLE public.knowledge_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  file_path TEXT,
  file_name TEXT,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_knowledge_articles_created_at ON public.knowledge_articles(created_at DESC);

-- ----------------------------------------------------------------------------
-- 7. ตาราง external_news (sync ข่าว SCI Connect จาก sci.pnru.ac.th อัตโนมัติ)
-- ----------------------------------------------------------------------------
CREATE TABLE public.external_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  detail_url TEXT NOT NULL UNIQUE,
  published_at TIMESTAMP WITH TIME ZONE,
  published_text VARCHAR(255),
  source VARCHAR(100) NOT NULL,
  slug VARCHAR(255),
  facebook_url TEXT,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_external_news_published_at ON public.external_news(published_at DESC);
CREATE INDEX idx_external_news_source ON public.external_news(source);
CREATE UNIQUE INDEX idx_external_news_slug ON public.external_news(slug) WHERE (slug IS NOT NULL);

-- ============================================================================
-- Functions + Triggers
-- ============================================================================

-- อัปเดต updated_at อัตโนมัติทุกครั้งที่มีการ UPDATE แถว
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_knowledge_articles_updated_at BEFORE UPDATE ON public.knowledge_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- สร้างแถว user_profiles อัตโนมัติเมื่อมีผู้ใช้สมัครใหม่ผ่าน Supabase Auth
-- (role='user' เสมอ — ต้องให้ admin เปลี่ยนเป็น admin/editor เองที่หน้า /admin/users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, role, full_name, email)
  VALUES (NEW.id, 'user', NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ป้องกันการยกระดับสิทธิ์ตัวเอง: ห้ามแก้ role/status ของ user_profiles ผ่าน client
-- เว้นแต่ผู้ที่ทำรายการเป็น admin ที่ approved แล้วเท่านั้น (service role / งานฝั่ง server
-- ที่ไม่มี JWT ผ่านได้เสมอ)
CREATE OR REPLACE FUNCTION public.guard_user_profile_privileges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF (NEW.role IS DISTINCT FROM OLD.role) OR (NEW.status IS DISTINCT FROM OLD.status) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND status = 'approved'
    ) THEN
      RAISE EXCEPTION 'ไม่มีสิทธิ์เปลี่ยนแปลง role หรือ status ของผู้ใช้';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER guard_user_profile_privileges_trigger BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_user_profile_privileges();

-- ============================================================================
-- Row Level Security
-- ============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_news ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Approved admins can update any profile"
  ON public.user_profiles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin' AND p.status = 'approved'
  ));

-- courses policies
CREATE POLICY "Courses are viewable by everyone"
  ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admins and editors can insert courses"
  ON public.courses FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ));
CREATE POLICY "Admins and editors can update courses"
  ON public.courses FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ));
CREATE POLICY "Admins can delete courses"
  ON public.courses FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- news policies
CREATE POLICY "Published news are viewable by everyone"
  ON public.news FOR SELECT USING (status = 'published');
CREATE POLICY "Admins and editors can view all news"
  ON public.news FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ));
CREATE POLICY "Admins and editors can insert news"
  ON public.news FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ));
CREATE POLICY "Admins and editors can update news"
  ON public.news FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ));
CREATE POLICY "Admins can delete news"
  ON public.news FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ai_settings policies
CREATE POLICY "AI settings are viewable by everyone"
  ON public.ai_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update AI settings"
  ON public.ai_settings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- rag_documents policies
CREATE POLICY "RAG documents are viewable by everyone"
  ON public.rag_documents FOR SELECT USING (true);
CREATE POLICY "Admins and editors can manage RAG documents"
  ON public.rag_documents FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ));

-- knowledge_articles policies
CREATE POLICY "Admins and editors can view knowledge articles"
  ON public.knowledge_articles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ));
CREATE POLICY "Admins and editors can insert knowledge articles"
  ON public.knowledge_articles FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ));
CREATE POLICY "Admins and editors can update knowledge articles"
  ON public.knowledge_articles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ));
CREATE POLICY "Admins can delete knowledge articles"
  ON public.knowledge_articles FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- external_news policies
CREATE POLICY "External news are viewable by everyone"
  ON public.external_news FOR SELECT USING (true);
CREATE POLICY "Admins and editors can insert external news"
  ON public.external_news FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ));
CREATE POLICY "Admins and editors can update external news"
  ON public.external_news FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ));
CREATE POLICY "Admins can delete external news"
  ON public.external_news FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- Storage buckets (ไฟล์แนบ: โลโก้หลักสูตร/รูปอาจารย์/เอกสาร, ไฟล์ความรู้)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('course-assets', 'course-assets', true),
  ('knowledge-files', 'knowledge-files', false)
ON CONFLICT (id) DO NOTHING;

-- course-assets: โลโก้/รูปอาจารย์/เอกสารหลักสูตร — โชว์สาธารณะได้ (bucket public)
-- แต่จำกัดสิทธิ์แก้ไข/ลบเฉพาะ admin/editor
CREATE POLICY "Course assets are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-assets');
CREATE POLICY "Admins and editors can upload course assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'course-assets' AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );
CREATE POLICY "Admins and editors can update course assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'course-assets' AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );
CREATE POLICY "Admins and editors can delete course assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'course-assets' AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- knowledge-files: ไฟล์ต้นฉบับของคลังความรู้ — private bucket, เห็น/แก้ไขได้เฉพาะ admin/editor
CREATE POLICY "Admins and editors can view knowledge files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'knowledge-files' AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );
CREATE POLICY "Admins and editors can upload knowledge files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'knowledge-files' AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );
CREATE POLICY "Admins and editors can update knowledge files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'knowledge-files' AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );
CREATE POLICY "Admins and editors can delete knowledge files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'knowledge-files' AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );
