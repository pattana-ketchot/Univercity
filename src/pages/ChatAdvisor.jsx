import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

const ChatAdvisor = () => {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesContainerRef = useRef(null)
  const inputRef = useRef(null)

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
          messages: history.map(({ role, content }) => ({ role, content }))
        })
      })

      if (!response.ok || !response.body) {
        const errText = await response.text().catch(() => '')
        throw new Error(errText || 'AI request failed')
      }

      // ข้อมูลอ้างอิง (RAG) มากับ header แบบ base64 เพราะ body เป็น plain text stream
      // ล้วนๆ อยู่แล้ว ใส่ไว้ใน JSON ปนกับ body ไม่ได้ — atob() คืนค่าเป็น binary
      // string ทีละไบต์ ต้องแปลงเป็น byte array แล้วถอดด้วย TextDecoder('utf-8')
      // อีกที ไม่งั้นข้อความภาษาไทย (multi-byte) จะกลายเป็นตัวอักษรอ่านไม่ออก
      let sources = []
      try {
        const raw = response.headers.get('X-RAG-Sources')
        if (raw) {
          const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0))
          sources = JSON.parse(new TextDecoder('utf-8').decode(bytes))
        }
      } catch {
        sources = []
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
          setMessages(prev => [...prev, { role: 'assistant', content, sources, timestamp: new Date() }])
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

      <div className="max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex h-[calc(100vh-180px)]">
          {/* Chat Window */}
          <main className="flex-1 bg-white border border-gray-300 rounded-xl flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-pnru" />
                คุยกับ SCI Advisor
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                ผู้ช่วยแนะแนวสาขา หลักสูตร และอาชีพ • <span className="text-green-600">พร้อมให้คำปรึกษา</span>
              </p>
            </div>

            {/* Messages Area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6">
              {messages.length === 0 ? (
                // Empty State
                <div className="h-full flex flex-col items-center justify-center text-center">
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
                      <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
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

                          {msg.role === 'assistant' && msg.sources?.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap items-center gap-1.5">
                              <span className="text-xs text-gray-400">อ้างอิงจาก:</span>
                              {msg.sources.map((s) => (
                                s.source_type === 'major' ? (
                                  <Link
                                    key={`${s.source_type}-${s.source_id}`}
                                    to={`/courses/${s.source_id}`}
                                    className="text-xs text-pnru underline hover:no-underline"
                                  >
                                    {s.title}
                                  </Link>
                                ) : (
                                  <span key={`${s.source_type}-${s.source_id}`} className="text-xs text-gray-500">
                                    {s.title}
                                  </span>
                                )
                              ))}
                            </div>
                          )}
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
                        <div className="px-4 py-3 bg-gray-100 rounded-lg">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat Composer */}
            <div className="p-2.5 sm:p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  disabled
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-300 cursor-not-allowed transition-colors flex-shrink-0"
                  aria-label="แนบไฟล์ (เร็วๆ นี้)"
                  title="เร็วๆ นี้"
                >
                  <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <div className="flex-1 relative min-w-0">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="สอบถาม SCI Advisor"
                    rows="1"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru resize-none max-h-32"
                    style={{ minHeight: '42px' }}
                  />
                </div>

                <button
                  disabled
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-300 cursor-not-allowed transition-colors flex-shrink-0"
                  aria-label="อัดเสียง (เร็วๆ นี้)"
                  title="เร็วๆ นี้"
                >
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isLoading}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-pnru text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  aria-label="ส่งข้อความ"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
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
