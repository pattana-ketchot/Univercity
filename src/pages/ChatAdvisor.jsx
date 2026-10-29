import { useState, useRef, useEffect } from 'react'
import AnswerActions from '../components/AnswerActions'
import {
  Briefcase,
  Bot,
  User,
  Send,
  Paperclip,
  Mic,
  Sparkles,
  Code,
  GraduationCap,
  Users
} from 'lucide-react'

// ข้อความบอกสถานะระหว่างรอคำตอบ เปลี่ยนตามเวลาที่ผ่านไป
//
// คำตอบมาถึงทั้งก้อนตอนประมวลผลเสร็จ ไม่ได้ทยอยมา ผู้ใช้จึงเห็นจุดสามจุดค้างอยู่เฉย ๆ
// โดยไม่รู้ว่าระบบยังทำงานอยู่หรือค้างไปแล้ว ยิ่งตอนบริการโมเดลภาษาตอบช้ากว่าปกติ
// ยิ่งรอโดยไม่รู้ว่าเกิดอะไรขึ้น
const WAIT_STAGES = [
  { after: 0, text: 'กำลังอ่านคำถาม' },
  { after: 3, text: 'กำลังค้นข้อมูลจากเอกสารหลักสูตร' },
  { after: 8, text: 'กำลังเรียบเรียงคำตอบ' },
  { after: 20, text: 'ตอนนี้ระบบ AI ตอบช้ากว่าปกติ กำลังรออยู่' },
  { after: 45, text: 'ยังรออยู่ ระบบ AI ใช้เวลานานกว่าปกติมาก หากรอไม่ไหวลองถามใหม่อีกครั้งได้' },
]

// ชุดข้อความสำหรับตัวเลือกที่ช้าเป็นหลักนาที (โมเดลที่ประมวลผลในเครื่อง)
//
// ใช้ชุดเดียวกับของเร็วไม่ได้ เพราะชุดนั้นขึ้นว่า "รอไม่ไหวลองถามใหม่" ตั้งแต่วินาทีที่ 45
// ซึ่งจะบอกให้ผู้ใช้ยอมแพ้ทั้งที่ระบบยังทำงานตามปกติและต้องใช้เวลาอีกหลายนาที
const SLOW_WAIT_STAGES = [
  { after: 0, text: 'กำลังอ่านคำถาม' },
  { after: 5, text: 'กำลังค้นข้อมูลจากเอกสารหลักสูตร' },
  { after: 15, text: 'โมเดลในเครื่องกำลังอ่านเอกสาร ขั้นนี้ใช้เวลาหลายนาที' },
  { after: 120, text: 'ยังทำงานอยู่ โมเดลในเครื่องช้ากว่าแบบคลาวด์มาก รอต่ออีกสักครู่' },
  { after: 240, text: 'ใช้เวลานานเกินที่ตั้งไว้ ถ้าไม่ได้คำตอบ ลองสลับกลับเป็นตัวเลือกที่ตอบเร็ว' },
]

const stageFor = (seconds, stages = WAIT_STAGES) => {
  let msg = stages[0].text
  for (const s of stages) if (seconds >= s.after) msg = s.text
  return msg
}

