# มหาวิทยาลัย - University Website

โปรเจกต์หน้าเว็บมหาวิทยาลัยที่สร้างด้วย React + Vite + Tailwind CSS

## โครงสร้างโปรเจกต์

```
Ffinal/
├── public/
│   └── assets/
│       ├── logo.png              # โลโก้มหาวิทยาลัยสำหรับ Header
│       ├── hero-building.jpg     # รูปอาคารสำหรับ Hero Section
│       └── courses/              # โลโก้หลักสูตรต่างๆ
│           ├── engineering.png
│           ├── business.png
│           ├── computer.png
│           ├── medicine.png
│           ├── arts.png
│           ├── law.png
│           └── science.png
├── src/
│   ├── components/
│   │   ├── Header.jsx           # ส่วน Header และเมนู
│   │   ├── Hero.jsx             # Hero Section พร้อมข้อความหลัก
│   │   ├── StatsPanel.jsx       # แผงแสดงสถิติ
│   │   ├── CourseCard.jsx       # Card หลักสูตรแต่ละรายการ
│   │   └── CourseCarousel.jsx   # Carousel หลักสูตรทั้งหมด
│   ├── App.jsx                  # Component หลัก
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles + Tailwind
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## วิธีติดตั้งและรัน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. เตรียมรูปภาพ

สร้างโฟลเดอร์และวางรูปภาพตามโครงสร้างนี้:

**Header Logo:**
- วางไฟล์ที่ `public/assets/logo.png`
- ขนาดแนะนำ: ความสูง 56px (จะ scale อัตโนมัติ)
- รูปแบบ: PNG หรือ SVG พื้นหลังโปร่งใส

**Hero Image:**
- วางไฟล์ที่ `public/assets/hero-building.jpg`
- ขนาดแนะนำ: 1200x1000px ขึ้นไป
- รูปแบบ: JPG หรือ PNG

**Course Logos:**
วางไฟล์ในโฟลเดอร์ `public/assets/courses/`:
- `engineering.png` - วิศวกรรมศาสตร์
- `business.png` - บริหารธุรกิจ
- `computer.png` - วิทยาการคอมพิวเตอร์
- `medicine.png` - แพทยศาสตร์
- `arts.png` - ศิลปกรรมศาสตร์
- `law.png` - นิติศาสตร์
- `science.png` - วิทยาศาสตร์

ขนาดแนะนำ: 200x200px (สี่เหลี่ยมจัตุรัส)

### 3. รันโปรเจกต์

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่: http://localhost:5173

### 4. Build สำหรับ Production

```bash
npm run build
```

ไฟล์ที่ build เสร็จจะอยู่ในโฟลเดอร์ `dist/`

## คุณสมบัติ

✅ พัฒนาด้วย React 18 + Vite (รวดเร็ว, Hot Module Replacement)
✅ Tailwind CSS (ปรับแต่งง่าย, Responsive)
✅ แยก Components ชัดเจน (Header, Hero, Stats, Courses)
✅ ใช้รูปภาพจริงแทน Icon/Emoji
✅ Responsive Design (Desktop, Tablet, Mobile)
✅ รองรับการใส่ไฟล์รูปภาพจริง
✅ มี Fallback กรณีรูปภาพโหลดไม่สำเร็จ

## การพัฒนาต่อยอด

### เพิ่มหลักสูตรใหม่

แก้ไขไฟล์ `src/components/CourseCarousel.jsx`:

```javascript
const courses = [
  {
    logo: '/assets/courses/new-course.png',
    title: 'ชื่อหลักสูตรใหม่',
    titleEn: 'New Course',
    description: 'คำอธิบาย...'
  },
  // ...
]
```

### ปรับสี

แก้ไขไฟล์ `tailwind.config.js`:

```javascript
colors: {
  primary: '#0D5257',  // สีเขียวหลัก
  navy: '#1E3A5F',     // สีกรมท่า
  cream: '#FAF7F2',    // สีครีม
}
```

### เพิ่มหน้าใหม่

1. สร้าง Component ใหม่ใน `src/components/`
2. Import และใช้งานใน `src/App.jsx`
3. ติดตั้ง React Router หากต้องการหลายหน้า:
   ```bash
   npm install react-router-dom
   ```

## เทคโนโลジีที่ใช้

- **React 18** - UI Library
- **Vite** - Build Tool (เร็วกว่า Create React App)
- **Tailwind CSS** - Utility-First CSS Framework
- **PostCSS** - CSS Processor
- **Google Fonts (Prompt)** - Thai Font

## หมายเหตุ

- หากไม่มีรูปภาพ ระบบจะแสดง Placeholder อัตโนมัติ
- รองรับการปรับขนาดหน้าจอแบบ Responsive
- สามารถพัฒนาต่อเป็น Full-stack ได้ (เชื่อมต่อ Backend API)

## License

MIT
