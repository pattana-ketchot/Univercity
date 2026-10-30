// บอกผู้ใช้ว่าอะไรในผลชุดนี้มาจากโมเดล และอะไรมาจากเกณฑ์ของระบบ
//
// **ชื่อรุ่นมาจากหลังบ้านเท่านั้น** ที่นี่ไม่เขียนชื่อรุ่นใดไว้เลย เพราะผู้ดูแลเปลี่ยนรุ่นได้
// ตลอด และเส้นทาง Gemini มีโมเดลในเครื่องรับช่วงต่อเมื่อเจ้าหลักล้ม — ค่าที่หลังบ้านส่งมา
// คือตัวที่ทำงานให้คำขอนั้นจริง ไม่ใช่ค่าที่ตั้งไว้
//
// ถ้อยคำต้องไม่พูดเกินกว่าที่ข้อมูลรับประกัน: หลังบ้านรู้ว่า "รุ่นไหนตอบสำเร็จบ้าง"
// แต่ไม่ได้ตามรอยว่าคำตอบแต่ละครั้งถูกนำไปแสดงหรือถูกตัดทิ้งที่ด่านตรวจข้อความอ้างอิง
// ป้ายจึงบอกว่า "ประมวลผลคำขอนี้" ไม่ใช่ "เขียนข้อความนี้"
//
// engine ไม่มีมาเลย (หลังบ้านรุ่นเก่า) = ไม่แสดงอะไร ดีกว่าเดาแล้วบอกผิด

const PROVIDER_LABEL = { gemini: 'Gemini', ollama: 'โมเดลในเครื่อง' }

const SCORING_TEXT = {
  embedding_and_rules:
    'คะแนนคำนวณด้วยสูตรและเกณฑ์ของระบบ จากความใกล้เคียงระหว่างคำตอบของคุณกับเนื้อหาในเอกสารหลักสูตร',
  document_extraction:
    'ข้อมูลในตารางสกัดจากเอกสาร มคอ.2 ของแต่ละสาขาด้วยโมเดลภาษา ทีละสาขาแยกกัน ส่วนค่าเทอมมาจากประกาศของคณะ ไม่ผ่านโมเดล'
}

// โมเดลเวกเตอร์ทำคนละหน้าที่กันในแต่ละหน้า จึงเรียกชื่อให้ตรงกับงานที่มันทำจริง
// หน้าแนะนำสาขาใช้มัน "ให้คะแนน" ส่วนหน้าเปรียบเทียบใช้มัน "หาเนื้อหาที่เกี่ยวข้อง"
const EMBED_LABEL = {
  embedding_and_rules: 'โมเดลเทียบความคล้าย',
  document_extraction: 'โมเดลค้นหาเนื้อหาในเอกสาร'
}

const modelName = (used) => (used.model && used.model !== '?' ? used.model : 'ไม่มีข้อมูลรุ่น')
const providerName = (used) =>
  PROVIDER_LABEL[used.provider] || used.provider || 'ผู้ให้บริการที่ไม่ทราบชื่อ'

export const engineLines = (engine) => {
  if (!engine) return []
  const lines = []
  const used = engine.explanation
  const embedding = engine.embedding

  // รุ่นที่เทียบความคล้าย — คนละตัวกับรุ่นที่เขียนข้อความ และหลังบ้านส่งมาเฉพาะผลที่
  // คะแนนมาจากเวกเตอร์จริง ผลที่ไม่ได้ใช้เวกเตอร์จะไม่มีบรรทัดนี้
  if (embedding) {
    const what = EMBED_LABEL[engine.scoring] || 'โมเดลแปลงข้อความเป็นเวกเตอร์'
    lines.push(`${what}: ${modelName(embedding)} · ${providerName(embedding)}`)
  }

  if (engine.scoring && SCORING_TEXT[engine.scoring]) lines.push(SCORING_TEXT[engine.scoring])

  if (used) {
    // รุ่นที่หลังบ้านบอกว่าไม่รู้ ("?" หรือว่าง) ต้องไม่ถูกเติมด้วยค่าตั้งต้นของหน้าเว็บ
    //
    // writers คือทุกรุ่นที่ "ตอบสำเร็จ" ในคำขอนี้ ซึ่งไม่เท่ากับทุกรุ่นที่ได้เขียนข้อความ
    // บนหน้า — บางคำตอบถูกตัดทิ้งที่ด่านตรวจข้อความอ้างอิงหรือถูกแทนด้วยข้อความ
    // มาตรฐานของระบบ ป้ายจึงต้องพูดแค่ว่า "ประมวลผลคำขอนี้" ทั้งกรณีรุ่นเดียวและ
    // หลายรุ่น ไม่อ้างว่าเป็นผู้เขียนข้อความที่เห็นอยู่
    const writers = Array.isArray(engine.writers) ? engine.writers : []
    if (writers.length > 0) {
      lines.push(
        'โมเดลภาษาที่ใช้ประมวลผลคำขอนี้: ' +
          writers.map((w) => `${providerName(w)} · ${modelName(w)}`).join(' และ ')
      )
    } else {
      // หลังบ้านรุ่นก่อนที่ยังไม่ส่ง writers — มีแค่ตัวล่าสุด บอกได้เท่าที่รู้
      lines.push(`โมเดลภาษาที่ใช้ประมวลผลคำขอนี้: ${providerName(used)} · ${modelName(used)}`)
    }
  } else {
    // ไม่ได้ใช้ข้อความจากโมเดลเลย — ต้องบอกตามจริง ห้ามติดป้ายชื่อรุ่นแทน
    lines.push('ไม่ได้ใช้ข้อความจาก AI ในผลชุดนี้ · ประมวลผลจากข้อมูลและเกณฑ์ของระบบ')
  }

  return lines
}

const EngineNote = ({ engine, className = '' }) => {
  const lines = engineLines(engine)
  if (lines.length === 0) return null

  return (
    <p className={`text-xs text-gray-500 leading-relaxed ${className}`}>
      {lines.map((line, index) => (
        <span key={index} className="block">{line}</span>
      ))}
    </p>
  )
}

export default EngineNote
