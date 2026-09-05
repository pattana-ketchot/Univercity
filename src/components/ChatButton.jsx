import { Link, useLocation } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'

// ปุ่มลอยมุมขวาล่าง กดแล้วไปหน้าแชทกับ Sci Advisor
// ไม่แสดงตอนอยู่ในหน้าแชทอยู่แล้ว กันซ้อนทับปุ่มส่งข้อความ/ไมค์บนจอเล็ก
const ChatButton = () => {
  const { pathname } = useLocation()
  if (pathname === '/chat') return null

  return (
    <Link
      to="/chat"
      aria-label="แชทกับ Sci Advisor"
      className="fixed right-6 bottom-6 z-50 flex h-[52px] w-[52px] sm:h-[60px] sm:w-[60px] items-center justify-center rounded-full bg-pnru text-white shadow-lg transition-transform duration-200 hover:scale-105"
    >
      <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
    </Link>
  )
}

export default ChatButton
