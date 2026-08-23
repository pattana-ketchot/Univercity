-- ============================================
-- Migration: เพิ่มฟิลด์ careers และ category ในตาราง courses
-- ============================================

-- เพิ่มฟิลด์ category (หมวดหมู่)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- เพิ่มฟิลด์ careers (อาชีพหลังจบ) เป็น Array ของ TEXT
ALTER TABLE courses ADD COLUMN IF NOT EXISTS careers TEXT[];

-- เพิ่ม Index สำหรับ category
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- อัพเดทข้อมูลตัวอย่าง (ถ้ามี)
-- UPDATE courses SET category = 'computer', careers = ARRAY['นักพัฒนาซอฟต์แวร์', 'นักวิเคราะห์ระบบ', 'Data Scientist'] WHERE title = 'วิทยาการคอมพิวเตอร์';
-- UPDATE courses SET category = 'computer', careers = ARRAY['ผู้ดูแลระบบ', 'วิศวกรเครือข่าย', 'Security Analyst'] WHERE title = 'เทคโนโลยีสารสนเทศ';
