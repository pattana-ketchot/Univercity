// ชนิดของสิ่งที่ลบได้จากหน้าภาพรวมผู้ดูแล
//
// ทำไมต้องแยกเป็นตาราง: การลบไม่ได้ลบแค่แถวในตารางของตัวเอง แต่ต้องล้าง chunk ใน
// rag_documents ด้วย ไม่งั้น AI ยังอ้างอิงข้อมูลที่ถูกลบไปแล้ว — และ source_type ของ
// แต่ละชนิดไม่เหมือนกัน ลบข่าวแล้วไปล้าง source_type ของหลักสูตรคือล้างผิดก้อน
//
// ค่า sourceType ต้องตรงกับที่ฝั่งฟอร์มใช้
//   'news'  — NewsForm.jsx ตอน unpublish ข่าว
//   'major' — ตรงกับที่หน้าภาพรวมใช้มาก่อนแล้วสำหรับหลักสูตร
export const DELETE_TARGETS = {
  course: { table: 'courses', sourceType: 'major', label: 'หลักสูตร' },
  news: { table: 'news', sourceType: 'news', label: 'ข่าว' }
}

// ค้นข่าวจากหัวข้อหรือหมวด — เทียบแบบไม่สนตัวพิมพ์ใหญ่เล็ก และต้องไม่พังเมื่อค่าเป็น null
export const matchesNewsQuery = (item, query) => {
  const q = (query || '').trim().toLowerCase()
  if (!q) return true
  return (item?.title || '').toLowerCase().includes(q) ||
    (item?.category || '').toLowerCase().includes(q)
}
