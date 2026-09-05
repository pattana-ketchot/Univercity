import { supabase } from './supabase'

// เรียกหลังบันทึก Course/News สำเร็จ เพื่อ chunk + embed + เก็บเข้า rag_documents
// ทำงานฝั่ง server ทั้งหมด (ต้องไม่สร้าง embedding ที่ client) — เรียกแบบ fire-and-forget
// ไม่ throw ถ้าพัง แค่ log ไว้ ไม่ให้กระทบการบันทึกหลักของฟอร์ม
export const triggerIngest = async ({ sourceType, sourceId, title, content }) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false

    const response = await fetch('/api/admin/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ sourceType, sourceId, title, content })
    })

    if (!response.ok) {
      console.error('[ragIngest] ingest failed', await response.text().catch(() => ''))
      return false
    }
    return true
  } catch (err) {
    console.error('[ragIngest] ingest failed', err)
    return false
  }
}
