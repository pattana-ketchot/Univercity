// แปลงตัวเลขที่หลังบ้าน "คำนวณไปแล้ว" ให้เป็นประโยคที่นักเรียนอ่านรู้เรื่อง
//
// กฎของไฟล์นี้: **ไม่คำนวณคะแนนใหม่ และไม่เติมตัวเลขที่หลังบ้านไม่ได้ส่งมา**
// ทุกค่าที่แสดงมาจาก card.why / result.scoringDetail ตรง ๆ ที่นี่ทำแค่จัดถ้อยคำ
// (การแปลงเปอร์เซ็นต์เขียนเป็นสูตรให้อ่านตาม ไม่ได้คิดเลขซ้ำเพื่อเอามาแสดงแทนค่าจริง)
//
// ของเก่าที่ยังไม่มี why (หลังบ้านรุ่นก่อน) ต้องไม่พัง — ทุกฟังก์ชันคืนรายการว่าง
// แล้วหน้าเว็บจะไม่แสดงบล็อกนี้เลย ดีกว่าเดาตัวเลขแล้วบอกผิด

export const PERCENT_DISCLAIMER =
  'เปอร์เซ็นต์นี้คือระดับความสอดคล้องตามวิธีคำนวณของระบบ ไม่ใช่โอกาสสอบติด ' +
  'ไม่ใช่การรับประกันว่าจะเรียนสำเร็จ และคะแนนของแต่ละสาขาคิดแยกกัน'

const n = (v, digits = 2) =>
  typeof v === 'number' && Number.isFinite(v) ? v.toFixed(digits) : null

const pageOf = (item) => (item.page ? `หน้า ${item.page}` : 'ไม่ระบุหน้า')

/** คำตอบของผู้ใช้ที่เข้าไปอยู่ในการคิดคะแนนจริง */
export const answerLines = (detail) =>
  (detail?.answersUsed || []).map((row) => `${row.label}: ${row.values.join(', ')}`)

/** จุดที่ตรงกับเนื้อหาหลักสูตร — ไฟล์และหน้าที่ถูกใช้เป็นหลักฐานของสาขานี้ */
export const matchLines = (why) =>
  (why?.evidence || []).map((item) => {
    const sim = n(item.similarity)
    const where = `${item.file} · ${pageOf(item)}`
    return sim ? `${where} (ความใกล้เคียง ${sim})` : where
  })

/** ส่วนที่ยังไม่พบข้อมูลเชื่อมโยง — เขียนจากค่าที่วัดได้ ไม่ใช่การคาดเดา */
export const gapLines = (why, detail) => {
  if (!why) return []
  const lines = []
  const floor = n(why.percent_floor)

  if (!why.evidence?.length) {
    lines.push('ยังไม่พบหน้าเอกสารของสาขานี้ที่เชื่อมโยงกับคำตอบของคุณ')
  }
  if (floor && typeof why.content_similarity === 'number' && why.content_similarity < why.percent_floor) {
    lines.push(`เนื้อหาในเอกสารยังใกล้เคียงคำตอบของคุณน้อย (${n(why.content_similarity)} ต่ำกว่าเกณฑ์ที่ระบบเริ่มนับ ${floor})`)
  }
  if (floor && typeof why.title_similarity === 'number' && why.title_similarity < why.percent_floor) {
    lines.push(`ชื่อสาขายังไม่ตรงกับคำตอบของคุณ (${n(why.title_similarity)} ต่ำกว่าเกณฑ์ที่ระบบเริ่มนับ ${floor})`)
  }
  const perCourse = detail?.chunksPerCourse
  if (perCourse && typeof why.chunks_used === 'number' && why.chunks_used < perCourse) {
    lines.push(`เอกสารของสาขานี้มีเนื้อหาให้เทียบ ${why.chunks_used} ส่วน น้อยกว่า ${perCourse} ส่วนที่ระบบใช้ตามปกติ`)
  }
  if (why.no_evidence) {
    lines.push('ไม่พบข้อความในเอกสารที่ยืนยันเหตุผลของสาขานี้ได้ ระบบจึงไม่ใช้คำอธิบายจาก AI')
  } else if (why.reason_from_model === false) {
    lines.push('คำอธิบายของสาขานี้ไม่ได้มาจาก AI ในรอบนี้ แต่คะแนนด้านบนคำนวณครบตามปกติ')
  }
  for (const row of detail?.answersNotScored || []) {
    lines.push(`${row.label} (${row.values.join(', ')}) ไม่ได้ถูกใช้คิดคะแนน ใช้เฉพาะตอนเขียนคำอธิบาย`)
  }
  return lines
}

/** วิธีแปลงความใกล้เคียงเป็นเปอร์เซ็นต์ — เขียนตามสูตรที่หลังบ้านใช้คำนวณ */
export const formulaLines = (why) => {
  if (!why) return []
  const lines = []
  const content = n(why.content_similarity)
  const title = n(why.title_similarity)
  const blended = n(why.blended_score)
  const weight = why.title_weight

  if (content && title && blended && typeof weight === 'number') {
    lines.push(
      `เนื้อหาเอกสาร ${content} × ${n(1 - weight)} + ชื่อสาขา ${title} × ${n(weight)} = ${blended}`
    )
  }
  const floor = n(why.percent_floor)
  const ceiling = n(why.percent_ceiling)
  if (blended && floor && ceiling && typeof why.percent === 'number') {
    lines.push(`เทียบในช่วง ${floor} – ${ceiling} ของระบบ แล้วแปลงเป็น ${why.percent}%`)
  }
  return lines
}

export const hasScoreDetail = (why) =>
  Boolean(why) && (formulaLines(why).length > 0 || matchLines(why).length > 0)
