// ที่เดียวที่หน้าเว็บดึงข้อมูลหลักสูตร — Phase 4 ขั้นที่เลิกคุยกับ Supabase ตรง
//
// เดิมทุกหน้าเรียก supabase.from('courses') เองคนละที่ รวมเจ็ดจุด เบราว์เซอร์ทำแบบนั้นได้
// เพราะ Supabase แปลงตารางเป็น REST API ให้ เมื่อข้อมูลย้ายมาที่ PostgreSQL ของเรา
// เบราว์เซอร์ต่อฐานข้อมูลตรงไม่ได้ จึงผ่าน /api/site/courses แทน
//
// รวมมาไว้ที่เดียวเพื่อให้การแปลงชื่อฟิลด์และการจัดการข้อผิดพลาดมีจุดเดียว

const ENDPOINT = '/api/site/courses'

// หลังบ้านใช้ชื่อ logo_url ส่วนหน้าเว็บใช้ course.logo มาตั้งแต่ต้น
// แปลงที่นี่ที่เดียว ดีกว่าไล่แก้ JSX ทุกหน้าแล้วพลาดบางจุด
const toCourse = (row) => ({
  ...row,
  logo: row.logo_url ?? null,
  careers: row.careers || []
})

// ข้อผิดพลาดต้องโผล่ ไม่ใช่กลืนแล้วคืนรายการว่าง
// 503 แปลว่าอ่านฐานข้อมูลไม่ได้ ซึ่งต่างจาก "ไม่มีหลักสูตร" โดยสิ้นเชิง
// ถ้ากลืนไว้ หน้าเว็บจะขึ้นว่ายังไม่มีหลักสูตรทั้งที่ระบบมีปัญหา
const readOrThrow = async (res) => {
  if (res.status === 503) throw new Error('ระบบยังอ่านข้อมูลหลักสูตรไม่ได้ในขณะนี้')
  if (!res.ok) throw new Error(`โหลดข้อมูลหลักสูตรไม่สำเร็จ (${res.status})`)
  return res.json()
}

export const fetchSiteCourses = async () => {
  const data = await readOrThrow(await fetch(ENDPOINT))
  return (data.courses || []).map(toCourse)
}

export const fetchSiteCourse = async (id) => {
  const res = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}`)
  if (res.status === 404) return null
  return toCourse(await readOrThrow(res))
}

// ขอทั้งรายการครั้งเดียวแล้วกรอง เพราะมี 12 แถว — ยิงทีละรหัสคือหลายคำขอโดยไม่จำเป็น
// และคงลำดับตามที่ผู้ใช้เลือกมา ไม่ใช่ลำดับของฐานข้อมูล
export const fetchSiteCoursesByIds = async (ids) => {
  const wanted = (ids || []).filter(Boolean)
  if (wanted.length === 0) return []
  const all = await fetchSiteCourses()
  const byId = new Map(all.map((c) => [c.id, c]))
  return wanted.map((id) => byId.get(id)).filter(Boolean)
}

// แถบหลักสูตรหน้าแรกเคยเรียงตาม created_at — คงพฤติกรรมเดิมไว้
export const byCreatedAt = (a, b) => String(a.created_at || '').localeCompare(String(b.created_at || ''))
