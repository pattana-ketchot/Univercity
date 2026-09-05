import { supabase } from './supabase'

const BUCKET = 'knowledge-files'

// อัปโหลดไฟล์ต้นฉบับ (.pdf/.docx/.txt/.md) ที่แนบมากับข้อมูลความรู้ ไปเก็บใน Supabase Storage
// path ตั้งเป็น uuid ของตัวเองแยกจาก knowledge_articles.id เพราะยังไม่รู้ id ตอนสร้างใหม่
export const uploadKnowledgeFile = async (file) => {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false
  })

  if (error) throw new Error(error.message || 'อัปโหลดไฟล์ไม่สำเร็จ')
  return { path, name: file.name, size: file.size }
}

// สร้างลิงก์ดาวน์โหลดชั่วคราว (bucket เป็น private ไม่มี public URL ตรงๆ)
export const getKnowledgeFileUrl = async (path) => {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
  if (error) throw new Error(error.message || 'สร้างลิงก์ไฟล์ไม่สำเร็จ')
  return data.signedUrl
}

// fire-and-forget ใช้ตอนลบ/แทนที่ไฟล์เดิม ไม่ให้ไฟล์ค้างใน storage โดยไม่มีอะไรอ้างอิงถึง
export const removeKnowledgeFile = async (path) => {
  if (!path) return
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) console.error('[knowledgeStorage] failed to remove file', error)
}
