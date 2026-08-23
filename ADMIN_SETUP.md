# คำแนะนำการติดตั้งระบบ Admin Panel

## 1. ติดตั้ง Dependencies

```bash
npm install @supabase/supabase-js
```

## 2. ตั้งค่า Supabase Project

### 2.1 สร้าง Project ใน Supabase
1. ไปที่ https://supabase.com
2. สร้าง Project ใหม่
3. รอให้ Project ติดตั้งเสร็จ

### 2.2 ตั้งค่า Environment Variables
1. เปิดไฟล์ `.env` ในโปรเจค
2. แก้ไขค่าดังนี้:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**วิธีหา URL และ ANON KEY:**
- ไปที่ Supabase Dashboard → Settings → API
- คัดลอก Project URL และ anon/public key

### 2.3 สร้าง Storage Bucket
1. ไปที่ Supabase Dashboard → Storage
2. สร้าง Bucket ชื่อ `assets`
3. ตั้งค่า Public access:
   - คลิก Bucket `assets`
   - ไปที่ Policies
   - สร้าง policy ใหม่:
     - **SELECT**: Allow public access
     - **INSERT**: Allow authenticated users only

## 3. รัน SQL Schema

1. ไปที่ Supabase Dashboard → SQL Editor
2. คัดลอกโค้ดจากไฟล์ `supabase_schema.sql`
3. วางและรัน SQL

**SQL จะสร้าง:**
- ✅ ตาราง `user_profiles` (สำหรับจัดการ Role)
- ✅ ตาราง `courses` (หลักสูตร)
- ✅ ตาราง `news` (ข่าวสาร)
- ✅ Row Level Security (RLS) Policies
- ✅ Triggers อัตโนมัติ
- ✅ ข้อมูลตัวอย่าง

## 4. สร้าง Admin User

### 4.1 สร้าง User ใน Supabase Auth
1. ไปที่ Supabase Dashboard → Authentication → Users
2. คลิก "Add user"
3. กรอกข้อมูล:
   - Email: admin@example.com
   - Password: (รหัสผ่านที่ต้องการ)
   - ✅ Auto Confirm User

### 4.2 ตั้ง Role เป็น Admin
1. ไปที่ SQL Editor
2. รันคำสั่ง:

```sql
-- หา user_id ของ admin
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- อัพเดท role เป็น admin (แทนที่ 'user-uuid' ด้วย id ที่ได้)
UPDATE user_profiles 
SET role = 'admin', full_name = 'Admin User'
WHERE user_id = 'user-uuid-here';
```

## 5. ประเภท Role

ระบบมี 3 ประเภท Role:

| Role | สิทธิ์ |
|------|--------|
| **admin** | เพิ่ม แก้ไข ลบ หลักสูตรและข่าวสาร |
| **editor** | เพิ่ม แก้ไข หลักสูตรและข่าวสาร (ลบไม่ได้) |
| **user** | ดูข้อมูลเท่านั้น |

## 6. ทดสอบระบบ

### 6.1 รัน Development Server
```bash
npm run dev
```

### 6.2 เข้าสู่ระบบ Admin
1. เปิดเบราว์เซอร์: http://localhost:5173/admin/login
2. ใส่ email และ password ที่สร้างไว้
3. ควรเห็นหน้า Dashboard

### 6.3 ทดสอบฟังก์ชัน
- ✅ เพิ่มหลักสูตรใหม่
- ✅ แก้ไขหลักสูตร
- ✅ ลบหลักสูตร
- ✅ เพิ่มข่าวสาร
- ✅ แก้ไขข่าวสาร
- ✅ ลบข่าวสาร
- ✅ อัพโหลดรูปภาพ

## 7. โครงสร้างไฟล์

```
src/
├── lib/
│   └── supabase.js           # Supabase client config
├── pages/
│   └── Admin/
│       ├── Login.jsx          # หน้าล็อกอิน Admin
│       ├── Dashboard.jsx      # หน้าแดชบอร์ด
│       ├── CourseForm.jsx     # ฟอร์มเพิ่ม/แก้ไขหลักสูตร
│       └── NewsForm.jsx       # ฟอร์มเพิ่ม/แก้ไขข่าวสาร
└── App.jsx                    # Routes configuration
```

## 8. URL สำหรับเข้าใช้งาน

- **Admin Login:** `/admin/login`
- **Admin Dashboard:** `/admin/dashboard`
- **เพิ่มหลักสูตร:** `/admin/courses/create`
- **แก้ไขหลักสูตร:** `/admin/courses/edit/:id`
- **เพิ่มข่าวสาร:** `/admin/news/create`
- **แก้ไขข่าวสาร:** `/admin/news/edit/:id`

## 9. Security Features

✅ **Row Level Security (RLS)**
- ข้อมูลทุกตารางมี RLS Policy
- Public สามารถดูข้อมูลได้เท่านั้น
- เฉพาะ Admin/Editor เท่านั้นที่แก้ไขได้

✅ **Role-based Access Control**
- ตรวจสอบ Role ก่อนเข้าหน้า Admin
- ตรวจสอบ Role ก่อนดำเนินการ CRUD

✅ **Authentication Required**
- ต้องล็อกอินก่อนเข้าใช้งาน Admin Panel

## 10. การอัพเดทข้อมูลในหน้าหน้าบ้าน

### อัพเดท Banner.jsx ให้ดึงข้อมูลจาก Supabase

เปิดไฟล์ `src/components/Banner.jsx` และแก้ไข:

```jsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Calendar, ArrowRight } from 'lucide-react'

const Banner = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false })
      .limit(3)

    if (!error && data) {
      setNews(data)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="py-16 text-center">Loading...</div>
  }

  return (
    // ... rest of the code
  )
}
```

### อัพเดท AllCourses.jsx

เปิดไฟล์ `src/pages/AllCourses.jsx` และเพิ่ม:

```jsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AllCourses = () => {
  const [courses, setCourses] = useState([])

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setCourses(data)
  }

  // ... rest
}
```

## 11. Troubleshooting

### ปัญหา: ไม่สามารถล็อกอินได้
- ตรวจสอบว่า Email Confirmation เปิดอยู่หรือไม่
- ตรวจสอบว่า User มี role ใน user_profiles

### ปัญหา: ไม่สามารถอัพโหลดรูปภาพได้
- ตรวจสอบว่าสร้าง Bucket `assets` แล้ว
- ตรวจสอบ Storage Policies

### ปัญหา: RLS Policy Error
- ตรวจสอบว่ารัน SQL Schema ครบทุกส่วน
- ตรวจสอบว่า user มี role ที่ถูกต้อง

## 12. หมายเหตุ

- ⚠️ อย่าเผยแพร่ `.env` file
- ⚠️ เปลี่ยน password ของ admin ให้แข็งแรง
- ⚠️ ตรวจสอบ RLS Policies ก่อน deploy
- 💡 สามารถเพิ่ม Role อื่นๆ ได้ตามต้องการ
- 💡 สามารถปรับแต่ง UI ของ Admin Panel ได้

## 13. การ Deploy

### Vercel / Netlify
1. เพิ่ม Environment Variables ใน Dashboard
2. Deploy โปรเจค

### Environment Variables ที่ต้องตั้ง:
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

---

**เสร็จสิ้น!** ตอนนี้คุณมีระบบ Admin Panel พร้อม Role-based access control แล้ว 🎉
