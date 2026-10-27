import { apiFetch, getAccessToken } from './apiAuth'

// ไฟล์แนบของคลังความรู้ — Phase 4 (มาแทน Supabase Storage bucket `knowledge-files`)
//
// ของเดิม bucket นี้เป็นแบบ **private** และใช้ signed URL อายุหนึ่งชั่วโมง
// ที่นี่ยังคงความเป็นส่วนตัวไว้: หมวด `knowledge` ต้องเข้าสู่ระบบเป็นผู้ดูแลก่อนจึงเปิดได้
// (ดู backend/app/api/routes/uploads.py) การเปิดเป็นสาธารณะตอนย้ายจะเป็นการลด
// ความปลอดภัยโดยไม่ได้ตั้งใจ

export const uploadKnowledgeFile = async (file) => {
  const form = new FormData()
  form.append('file', file)

  const res = await apiFetch('/api/uploads/knowledge', { method: 'POST', body: form })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) throw new Error(data?.detail || 'อัปโหลดไฟล์ไม่สำเร็จ')

  return { path: data.file_path, name: data.file_name, size: data.file_size }
}

/**
 * เปิดไฟล์แนบ
 *
 * ต่างจากของเดิมตรงที่ไม่มี signed URL ให้เปิดตรง ๆ ได้ เพราะด่านอยู่ที่ token
 * จึงต้องดึงไฟล์มาแล้วสร้าง URL ชั่วคราวในเบราว์เซอร์
 *
 * ผู้เรียกต้องเรียก revokeKnowledgeFileUrl() เมื่อใช้เสร็จ ไม่งั้นหน่วยความจำค้าง
 */
export const getKnowledgeFileUrl = async (path) => {
  if (!path) throw new Error('ไม่พบไฟล์')
  if (!getAccessToken()) throw new Error('ต้องเข้าสู่ระบบก่อนจึงจะเปิดไฟล์ได้')

  const res = await apiFetch(`/api/uploads/${path}`)
  if (!res.ok) {
    throw new Error(res.status === 403 ? 'ไม่มีสิทธิ์เปิดไฟล์นี้' : 'เปิดไฟล์ไม่สำเร็จ')
  }
  return URL.createObjectURL(await res.blob())
}

export const revokeKnowledgeFileUrl = (url) => {
  if (url) URL.revokeObjectURL(url)
}

// ไฟล์ตั้งชื่อตาม hash ของเนื้อไฟล์ จึงใช้ร่วมกันได้หลายที่ — ดูเหตุผลใน courseStorage.js
export const removeKnowledgeFile = async () => {}
