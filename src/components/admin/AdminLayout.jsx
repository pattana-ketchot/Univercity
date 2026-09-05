import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  LayoutDashboard,
  GraduationCap,
  Newspaper,
  Rss,
  Users,
  Settings,
  ScrollText,
  LogOut,
  Menu,
  Crown,
  PenLine,
  Search,
  Bell,
  ChevronDown,
  Leaf,
  BrainCircuit,
  Bot,
  Clock,
  User
} from 'lucide-react'
import { ToastProvider } from './Toast'

const roleLabel = { admin: 'ผู้ดูแลระบบ', editor: 'ผู้แก้ไขเนื้อหา', user: 'ผู้ใช้ทั่วไป' }

const ACTIVITY_META = {
  news: { icon: Newspaper, label: 'ข่าวสาร' },
  course: { icon: GraduationCap, label: 'หลักสูตร' },
  knowledge: { icon: Bot, label: 'คลังความรู้' }
}

const TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const formatThaiDate = (value) => {
  if (!value) return '-'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return String(value)
  return `${dt.getDate()} ${TH_MONTHS[dt.getMonth()]} ${dt.getFullYear() + 543}`
}

// ดึงกิจกรรมล่าสุดจากข่าว/หลักสูตร/คลังความรู้ มารวมกัน เรียงตามวันที่ใหม่สุด เอา 5 รายการแรก
const fetchRecentActivity = async () => {
  const [newsRes, coursesRes, knowledgeRes] = await Promise.all([
    supabase.from('news').select('id, title, date').order('date', { ascending: false }).limit(5),
    supabase.from('courses').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('knowledge_articles').select('id, title, created_at').order('created_at', { ascending: false }).limit(5)
  ])

  return [
    ...(newsRes.data || []).map((n) => ({
      key: `news-${n.id}`, type: 'news', title: n.title, at: n.date, to: `/admin/news/edit/${n.id}`
    })),
    ...(coursesRes.data || []).map((c) => ({
      key: `course-${c.id}`, type: 'course', title: c.title, at: c.created_at, to: `/admin/courses/edit/${c.id}`
    })),
    ...(knowledgeRes.data || []).map((k) => ({
      key: `knowledge-${k.id}`, type: 'knowledge', title: k.title, at: k.created_at, to: `/admin/knowledge/edit/${k.id}`
    }))
  ]
    .filter((item) => item.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 5)
}

const NAV_ITEMS = [
  { id: 'overview', label: 'แดชบอร์ด', icon: LayoutDashboard, to: '/admin/dashboard', enabled: true },
  { id: 'users', label: 'ผู้ใช้งาน', icon: Users, to: '/admin/users', enabled: true, adminOnly: true },
  { id: 'courses', label: 'หลักสูตร', icon: GraduationCap, to: '/admin/dashboard?tab=courses', enabled: true },
  { id: 'sciconnect', label: 'SCI Connect', icon: Rss, to: '/admin/dashboard?tab=sciconnect', enabled: true },
  { id: 'knowledge', label: 'คลังความรู้ (RAG)', icon: BrainCircuit, to: '/admin/knowledge', enabled: true },
  { id: 'news', label: 'ข่าวสาร', icon: Newspaper, to: '/admin/dashboard?tab=news', enabled: true },
  { id: 'ai-settings', label: 'ตั้งค่า AI', icon: Bot, to: '/admin/ai-settings', enabled: true, adminOnly: true },
  { id: 'settings', label: 'ตั้งค่าระบบ', icon: Settings, to: '/admin/settings', enabled: true, adminOnly: true },
  { id: 'logs', label: 'ประวัติการใช้งาน', icon: ScrollText, to: '/admin/logs', enabled: true, adminOnly: true }
]

// Sidebar + Topbar shell ใช้ร่วมกันทุกหน้า Admin (responsive: drawer บนมือถือ)
const AdminLayout = ({ active, title, user, role, onLogout, onNavigate, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [activity, setActivity] = useState([])
  const notifRef = useRef(null)
  const userMenuRef = useRef(null)
  const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || role === 'admin')
  const initial = (user?.email || 'A').charAt(0).toUpperCase()

  useEffect(() => {
    fetchRecentActivity().then(setActivity)
  }, [])

  useEffect(() => {
    if (!notifOpen) return
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifOpen])

  useEffect(() => {
    if (!userMenuOpen) return
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  const handleNavClick = (item, e) => {
    setMobileOpen(false)
    if (onNavigate && onNavigate(item.id)) {
      e.preventDefault()
    }
  }

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pnru flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-gray-900 leading-tight">Admin Panel</h1>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        {role && (
          <Link
            to="/admin/profile"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium bg-[#E8F5F1] text-pnru px-2.5 py-1 rounded-full hover:bg-[#d9efe8] transition-colors"
          >
            {role === 'admin' ? <Crown className="w-3 h-3" /> : <PenLine className="w-3 h-3" />}
            {roleLabel[role] || role}
          </Link>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (!item.enabled) {
            return (
              <div
                key={item.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 cursor-default select-none"
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                <span className="text-[10px] font-normal bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">
                  เร็วๆ นี้
                </span>
              </div>
            )
          }

          const isActive = active === item.id
          return (
            <Link
              key={item.id}
              to={item.to}
              onClick={(e) => handleNavClick(item, e)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-[#E8F5F1] text-pnru font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-pnru' : 'text-gray-400'}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          ออกจากระบบ
        </button>
      </div>
    </>
  )

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F7FAF8] flex">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col flex-shrink-0">
          {sidebarContent}
        </aside>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-xl">
              {sidebarContent}
            </aside>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white/80 backdrop-blur border-b border-gray-100 px-4 lg:px-8 h-16 flex items-center justify-between gap-3 flex-shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
                aria-label="เปิดเมนู"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-gray-900 truncate">{title}</h2>
            </div>

            <div className="hidden md:flex items-center flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pnru/30 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative p-2.5 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
                  aria-label="การแจ้งเตือน"
                  aria-expanded={notifOpen}
                >
                  <Bell className="w-5 h-5" />
                  {activity.length > 0 && (
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-pnru rounded-full ring-2 ring-white" />
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden z-40">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-pnru" />
                      <h3 className="text-sm font-bold text-gray-900">กิจกรรมล่าสุด</h3>
                    </div>
                    {activity.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">ยังไม่มีกิจกรรม</p>
                    ) : (
                      <ul className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                        {activity.map((item) => {
                          const meta = ACTIVITY_META[item.type]
                          const ItemIcon = meta.icon
                          return (
                            <li key={item.key}>
                              <Link
                                to={item.to}
                                onClick={() => setNotifOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                              >
                                <div className="w-9 h-9 rounded-lg bg-[#E8F5F1] flex items-center justify-center flex-shrink-0">
                                  <ItemIcon className="w-4 h-4 text-pnru" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">{meta.label} • {formatThaiDate(item.at)}</p>
                                </div>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={onLogout}
                className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                aria-label="ออกจากระบบ"
              >
                <LogOut className="w-5 h-5" />
              </button>

              <div className="relative hidden lg:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-pnru text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {initial}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">{user?.email}</p>
                    <p className="text-xs text-gray-400 truncate">{roleLabel[role] || 'ผู้ดูแลระบบ'}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden z-40">
                    <Link
                      to="/admin/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      โปรไฟล์ของฉัน
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        onLogout()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </ToastProvider>
  )
}

export default AdminLayout
