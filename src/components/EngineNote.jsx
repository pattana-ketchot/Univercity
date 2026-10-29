// บอกผู้ใช้ว่าอะไรในผลชุดนี้มาจากโมเดล และอะไรมาจากเกณฑ์ของระบบ
//
// **ชื่อรุ่นมาจากหลังบ้านเท่านั้น** ที่นี่ไม่เขียนชื่อรุ่นใดไว้เลย เพราะผู้ดูแลเปลี่ยนรุ่นได้
// ตลอด และเส้นทาง Gemini มีโมเดลในเครื่องรับช่วงต่อเมื่อเจ้าหลักล้ม — ค่าที่หลังบ้านส่งมา
// คือตัวที่เขียนข้อความให้คำขอนั้นจริง ไม่ใช่ค่าที่ตั้งไว้
//
// engine ไม่มีมาเลย (หลังบ้านรุ่นเก่า) = ไม่แสดงอะไร ดีกว่าเดาแล้วบอกผิด

const PROVIDER_LABEL = { gemini: 'Gemini', ollama: 'โมเดลในเครื่อง' }

const SCORING_TEXT = {
  embedding_and_rules:
    'คะแนนคำนวณด้วยสูตรและเกณฑ์ของระบบ จากความใกล้เคียงระหว่างคำตอบของคุณกับเนื้อหาในเอกสารหลักสูตร'
}

export const engineLines = (engine) => {
  if (!engine) return []
  const lines = []
  const used = engine.explanation
  const embedding = engine.embedding

  // รุ่นที่เทียบความคล้าย — คนละตัวกับรุ่นที่เขียนข้อความ และหลังบ้านส่งมาเฉพาะผลที่
  // คะแนนมาจากเวกเตอร์จริง ผลที่ไม่ได้ใช้เวกเตอร์จะไม่มีบรรทัดนี้
  if (embedding) {
    const provider = PROVIDER_LABEL[embedding.provider] || embedding.provider || 'ผู้ให้บริการที่ไม่ทราบชื่อ'
    const model = embedding.model && embedding.model !== '?' ? embedding.model : 'ไม่มีข้อมูลรุ่น'
    lines.push(`โมเดลเทียบความคล้าย: ${model} · ${provider}`)
  }

  if (engine.scoring && SCORING_TEXT[engine.scoring]) lines.push(SCORING_TEXT[engine.scoring])

  if (used) {
    const provider = PROVIDER_LABEL[used.provider] || used.provider || 'ผู้ให้บริการที่ไม่ทราบชื่อ'
    // รุ่นที่หลังบ้านบอกว่าไม่รู้ ("?" หรือว่าง) ต้องไม่ถูกเติมด้วยค่าตั้งต้นของหน้าเว็บ
    const model = used.model && used.model !== '?' ? used.model : 'ไม่มีข้อมูลรุ่น'
    lines.push(`คำอธิบายโดย: ${provider} · ${model}`)
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
