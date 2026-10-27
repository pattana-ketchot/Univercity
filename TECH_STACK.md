# Tech Stack - University Website

เอกสารสรุปเทคโนโลยีและเครื่องมือทั้งหมดที่ใช้ในโปรเจกต์นี้

## Frontend

- **React 18** - UI library
- **React Router DOM v7** - จัดการ routing แบบ client-side (`BrowserRouter`, nested routes สำหรับหน้า public และหน้า admin)
- **Vite 5** - build tool / dev server
- **Tailwind CSS 3** + **PostCSS** + **Autoprefixer** - จัดการ styling
- **lucide-react** - ชุดไอคอน
- Google Fonts (Prompt) - ฟอนต์ภาษาไทย

## Backend / API

- **Vercel Functions** (โฟลเดอร์ `api/`) - Serverless API endpoints เช่น
  - `api/chat.js` - แชทบอทที่ปรึกษา (AI Advisor)
  - `api/compare-courses.js` - เปรียบเทียบหลักสูตรด้วย AI
  - `api/recommend-major.js` - แนะนำสาขาวิชา
  - `api/sci-connect-news.js`, `api/sci-connect-news-detail.js` - ข่าวสาร Sci Connect
  - `api/admin/*` - endpoint สำหรับผู้ดูแลระบบ (ingest ข้อมูล, extract ไฟล์, sync ข่าว)
- ไลบรารีร่วมใน `api/_lib/` ได้แก่ `adminAuth.js`, `aiConfig.js`, `fileExtract.js`, `ingest.js`, `rag.js`

## AI / LLM

- **Vercel AI SDK (`ai`)** - ใช้เรียกโมเดลภาษาและสตรีมคำตอบ
- **@ai-sdk/openai**, **@ai-sdk/google** - AI provider adapters (OpenAI-compatible / Google)
- รองรับเรียกผ่าน **OpenRouter** (ตัวอย่างใน `.env.example`: `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`)
- Admin สามารถเปลี่ยนโมเดล AI ที่ใช้งานได้จากหน้า `/admin/ai-settings` โดยไม่ต้อง deploy ใหม่ (เก็บค่าที่ตาราง `ai_settings` ใน Supabase, cache ในหน่วยความจำ 30 วินาที)
- **RAG (Retrieval-Augmented Generation)** - มีระบบ ingest ความรู้ (`ragIngest.js`, `api/_lib/rag.js`, `api/_lib/ingest.js`) เพื่อให้แชทบอทตอบจากฐานความรู้ของมหาวิทยาลัย
- **zod** - validate/parse ข้อมูล (มักใช้คู่กับ AI SDK สำหรับ structured output)

## Database / Backend-as-a-Service

- **Supabase** (`@supabase/supabase-js`)
  - Postgres database (ดูโครงสร้างใน `supabase_schema.sql`)
  - ใช้เก็บข้อมูลหลักสูตร, ข่าวสาร, ผู้ดูแลระบบ, การตั้งค่า AI, ฐานความรู้ (knowledge base)
  - **Supabase Edge Functions** (`supabase/functions/sync-sci-news/`) - ฟังก์ชันซิงค์ข่าว Sci Connect

## File processing

- **mammoth** - แปลงไฟล์ Word (.docx) เป็นข้อความ
- **pdf-parse** - แปลงไฟล์ PDF เป็นข้อความ
- ใช้ร่วมกับระบบ ingest เอกสารเข้าฐานความรู้ (Knowledge Base) ในหน้า Admin

## Authentication / Admin

- ระบบ Admin แยกต่างหาก (`src/pages/Admin/`, `api/admin/`) มีการ login/register, จัดการผู้ใช้ (User Management), ตั้งค่า AI, ดู log, จัดการหลักสูตร/ข่าว/ฐานความรู้
- `ProtectedAdminRoute` - guard route สำหรับหน้า admin ที่ต้อง login และได้รับการอนุมัติ
- `src/lib/adminAuth.js`, `api/_lib/adminAuth.js` - ตรรกะยืนยันตัวตนฝั่ง client/server

## Deployment

- **Vercel** - hosting ทั้ง frontend (static build จาก Vite) และ API functions
- `vercel.json` - ตั้งค่า SPA rewrite ให้ทุก route กลับไปที่ `index.html` (รองรับ refresh/เข้าตรงในหน้า client-side route)

## โครงสร้างโฟลเดอร์หลัก

```
├── api/                # Vercel Serverless Functions (backend)
│   ├── _lib/           # โค้ดใช้ร่วมกันฝั่ง API
│   └── admin/          # API เฉพาะฝั่งแอดมิน
├── src/
│   ├── components/     # React components ที่ใช้ซ้ำ
│   ├── hooks/          # custom hooks (เช่น useAdminAuth)
│   ├── lib/            # โค้ด client-side ใช้ร่วมกัน (supabase client, auth, file extract ฯลฯ)
│   └── pages/          # หน้าเว็บ (public + Admin/)
├── supabase/
│   └── functions/      # Supabase Edge Functions
├── supabase_schema.sql # โครงสร้างฐานข้อมูล Postgres
└── vercel.json         # การตั้งค่า deploy บน Vercel
```
