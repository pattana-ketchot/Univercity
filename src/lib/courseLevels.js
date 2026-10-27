// ระดับการศึกษาของหลักสูตร
//
// เก็บอยู่ใน detail.level ซึ่งเป็นช่องเดิมที่ฟอร์มผู้ดูแลกรอกได้อยู่แล้ว
// (ดู LEVEL_OPTIONS ใน src/pages/Admin/CourseForm.jsx)
//
// รวมไว้ที่นี่เพราะมีหลายหน้าต้องอ่านค่าเดียวกัน ถ้าแต่ละหน้าเขียนเอง
// วันหนึ่งจะตัด/ไม่ตัดช่องว่างไม่เหมือนกันแล้วผลต่างกันโดยไม่มีใครรู้

export const levelOf = (course) => {
  const level = course?.detail?.level
  return typeof level === 'string' ? level.trim() : ''
}

// เรียงตามลำดับการศึกษา ไม่ใช่ตามตัวอักษร
// ถ้าเรียง ก-ฮ จะได้ เอก ตรี โท ซึ่งอ่านไม่เข้าหัว
// ระดับที่ไม่อยู่ในรายการนี้ (ถ้าผู้ดูแลเพิ่มภายหลัง) ต่อท้ายตามตัวอักษร
const LEVEL_ORDER = ['ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก', 'ประกาศนียบัตรบัณฑิต', 'อนุปริญญา']

export const byKnownOrder = (a, b) => {
  const ia = LEVEL_ORDER.indexOf(a)
  const ib = LEVEL_ORDER.indexOf(b)
  if (ia === -1 && ib === -1) return a.localeCompare(b, 'th')
  if (ia === -1) return 1
  if (ib === -1) return -1
  return ia - ib
}

const GRADUATE_LEVELS = ['ปริญญาโท', 'ปริญญาเอก']

/**
 * หลักสูตรที่เหมาะกับคนกำลังเลือกที่เรียนต่อระดับปริญญาตรี
 *
 * **ตัดออกเท่านั้น ไม่เติมอะไรเข้ามา** หลักสูตรที่ผู้ดูแลยังไม่ได้กรอกระดับ
 * จะยังอยู่เหมือนเดิม — ตัดเฉพาะที่ระบุชัดว่าเป็นบัณฑิตศึกษา เพื่อให้พฤติกรรม
 * กับข้อมูลชุดเดิมไม่เปลี่ยนจากก่อนเพิ่มฟังก์ชันนี้
 */
export const forUndergraduateAdvice = (courses) =>
  (courses || []).filter((course) => !GRADUATE_LEVELS.includes(levelOf(course)))
