import { apiFetch } from './apiAuth'

// อัปโหลดไฟล์ไปแตกเป็นข้อความที่ /api/extract-file (รองรับ .pdf, .docx, .txt, .md)
// เพื่อเอาไปเติมในฟอร์มคลังความรู้ — Phase 4 (ย้ายจาก webapi มาที่ FastAPI)
//
// ไฟล์ไม่ถูกเก็บไว้ที่ไหน อ่านแล้วคืนข้อความอย่างเดียว
export const extractFileText = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiFetch('/api/extract-file', { method: 'POST', body: formData })
  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }
  if (!response.ok) throw new Error(data?.detail || 'อ่านไฟล์ไม่สำเร็จ')
  return data.text || ''
}
