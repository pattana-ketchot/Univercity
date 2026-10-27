// ใส่นามสกุล .js ไว้ชัดเจน (ต่างจากไฟล์อื่นในโปรเจกต์) เพราะชุดทดสอบของไฟล์นี้รันด้วย
// `node --test` ตรงๆ ซึ่งไม่ resolve นามสกุลให้เองเหมือน Vite — ดู test/careerMerge.test.mjs
import { resolveProgramme } from '../data/programmeLinks.js'

// อาชีพของหลักสูตรมาจากสองที่ และต้องไม่ปนกัน
//
// 1. คอลัมน์ careers ของฐานข้อมูลหน้าเว็บ — ทุกแถวเป็น '{}' (ว่าง) ยังไม่มีใครกรอก
//    หน้า "อาชีพหลังจบ" จึงขึ้นว่า "ยังไม่มีข้อมูลหลักสูตร" มาตลอด ทั้งที่ข้อมูลมีอยู่
// 2. /api/career-lists — รายการที่ตรวจกับเอกสาร มคอ.2 แล้วเผยแพร่ ทุกรายการมีไฟล์และเลขหน้า
//
// ใช้ข้อ 2 เป็นหลักเพราะตรวจกับเอกสารต้นทางแล้ว · ข้อ 1 ใช้ต่อเมื่อมีคนกรอกไว้จริง
//
// ชื่อหลักสูตรสองฝั่งไม่เหมือนกัน (ฝั่งหลังบ้านเป็นชื่อเต็มพร้อมปี พ.ศ. ฝั่งหน้าเว็บเป็นชื่อสาขาสั้น)
// จึงจับคู่ผ่าน resolveProgramme() ซึ่งเป็นตารางที่ยืนยันแล้ว ไม่ใช่เทียบข้อความตรงๆ หรือเดา
export const mergeCareers = (rows, programmes) => {
  const published = new Map()
  ;(programmes || []).forEach((p) => {
    const link = resolveProgramme(p.course_title)
    if (!link) return
    const careers = p.careers || []
    // หลักสูตรเดียวกันมีได้หลายฉบับปี — เก็บฉบับที่มีรายการมากที่สุดไว้แสดง
    const current = published.get(link.courseId)
    if (current && current.careers.length >= careers.length) return
    published.set(link.courseId, { careers, source: p.source || null })
  })

  return (rows || []).map((c) => {
    const hit = published.get(c.id)
    if (hit && hit.careers.length > 0) {
      return { ...c, careers: hit.careers, source: hit.source }
    }
    return { ...c, careers: c.careers || [], source: null }
  })
}

// หลักสูตรที่มีรายการอาชีพขึ้นก่อน ที่ยังไม่มีไปต่อท้าย — ไม่ซ่อนหลักสูตรใดทิ้ง
export const byCareersThenTitle = (a, b) => {
  const diff = (b.careers.length > 0) - (a.careers.length > 0)
  return diff !== 0 ? diff : (a.title || '').localeCompare(b.title || '', 'th')
}
