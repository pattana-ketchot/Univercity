import { supabase } from './supabase'

// เก็บรูปคณาจารย์และเอกสารหลักสูตร ต่างจาก knowledge-files (private) ตรงที่
// bucket นี้ public — หน้ารายละเอียดหลักสูตรเป็นหน้าสาธารณะ ต้องแสดงรูป/
// ให้ดาวน์โหลดเอกสารได้โดยไม่ต้อง sign in
const BUCKET = 'course-assets'

const uploadCourseFile = async (file, folder) => {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
  const path = `${folder}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false
  })
  if (error) throw new Error(error.message || 'อัปโหลดไฟล์ไม่สำเร็จ')

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { path, url: data.publicUrl, name: file.name, size: file.size }
}

export const uploadFacultyPhoto = (file) => uploadCourseFile(file, 'faculty')
export const uploadCourseDocument = (file) => uploadCourseFile(file, 'documents')

// fire-and-forget ใช้ตอนลบ/แทนที่ไฟล์เดิม ไม่ให้ไฟล์ค้างใน storage โดยไม่มีอะไรอ้างอิงถึง
export const removeCourseFile = async (path) => {
  if (!path) return
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) console.error('[courseStorage] failed to remove file', error)
}

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
