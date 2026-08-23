import { useState, useRef, useEffect } from 'react'
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

// Shared course data
const coursesData = [
  {
    id: 1,
    name: 'วิทยาการคอมพิวเตอร์',
    careers: ['นักพัฒนาซอฟต์แวร์', 'นักวิเคราะห์ระบบ', 'นักพัฒนาเกม', 'นักวิทยาศาสตร์ข้อมูล']
  },
  {
    id: 2,
    name: 'เทคโนโลยีสารสนเทศ',
    careers: ['ผู้ดูแลระบบสารสนเทศ', 'วิศวกรเครือข่าย', 'ผู้ดูแลฐานข้อมูล']
  },
  {
    id: 3,
    name: 'คณิตศาสตร์',
    careers: ['นักคณิตศาสตร์', 'นักวิเคราะห์ข้อมูล', 'นักสถิติ']
  }
]

const ChatAdvisor = () => {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mock AI Response
  const getMockResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase()

    if (lowerMsg.includes('คอมพิวเตอร์') || lowerMsg.includes('ไอที') || lowerMsg.includes('it')) {
      return `สำหรับคนที่สนใจงานด้านคอมพิวเตอร์ เรามีหลักสูตรที่เหมาะสม:

**1. วิทยาการคอมพิวเตอร์**
- เน้นการพัฒนาซอฟต์แวร์ AI และ Data Science
- อาชีพ: นักพัฒนาซอฟต์แวร์, นักวิเคราะห์ระบบ, นักวิทยาศาสตร์ข้อมูล

**2. เทคโนโลยีสารสนเทศ**
- เน้นการจัดการระบบ เครือข่าย และความปลอดภัย
- อาชีพ: ผู้ดูแลระบบ, วิศวกรเครือข่าย, นักวิเคราะห์ความปลอดภัย

คุณสนใจสาขาไหนเป็นพิเศษครับ?`
    }

    if (lowerMsg.includes('อาชีพ') || lowerMsg.includes('ทำงาน')) {
      return `หลักสูตรในคณะวิทยาศาสตร์และเทคโนโลยีมีโอกาสในการทำงานที่หลากหลาย:

**สายเทคโนโลยี:**
• นักพัฒนาซอฟต์แวร์
• วิศวกรเครือข่าย
• นักวิเคราะห์ข้อมูล

**สายวิทยาศาสตร์:**
• นักวิจัย
• นักวิทยาศาสตร์สิ่งแวดล้อม
• นักเทคโนโลยีอาหาร

**สายสุขภาพ:**
• แพทย์แผนไทย
• นักวิทยาศาสตร์เครื่องสำอาง

ต้องการทราบรายละเอียดเพิ่มเติมหรือไม่ครับ?`
    }

    if (lowerMsg.includes('บริการ') || lowerMsg.includes('ช่วยเหลือ')) {
      return `สำหรับคนที่ชอบทำงานด้านบริการและช่วยเหลือผู้อื่น แนะนำสาขา:

**การแพทย์แผนไทยประยุกต์**
- ดูแลสุขภาพผู้ป่วยด้วยภูมิปัญญาไทย
- มีโอกาสเปิดคลินิกเป็นของตัวเอง

**เทคโนโลยีอาหารและความเป็นผู้ประกอบการ**
- สร้างผลิตภัณฑ์อาหารเพื่อสุขภาพ
- รับใช้สังคมผ่านธุรกิจอาหาร

คุณสนใจด้านไหนมากกว่ากันครับ?`
    }

    return `ขอบคุณสำหรับคำถามครับ 😊

คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยราชภัฏพระนคร มีหลักสูตรที่หลากหลาย ทั้งสาย:
- คอมพิวเตอร์และเทคโนโลยี
- วิทยาศาสตร์สุขภาพ
- วิทยาศาสตร์และสิ่งแวดล้อม
- ธุรกิจและการจัดการ

คุณสนใจสาขาไหนเป็นพิเศษ หรือต้องการทราบอาชีพหลังจบในสาขาใดครับ?`
  }

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    // Simulate AI delay
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant',
        content: getMockResponse(text),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
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
            <div className="flex-1 overflow-y-auto p-6">
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

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Chat Composer */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <button
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  aria-label="แนบไฟล์"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="สอบถาม SCI Advisor"
                    rows="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru resize-none max-h-32"
                    style={{ minHeight: '42px' }}
                  />
                </div>

                <button
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  aria-label="อัดเสียง"
                >
                  <Mic className="w-5 h-5" />
                </button>

                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isLoading}
                  className="w-10 h-10 flex items-center justify-center bg-pnru text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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
