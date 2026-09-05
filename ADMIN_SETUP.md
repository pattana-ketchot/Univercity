# คำแนะนำการติดตั้งระบบหลังบ้าน (Supabase + Admin Panel)

> **อัพเกรดจากโปรเจกต์เดิม (เคยรัน `supabase_schema.sql` ไปแล้ว)?**
> รัน `supabase_migration_admin_upgrade.sql` ใน SQL Editor เพิ่ม 1 ครั้ง เพื่อเพิ่มสถานะข่าว (draft/published), ผู้แก้ไขล่าสุด, และอีเมลผู้ใช้ — ไม่ต้องรัน `supabase_schema.sql` ซ้ำ
>
> **ใช้หน้า Login / Register ผู้ดูแลระบบแบบใหม่ (`/admin/login`, `/admin/register`)?**
> รัน `supabase_migration_admin_auth.sql` ใน SQL Editor 1 ครั้ง — เพิ่มคอลัมน์ `status` ใน `user_profiles`,
> ป้องกันผู้ใช้ยกระดับสิทธิ์ตัวเอง และให้ผู้ดูแลระบบที่อนุมัติแล้วกำหนดสิทธิ์ผู้ใช้คนอื่นได้ (ดูหัวข้อ 5.1)
>
> **ต้องการเปิดใช้ RAG (SCI Advisor ค้นข้อมูลจากเว็บไซต์มาตอบ) และหน้า `/admin/knowledge`?**
> รันตามลำดับใน SQL Editor: `supabase_migration_ai_settings.sql` → `supabase_migration_rag.sql` → `supabase_migration_knowledge.sql` → `supabase_migration_knowledge_files.sql`
> (ต้อง enable extension `vector` ได้ — Supabase เปิดให้ใช้อยู่แล้วเป็นค่าเริ่มต้น — และไฟล์สุดท้ายจะสร้าง Storage bucket `knowledge-files` แบบ private ให้อัตโนมัติ)

## 1. ติดตั้ง Dependencies

```bash
npm install
```

(`@supabase/supabase-js` อยู่ใน `package.json` แล้ว)

## 2. สร้าง Supabase Project

1. ไปที่ https://supabase.com แล้วสร้าง Project ใหม่ (รอสักครู่ให้ Project พร้อมใช้งาน)
2. ไปที่ **Settings -> API** แล้วคัดลอก **Project URL** และ **anon public key**

## 3. ตั้งค่า Environment Variables

แก้ไขไฟล์ `.env` ที่ root โปรเจกต์:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

`.env` ถูก gitignore ไว้แล้ว จะไม่ถูก commit ขึ้น repo

## 4. รัน SQL Schema

1. ไปที่ Supabase Dashboard -> **SQL Editor**
2. คัดลอกเนื้อหาทั้งหมดจากไฟล์ `supabase_schema.sql` ในโปรเจกต์นี้
3. วางแล้วกด Run

SQL นี้จะสร้าง:
- ตาราง `courses`, `news`, `user_profiles`
- Row Level Security (RLS) — ทุกคนดูข้อมูลได้ ต้องเป็น admin/editor เท่านั้นจึงแก้ไขได้
- Trigger สร้าง `user_profiles` อัตโนมัติเมื่อมีการสมัครสมาชิกใหม่
- ข้อมูลตัวอย่าง (หลักสูตร 10 สาขา + ข่าว 3 รายการ) ให้หน้าเว็บแสดงผลได้ทันที

## 5. สร้าง Admin คนแรก

1. Supabase Dashboard -> **Authentication -> Users -> Add user**
   - Email: อีเมลที่ต้องการใช้ล็อกอิน Admin
   - Password: ตั้งรหัสผ่าน
   - เปิด **Auto Confirm User**
2. ไปที่ **SQL Editor** แล้วรัน (แทนที่อีเมลด้วยของจริง):

