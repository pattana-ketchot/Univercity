import { apiFetch } from './apiAuth'

// รูปคณาจารย์และโลโก้หลักสูตร — Phase 4 (มาแทน Supabase Storage bucket `course-assets`)
//
// หมวดนี้เปิดสาธารณะเหมือนของเดิม เพราะหน้ารายละเอียดหลักสูตรเป็นหน้าที่ใครก็เข้าได้
// ต้องแสดงรูปได้โดยไม่ต้องเข้าสู่ระบบ

const upload = async (file, category) => {
  const form = new FormData()
  form.append('file', file)

  const res = await apiFetch(`/api/uploads/${category}`, { method: 'POST', body: form })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) throw new Error(data?.detail || 'อัปโหลดไฟล์ไม่สำเร็จ')

  // คืนรูปแบบเดิมที่หน้าเว็บใช้อยู่ — path/url/name/size
  return { path: data.file_path, url: data.url, name: data.file_name, size: data.file_size }
}

export const uploadFacultyPhoto = (file) => upload(file, 'logo')
export const uploadCourseLogo = (file) => upload(file, 'logo')
export const uploadNewsImage = (file) => upload(file, 'news')
// เอกสารแนบของหลักสูตร — เปิดสาธารณะเหมือนของเดิม เพราะหน้ารายละเอียดให้ดาวน์โหลดได้
export const uploadCourseDocument = (file) => upload(file, 'course-doc')

// ไฟล์ถูกตั้งชื่อตาม hash ของเนื้อไฟล์ ไฟล์เดียวกันจึงถูกใช้ร่วมกันได้หลายที่
// การลบไฟล์ที่ยังมีที่อื่นอ้างถึงจะทำให้รูปที่นั่นหายไปด้วย — จึงไม่ลบ
//
// พื้นที่ที่เสียไปคือไฟล์ไม่กี่เมกะไบต์ ซึ่งถูกกว่าการทำบัญชีอ้างอิงให้ถูกต้อง
// ถ้าวันหนึ่งพื้นที่เป็นปัญหา ให้เขียนงานกวาดไฟล์ที่ไม่มีใครอ้างถึงแยกต่างหาก
export const removeCourseFile = async () => {}

export const formatFileSize = (bytes) => {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(size < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`
}
