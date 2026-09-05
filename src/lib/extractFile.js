import { supabase } from './supabase'

// อัปโหลดไฟล์ไปแตกเป็นข้อความที่ /api/admin/extract-file (รองรับ .pdf, .docx, .txt, .md)
// เพื่อเอาไปเติมในฟอร์มคลังความรู้ ก่อนที่ผู้ใช้จะกดบันทึกและซิงค์เข้า RAG ตามปกติ
export const extractFileText = async (file) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่')

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/admin/extract-file', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: formData
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || 'อ่านไฟล์ไม่สำเร็จ')
  }
  return data.text || ''
}