const ChatAdvisor = () => {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  // ตัวเลือกโมเดลที่หลังบ้านอนุญาต — ว่างไว้ก่อน ถ้าถามไม่ได้ก็ไม่แสดงปุ่มเลย
  // (หลังบ้านรุ่นเก่าไม่มีเส้นทางนี้ หน้าเว็บต้องยังใช้งานได้เหมือนเดิม)
  const [modelOptions, setModelOptions] = useState([])
  const [modelChoice, setModelChoice] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [waitSeconds, setWaitSeconds] = useState(0)
  const messagesContainerRef = useRef(null)
  const inputRef = useRef(null)

  // นับเวลาที่รอ เพื่อเปลี่ยนข้อความสถานะ เริ่มนับใหม่ทุกครั้งที่ส่งคำถาม
  useEffect(() => {
    if (!isLoading) {
      setWaitSeconds(0)
      return
    }
    const started = Date.now()
    const timer = setInterval(() => {
      setWaitSeconds(Math.floor((Date.now() - started) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [isLoading])

  // Scroll only the chat's own message list, not scrollIntoView() — which walks
  // every scrollable ancestor (including the page itself) and was dragging the
  // whole page down every time the AI replied, not just the chat box internally.
  const scrollToBottom = () => {
    const el = messagesContainerRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // ถามหลังบ้านว่ามีตัวเลือกอะไรให้เลือกบ้าง ไม่ hardcode ไว้ที่หน้าเว็บ
  // เพราะรายการขึ้นกับว่าเซิร์ฟเวอร์ตั้งคีย์อะไรไว้ และเปลี่ยนได้โดยไม่ต้อง build ใหม่
  useEffect(() => {
    let cancelled = false
    fetch('/api/ai-options')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.options?.length) return
        setModelOptions(data.options)
        setModelChoice(data.options.find((o) => o.default)?.id || data.options[0].id)
      })
      .catch(() => {})   // ถามไม่ได้ = ไม่แสดงปุ่ม ไม่ใช่แสดงข้อผิดพลาดใส่ผู้ใช้
    return () => { cancelled = true }
  }, [])

  const chosenOption = modelOptions.find((o) => o.id === modelChoice)

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    }

    const history = [...messages, userMessage]
    setMessages(history)
    setInputText('')
    setIsLoading(true)

    let started = false

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          // ส่งเป็น id ของตัวเลือก ไม่ใช่ชื่อรุ่น · หลังบ้านปฏิเสธ id ที่ไม่รู้จักแล้ว
          // ถอยไปใช้ค่าที่ผู้ดูแลตั้งไว้ จึงส่งไปได้แม้หลังบ้านยังไม่รองรับ
          ...(modelChoice ? { model_choice: modelChoice } : {})
        })
      })

      if (!response.ok || !response.body) {
        const errText = await response.text().catch(() => '')
        throw new Error(errText || 'AI request failed')
      }

      // ที่มาของคำตอบมากับ header เพราะ body เป็น plain text stream ล้วนๆ อยู่แล้ว
      // ใส่ปนใน body ไม่ได้
      //
      // เดิมโค้ดตรงนี้อ่าน header ชื่อ X-RAG-Sources ซึ่ง FastAPI ไม่เคยส่งเลย
      // (เป็น header ของอีกระบบที่ไม่ได้ใช้กับ /api/chat) ชิป "อ้างอิงจาก:" จึงไม่เคยขึ้น
      // ตอนนี้อ่านจาก header ที่หลังบ้านส่งมาจริง
      //
      // ค่าที่เป็นภาษาไทยถูกหุ้ม base64 มา เพราะ header ส่งข้ามได้เฉพาะ latin-1
      // atob() คืนค่าเป็น binary string ทีละไบต์ ต้องแปลงเป็น byte array แล้วถอดด้วย
      // TextDecoder('utf-8') อีกที ไม่งั้นภาษาไทย (multi-byte) จะอ่านไม่ออก
      const decodeHeader = (name) => {
        try {
          const raw = response.headers.get(name)
          if (!raw) return ''
          const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0))
          return new TextDecoder('utf-8').decode(bytes)
        } catch {
          return ''
        }
      }

      const pageRaw = Number.parseInt(response.headers.get('X-Source-Page') || '', 10)
      const source = {
        documentId: response.headers.get('X-Source-Document') || '',
        page: Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : null,
        title: decodeHeader('X-Source-Title'),
        programme: decodeHeader('X-Source-Programme')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let content = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        content += decoder.decode(value, { stream: true })

        if (!started) {
          started = true
          setIsLoading(false)
          setMessages(prev => [...prev, { role: 'assistant', content, source, timestamp: new Date() }])
        } else {
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { ...updated[updated.length - 1], content }
            return updated
          })
        }
      }

      if (!started) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'ขออภัยครับ ไม่ได้รับคำตอบจาก AI กรุณาลองใหม่อีกครั้ง',
          timestamp: new Date()
        }])
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'ขออภัยครับ ระบบ AI ขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = () => {
    sendMessage(inputText)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickPrompt = (prompt) => {
    sendMessage(prompt)
  }

  const quickPrompts = [
    { icon: Code, text: 'สาขาไหนเหมาะกับคนชอบทำงานกับคอมพิวเตอร์' },
    { icon: Briefcase, text: 'เรียนจบแล้วทำอาชีพอะไรได้บ้าง' },
    { icon: Users, text: 'สาขาไหนเหมาะกับคนชอบทำงานด้านบริการ' },
    { icon: GraduationCap, text: 'เรียนจบแล้วทำอาชีพอะไรได้บ้างในสายนี้' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
        <div className="chat-shell flex">
          {/* Chat Window */}
          <main className="flex-1 bg-white border border-gray-300 rounded-xl flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-pnru" />
                คุยกับ SCI Advisor
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                ผู้ช่วยแนะแนวสาขา หลักสูตร และอาชีพ • <span className="text-green-600">พร้อมให้คำปรึกษา</span>
              </p>
            </div>

            {/* Messages Area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
              {messages.length === 0 ? (
                // Empty State
                /* min-h แทน h เพราะถ้าเนื้อหาสูงกว่ากล่อง justify-center จะดันส่วนบนล้นขึ้นไปจนเลื่อนไปอ่านไม่ได้ */
                <div className="min-h-full flex flex-col items-center justify-center text-center">
                  <Sparkles className="w-16 h-16 text-pnru mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    คุณต้องการความช่วยเหลือไหม?
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md">
                    ถามเกี่ยวกับสาขา หลักสูตร อาชีพ และการเตรียมตัวในอนาคตได้เลย
                  </p>

                  {/* Quick Prompts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                    {quickPrompts.map((prompt, index) => {
                      const IconComponent = prompt.icon
                      return (
                        <button
                          key={index}
                          onClick={() => handleQuickPrompt(prompt.text)}
                          className="p-4 border-2 border-gray-200 rounded-lg hover:border-pnru hover:bg-[#E8F5F1] transition-all text-left group"
                        >
                          <IconComponent className="w-6 h-6 text-pnru mb-2" />
                          <p className="text-sm text-gray-700 group-hover:text-gray-900">
                            {prompt.text}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                // Messages
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* บนมือถือให้ฟองข้อความกว้างขึ้น ไม่งั้นปุ่ม "ข้อมูลเพิ่มเติม" เหลือกว้างแค่ ~160px
                          จอ sm ขึ้นไปใช้ 80% เท่าเดิมตามดีไซน์ */}
                      <div className={`flex gap-3 max-w-[92%] sm:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === 'user' ? 'bg-gray-300' : 'bg-[#E8F5F1]'
                        }`}>
                          {msg.role === 'user' ? (
                            <User className="w-5 h-5 text-gray-600" />
                          ) : (
                            <Bot className="w-5 h-5 text-pnru" />
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`px-4 py-3 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-pnru text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <div className="text-sm whitespace-pre-wrap">{msg.content}</div>

                          {msg.role === 'assistant' && <AnswerActions source={msg.source} />}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Loading Indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[80%]">
                        <div className="w-8 h-8 rounded-full bg-[#E8F5F1] flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-pnru" />
                        </div>
                        <div className="px-4 py-3 bg-gray-100 rounded-lg min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1 flex-shrink-0">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm text-gray-600 break-words">
                              {stageFor(waitSeconds, (chosenOption?.wait_s || 0) >= 120 ? SLOW_WAIT_STAGES : WAIT_STAGES)}
                            </span>
                          </div>
                          {waitSeconds >= 3 && (
                            <p className="mt-1 text-xs text-gray-400">รอมาแล้ว {waitSeconds} วินาที</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat Composer */}
            <div className="p-2.5 sm:p-4 border-t border-gray-200 bg-white">
              {/* เลือกโมเดลที่จะตอบ — แสดงเฉพาะเมื่อหลังบ้านเปิดให้เลือกมากกว่าหนึ่งตัว
                  ชื่อรุ่นและคำอธิบายของแต่ละตัวมาจากหลังบ้าน ไม่ได้เขียนทับไว้ที่นี่

                  แถวนี้ขึ้นบรรทัดใหม่ได้เมื่อที่ไม่พอ — วัดบนจอ 375px ถ้าบังคับให้อยู่บรรทัดเดียว
                  ชื่อรุ่นกิน 102px แล้วคำอธิบายเหลือ 31px คือเห็นแต่จุดไข่ปลา */}
              {modelOptions.length > 1 && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2 text-xs text-gray-600">
                  <label htmlFor="model-choice" className="flex-shrink-0">ตอบด้วย</label>
                  <select
                    id="model-choice"
                    value={modelChoice}
                    onChange={(e) => setModelChoice(e.target.value)}
                    disabled={isLoading}
                    className="border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-pnru disabled:opacity-60"
                  >
                    {modelOptions.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </select>
                  {/* ชื่อรุ่นที่เขียนคำตอบจริง — มาจากหลังบ้านเหมือนคำอธิบาย ไม่ได้เขียนทับไว้ที่นี่
                      ผู้ดูแลเปลี่ยนรุ่นของตัวเลือกใด ชื่อที่ผู้ใช้เห็นก็เปลี่ยนตามเองโดยไม่ต้อง build ใหม่
                      ไม่ย่อตัวเมื่อที่แคบ เพราะเป็นข้อมูลที่ผู้ใช้ขอให้บอก ส่วนคำอธิบายย่อได้ */}
                  {chosenOption?.model && (
                    <span
                      className="flex-shrink-0 font-mono text-[11px] text-gray-500"
                      title={`รุ่นที่ใช้เขียนคำตอบ: ${chosenOption.model}`}
                    >
                      {chosenOption.model}
                    </span>
                  )}
                  {chosenOption?.hint && (
                    <span className="truncate" title={chosenOption.hint}>· {chosenOption.hint}</span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* แนบไฟล์/อัดเสียง ยังเป็นปุ่มเปล่ารอฟีเจอร์ — ซ่อนบนมือถือเพื่อคืนความกว้างให้ช่องพิมพ์
                    ถ้าโชว์ทั้งสองปุ่มที่ขนาดนิ้ว 44px ช่องพิมพ์บนจอ 360px จะเหลือแค่ ~162px */}
                <button
                  disabled
                  className="hidden sm:flex w-11 h-11 items-center justify-center text-gray-300 cursor-not-allowed transition-colors flex-shrink-0"
                  aria-label="แนบไฟล์ (เร็วๆ นี้)"
                  title="เร็วๆ นี้"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <div className="flex-1 relative min-w-0">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="สอบถาม SCI Advisor"
                    rows="1"
                    className="w-full px-3 sm:px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru resize-none max-h-32"
                    style={{ minHeight: '44px' }}
                  />
                </div>

                <button
                  disabled
                  className="hidden sm:flex w-11 h-11 items-center justify-center text-gray-300 cursor-not-allowed transition-colors flex-shrink-0"
                  aria-label="อัดเสียง (เร็วๆ นี้)"
                  title="เร็วๆ นี้"
                >
                  <Mic className="w-5 h-5" />
                </button>

                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isLoading}
                  className="w-11 h-11 flex items-center justify-center bg-pnru text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  aria-label="ส่งข้อความ"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default ChatAdvisor
