# Course Detail Page - Documentation

## สร้างสำเร็จ ✅

หน้า **Course Detail (รายละเอียดหลักสูตร)** ใหม่ที่อยู่ที่ `/courses/:id`

## ไฟล์ที่สร้าง/แก้ไข

### ไฟล์ใหม่
- `src/pages/CourseDetail.jsx` - หน้ารายละเอียดหลักสูตรแบบเต็ม

### ไฟล์ที่แก้ไข
- `src/App.jsx` - เพิ่ม route `/courses/:id`
- `src/components/CourseCard.jsx` - เพิ่ม prop `id` และลิงก์ไปยังหน้ารายละเอียด

## โครงสร้างหน้า

### Desktop Layout (2 Columns)

#### Main Content (ซ้าย - 70-75%)
1. **Course Header**
   - รูปภาพหลักสูตร (gradient background)
   - Badge ระดับการศึกษา
   - ชื่อหลักสูตร (ไทย/อังกฤษ)
   - คำอธิบาย
   - Metadata (ระยะเวลา, ภาคปกติ, ภาษา)

2. **Tab Navigation**
   - รายละเอียดหลักสูตร
   - เอกสารหลักสูตร
   - คณาจารย์

3. **Content Sections**
   - 📚 **เกี่ยวกับสาขา** - คำอธิบายโดยละเอียด
   - 💡 **จุดเด่นของสาขา** - รายการจุดเด่น 6 ข้อ
   - 🏆 **เรียนอะไรบ้าง** - หมวดวิชา 4 กลุ่ม

#### Sidebar (ขวา - 25-30%)
**Card "ข้อมูลสำคัญ"** ประกอบด้วย:
- ระดับการศึกษา: Bachelor
- ระยะเวลาเรียน: 4 years
- จำนวนหน่วยกิต: 132 หน่วยกิต
- ค่าเล่าเรียน: 12,000 บาท/ภาคการศึกษา
- ค่าเล่าเรียนตลอดหลักสูตร: ~ 96,000 บาท
- รูปแบบการเรียน: ภาคปกติ
- ภาษาในการเรียน: ภาษาไทย
- วิทยาเขต: กรุงเทพมหานคร

**Call to Action Buttons:**
- ปุ่ม "สมัครเรียน" (สีเขียว)
- ปุ่ม "ติดต่อสอบถาม" (outline)

### Responsive Design

#### Mobile
- Single column layout
- Course header
- Tabs
- Content sections
- ข้อมูลสำคัญ sidebar ย้ายมาด้านล่าง

#### Tablet
- ปรับสัดส่วนให้เหมาะสม
- Sidebar ลดขนาด

## สี และ Visual Design

- **สีหลัก:** Green (`#016a2b` - pnru)
- **สี Accent:** Yellow, Blue, Purple (ตาม section)
- **Background:** Gray-50
- **Card:** White with light border
- **Border Radius:** 8-12px (rounded-xl)
- **Shadow:** Minimal (shadow-sm)
- **Icons:** Lucide React

## ข้อมูลตัวอย่าง

หลักสูตร: **คอมพิวเตอร์แอนิเมชันและมัลติมีเดีย**
- Computer Animation and Multimedia
- ปริญญาตรี 4 ปี
- 132 หน่วยกิต
- ค่าเล่าเรียน 12,000 บาท/ภาค

## Features

✅ Tab Navigation (3 tabs)
✅ Responsive Design
✅ Icon ที่สื่อความหมาย
✅ Hover Effects
✅ Sticky Sidebar (desktop)
✅ Easy to update content (object-based data)
✅ Clean, modern academic design

## วิธีใช้งาน

### ดูหน้า Detail
1. ไปที่ `/courses` (หน้าหลักสูตรทั้งหมด)
2. คลิก "ดูรายละเอียด" ที่ Course Card ใดก็ได้
3. จะไปที่ `/courses/:id`

หรือเข้าโดยตรง: `http://localhost:5174/courses/1`

### แก้ไขข้อมูล

แก้ไขไฟล์ `src/pages/CourseDetail.jsx` ที่ object `courseData`:

```javascript
const courseData = {
  title: 'ชื่อหลักสูตร',
  titleEn: 'Course Name',
  level: 'ปริญญาตรี',
  duration: '4 ปี',
  // ... แก้ไขข้อมูลอื่น ๆ
  importantInfo: [
    { label: 'ระดับการศึกษา', value: 'Bachelor', icon: GraduationCap },
    // ... เพิ่ม/ลดข้อมูลได้
  ]
}
```

## ข้อมูลทางเทคนิค

- **Framework:** React 18
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Build Tool:** Vite

## สิ่งที่ยังทำได้ต่อ (Optional Enhancements)

1. เชื่อมต่อกับระบบข้อมูลจริงตาม ID (เมื่อมีระบบหลังบ้านใหม่)
2. เพิ่มรูปภาพคณาจารย์จริง
3. เพิ่มฟังก์ชัน Download เอกสาร PDF
4. เพิ่ม Breadcrumb navigation
5. เพิ่ม SEO metadata
6. เพิ่มปุ่ม Share social media
7. เพิ่ม Loading skeleton
8. เพิ่มแบบสอบถามความสนใจ
9. เพิ่ม Related courses section
10. Animation เมื่อเปลี่ยน Tab

## Testing

✅ หน้าโหลดได้
✅ Responsive บน Desktop
✅ Tabs ทำงานได้
✅ Sidebar แสดงข้อมูลสำคัญครบ
✅ Links จาก AllCourses ไปยัง Detail ทำงาน
✅ ไม่กระทบหน้าเดิม

---

**สร้างเมื่อ:** 23 สิงหาคม 2026
**Development Server:** http://localhost:5174/courses/1
