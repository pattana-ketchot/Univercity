-- ============================================
-- Supabase Database Schema
-- สำหรับระบบจัดการหลักสูตรและข่าวสาร
-- ============================================

-- 1. ตาราง user_profiles (สำหรับจัดการ Role)
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'user',
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index สำหรับการค้นหา
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- 2. ตาราง courses (หลักสูตร)
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  logo TEXT,
  category VARCHAR(100),
  careers TEXT[], -- เพิ่มฟิลด์สำหรับเก็บอาชีพหลังจบ (เป็น Array)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index สำหรับการค้นหา
CREATE INDEX idx_courses_created_at ON courses(created_at DESC);

-- 3. ตาราง news (ข่าวสาร)
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index สำหรับการค้นหา
CREATE INDEX idx_news_created_at ON news(created_at DESC);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_date ON news(date DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- courses policies
CREATE POLICY "Courses are viewable by everyone"
  ON courses FOR SELECT
  USING (true);

CREATE POLICY "Admins and editors can insert courses"
  ON courses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins and editors can update courses"
  ON courses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can delete courses"
  ON courses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- news policies
CREATE POLICY "News are viewable by everyone"
  ON news FOR SELECT
  USING (true);

CREATE POLICY "Admins and editors can insert news"
  ON news FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins and editors can update news"
  ON news FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can delete news"
  ON news FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- Functions & Triggers
-- ============================================

-- Function สำหรับอัพเดท updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers สำหรับอัพเดท updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function สำหรับสร้าง user profile อัตโนมัติเมื่อมีการสมัครใช้งาน
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, role, full_name)
  VALUES (NEW.id, 'user', NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger สำหรับสร้าง user profile อัตโนมัติ
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Sample Data (Optional)
-- ============================================

-- สร้าง Admin User (ต้องสร้าง user ใน Supabase Auth ก่อน แล้วเอา user_id มาใส่)
-- INSERT INTO user_profiles (user_id, role, full_name)
-- VALUES ('your-user-uuid-here', 'admin', 'Admin User');

-- ตัวอย่างข้อมูลหลักสูตร
INSERT INTO courses (title, title_en, description, logo) VALUES
('วิทยาการคอมพิวเตอร์', 'Computer Science', 'เรียนรู้การเขียนโปรแกรม พัฒนาซอฟต์แวร์ และเทคโนโลยีสารสนเทศ', '/assets/courses/cs.png'),
('วิศวกรรมซอฟต์แวร์', 'Software Engineering', 'สร้างและพัฒนาซอฟต์แวร์คุณภาพสูงสำหรับองค์กร', '/assets/courses/se.png'),
('เทคโนโลยีสารสนเทศ', 'Information Technology', 'บริหารจัดการระบบสารสนเทศและเครือข่าย', '/assets/courses/it.png');

-- ตัวอย่างข้อมูลข่าวสาร
INSERT INTO news (title, description, category, date, image) VALUES
('เปิดรับสมัครนักศึกษาใหม่ ประจำปีการศึกษา 2567', 'มหาวิทยาลัยเปิดรับสมัครนักศึกษาใหม่ในหลากหลายสาขาวิชา พร้อมทุนการศึกษา', 'ข่าวรับสมัคร', '2567-01-15', '/assets/news/news1.png'),
('โครงการแนะแนวการศึกษาต่อ', 'ชวนน้องๆ ม.ปลายมาร่วมกิจกรรมแนะแนวการศึกษา พบกับอาจารย์และรุ่นพี่', 'กิจกรรม', '2567-01-10', '/assets/news/news2.png'),
('ทุนการศึกษาสำหรับนักเรียนที่มีความสามารถพิเศษ', 'มอบทุนการศึกษาเต็มจำนวนสำหรับนักเรียนที่มีผลงานดีเด่น', 'ทุนการศึกษา', '2567-01-05', '/assets/news/news3.png');