```sql
UPDATE user_profiles SET role = 'admin', full_name = 'Admin'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

## 5.1 สมัครผู้ดูแลระบบผ่านหน้า `/admin/register`

หน้า `/admin/register` ให้ผู้ที่ต้องการเป็นทีมงานสมัครบัญชีได้เอง ผ่าน Supabase Auth โดยตรง
(Supabase เป็นผู้ hash รหัสผ่าน) — **บัญชีที่สมัครใหม่จะได้ `role='user'` และยังไม่มีสิทธิ์เข้าระบบผู้ดูแล**
จนกว่าผู้ดูแลระบบระดับสูงจะกำหนดสิทธิ์ให้

**ขั้นตอน:**

1. รัน `supabase_migration_admin_auth.sql` ใน SQL Editor (ครั้งเดียว)
2. ผู้สมัครไปที่ `/admin/register` กรอกชื่อ-นามสกุล / อีเมล / รหัสผ่าน → ได้บัญชี `role='user'`
   - ถ้าลองล็อกอินตอนนี้จะเจอหน้า "ไม่มีสิทธิ์เข้าใช้งาน" — เป็นพฤติกรรมที่ถูกต้อง
3. ผู้ดูแลระบบ (`role='admin'`, `status='approved'`) เข้า `/admin/users` แล้ว:
   - เปลี่ยน **Role** ของผู้สมัครเป็น `admin` หรือ `editor`
   - ถ้าสถานะขึ้น "รออนุมัติ" ให้กด **"อนุมัติ"** (ตั้ง `status='approved'`)
   - หรือรันใน SQL Editor:

     ```sql
     UPDATE public.user_profiles
     SET role = 'admin', status = 'approved'   -- หรือ role = 'editor'
     WHERE user_id = (SELECT id FROM auth.users WHERE email = 'new-admin@example.com');
     ```

> **Admin คนแรก** ต้องตั้งค่าด้วยมือตามขั้นตอนที่ 5 (ยังไม่มีใครกดอนุมัติให้ได้)
> แถว `user_profiles` ที่มีอยู่เดิมทั้งหมดจะได้ `status='approved'` อัตโนมัติหลังรัน migration

**การยืนยันอีเมล:** ถ้าใช้ภายในองค์กรและไม่อยากให้ผู้สมัครต้องยืนยันอีเมล ให้ปิดที่
Supabase Dashboard → **Authentication → Providers → Email → ปิด "Confirm email"**
(ถ้าเปิดไว้ หน้า Register จะแจ้งให้ผู้สมัครกดลิงก์ยืนยันในอีเมลก่อน)

## 6. Role ที่มีในระบบ

| Role     | สิทธิ์                                         |
|----------|------------------------------------------------|
| `admin`  | เพิ่ม/แก้ไข/ลบ หลักสูตรและข่าว + จัดการ role ผู้ใช้ |
| `editor` | เพิ่ม/แก้ไข หลักสูตรและข่าว (ลบไม่ได้)              |
| `user`   | ดูข้อมูลเท่านั้น (สิทธิ์เริ่มต้นเมื่อสมัครสมาชิก)     |

## 7. รันโปรเจกต์และเข้าใช้งาน Admin

```bash
npm run dev
```

- Admin Login: `http://localhost:5173/admin/login`
- Admin Dashboard: `/admin/dashboard`
- จัดการผู้ใช้ (เฉพาะ admin): `/admin/users`

## 8. Troubleshooting

- **ล็อกอินไม่ได้**: ตรวจสอบว่าเปิด Auto Confirm User ตอนสร้าง user แล้ว
- **บันทึกข้อมูลไม่ได้ / ขึ้น RLS error**: ตรวจสอบว่า user มี role เป็น `admin` หรือ `editor` ใน `user_profiles`
- **หน้าเว็บขึ้น "ยังไม่ได้ตั้งค่า Supabase"**: ตรวจสอบค่าใน `.env` แล้ว restart `npm run dev`

## 9. Deploy

ตั้งค่า Environment Variables เดียวกันนี้ในระบบ deploy (เช่น Vercel -> Project Settings -> Environment Variables):

```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

⚠️ อย่า commit ไฟล์ `.env` หรือเผยแพร่ค่า anon key ในที่สาธารณะที่ไม่เกี่ยวข้อง
