import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiJson } from '../../lib/apiAuth'
import { DELETE_TARGETS, matchesNewsQuery } from '../../lib/adminDeletable'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import AdminLayout from '../../components/admin/AdminLayout'
import { useToast } from '../../components/admin/Toast'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import {
  GraduationCap,
  Newspaper,
  Rss,
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  Clock,
  AlertCircle,
  Server,
  Database,
  Bot,
  ExternalLink,
  RefreshCw
} from 'lucide-react'

const TAB_TITLES = { overview: 'แดชบอร์ด', courses: 'หลักสูตร', news: 'ข่าวสาร', sciconnect: 'SCI Connect' }

const TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

const formatThaiDate = (value) => {
  if (!value) return '-'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return String(value)
  return `${dt.getDate()} ${TH_MONTHS[dt.getMonth()]} ${dt.getFullYear() + 543}`
}

// แสดงชื่อ/อีเมลผู้สร้าง-แก้ไข แทน UUID ของ created_by/updated_by
const ActorCell = ({ creator, updater }) => {
  const wasEdited = updater && updater.user_id !== creator?.user_id
  return (
    <div className="text-xs">
      <p className="text-gray-700">{creator?.full_name || creator?.email || 'ไม่ทราบผู้ใช้'}</p>
      {creator?.full_name && creator?.email && <p className="text-gray-400">{creator.email}</p>}
      {wasEdited && (
        <p className="text-gray-400 mt-0.5">แก้ไขล่าสุดโดย {updater?.full_name || updater?.email}</p>
      )}
    </div>
  )
}

// เนื้อหาแดชบอร์ดทั้งหมด render อยู่ภายใน <AdminLayout> เสมอ
// เพื่อให้ useToast() อยู่ภายใน ToastProvider ที่ AdminLayout เป็นคนสร้าง
const DashboardContent = ({ activeTab, canEdit, isAdmin }) => {
  const showToast = useToast()

  const [courses, setCourses] = useState([])
  const [news, setNews] = useState([])
  const [sciConnectNews, setSciConnectNews] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [overview, setOverview] = useState(null)
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [courseSearch, setCourseSearch] = useState('')
  const [newsSearch, setNewsSearch] = useState('')
  // kind บอกว่ากำลังลบอะไร — ต้องมี เพราะการลบข่าวกับลบหลักสูตรล้าง chunk ของ RAG
  // ด้วย source_type ต่างกัน ('news' กับ 'major') ลบผิดชนิดคือล้างของผิดก้อน
  const [confirmState, setConfirmState] = useState({ open: false, id: null, kind: 'course' })
  const [deleting, setDeleting] = useState(false)
  const [syncingSciConnect, setSyncingSciConnect] = useState(false)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await apiJson('/api/site-admin/courses')
      setCourses(data.courses || [])
    } catch (err) {
      setLoadError('โหลดข้อมูลหลักสูตรไม่สำเร็จ: ' + err.message)
      setCourses([])
    }
    setLoading(false)
  }, [])

  // ข่าวของคณะที่ผู้ดูแลเขียนเอง — คนละชุดกับข่าว SCI Connect ที่ดึงจากเว็บต้นทางอัตโนมัติ
  //
  // ฟอร์มเพิ่ม/แก้ข่าวมีอยู่แล้วและใช้งานได้ (NewsForm.jsx เขียนตาราง news และพาผู้ใช้กลับมาที่
  // ?tab=news หลังบันทึก) ส่วนแท็บนี้เคยเป็นหน้าว่างที่บอกว่ากำลังพัฒนา จึงไม่มีทางเห็นหรือแก้ข่าว
  // ที่สร้างไว้ ทั้งที่การ์ดภาพรวมนับจำนวนข่าวให้เห็นอยู่
  const fetchNews = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await apiJson('/api/site-admin/news')
      // หลังบ้านใช้ชื่อ published_on ส่วนตารางด้านล่างแสดงฟิลด์ date
      setNews((data.news || []).map((n) => ({ ...n, date: n.published_on })))
    } catch (err) {
      setLoadError('โหลดข้อมูลข่าวสารไม่สำเร็จ: ' + err.message)
      setNews([])
    }
    setLoading(false)
  }, [])

  const fetchSciConnectNews = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await apiJson('/api/site/external-news?limit=15')
      setSciConnectNews(data.news || [])
    } catch (err) {
      setLoadError('โหลดข่าว SCI Connect ไม่สำเร็จ: ' + err.message)
      setSciConnectNews([])
    }
    setLoading(false)
  }, [])

  // เรียก sync-sci-news Edge Function ทันที (ผ่าน api/admin/sync-sci-news ที่เช็คสิทธิ์
  // admin/editor ก่อน) แทนที่จะรอ cron รอบถัดไป (ทุก 30 นาที)
  const handleForceSyncSciNews = useCallback(async () => {
    setSyncingSciConnect(true)
    try {
      // หลังบ้านตรวจสิทธิ์จาก token เอง และใช้ตรรกะชุดเดียวกับงานตั้งเวลา
      const data = await apiJson('/api/site-admin/sync-news', { method: 'POST' })

      showToast(`อัปเดตข่าว SCI Connect แล้ว (ข่าวใหม่ ${data.inserted ?? 0} รายการ)`, 'success')
      fetchSciConnectNews()
    } catch (err) {
      showToast('บังคับอัปเดตข่าวไม่สำเร็จ: ' + err.message, 'error')
    }
    setSyncingSciConnect(false)
  }, [showToast, fetchSciConnectNews])

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true)
    setLoadError('')

    const fetchRecentSciConnect = async () => {
      try {
        const res = await fetch('/api/site/external-news?limit=5')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'โหลดข่าว SCI Connect ไม่สำเร็จ')
        return data.news || []
      } catch {
        return []
      }
    }

    // ล้มเหลวรายการเดียวต้องไม่ทำให้ภาพรวมหายทั้งหน้า — แต่ต้องรู้ว่าฐานข้อมูลอ่านได้ไหม
    const safe = (path) => apiJson(path).catch(() => null)
    const [users, courses, news, knowledge, recentSciConnect, ai] = await Promise.all([
      // รายชื่อผู้ใช้เฉพาะ admin — editor จะได้ null ซึ่งแสดงเป็น 0
      safe('/api/site-admin/users'),
      safe('/api/site-admin/courses'),
      safe('/api/site-admin/news'),
      safe('/api/site-admin/knowledge'),
      fetchRecentSciConnect(),
      safe('/api/site-admin/ai-settings')
    ])

    if (!courses || !news) {
      setLoadError('โหลดข้อมูลภาพรวมไม่สำเร็จ')
    }

    setOverview({
      stats: {
        users: users?.users?.length ?? 0,
        courses: courses?.courses?.length ?? 0,
        news: news?.news?.length ?? 0,
        knowledge: knowledge?.articles?.length ?? 0
      },
      recentSciConnect,
      recentCourses: (courses?.courses || []).slice(0, 5),
      system: {
        db: Boolean(courses && news),
        aiModel: ai?.model || null
      }
    })
    setOverviewLoading(false)
  }, [])

  useEffect(() => {
    if (activeTab === 'overview') fetchOverview()
    if (activeTab === 'courses') fetchCourses()
    if (activeTab === 'news') fetchNews()
    if (activeTab === 'sciconnect') fetchSciConnectNews()
  }, [activeTab, fetchOverview, fetchCourses, fetchNews, fetchSciConnectNews])

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase()
    if (!q) return courses
    return courses.filter((c) =>
      c.title?.toLowerCase().includes(q) ||
      c.title_en?.toLowerCase().includes(q)
    )
  }, [courses, courseSearch])

  const filteredNews = useMemo(
    () => news.filter((n) => matchesNewsQuery(n, newsSearch)),
    [news, newsSearch]
  )

  // ตาราง/source_type/ป้ายชื่อ อยู่ใน lib เพื่อให้ทดสอบได้ (test/adminDeletable.test.mjs)
  // ส่วนการโหลดรายการใหม่หลังลบต้องอยู่ที่นี่ เพราะผูกกับ state ของหน้า
  const RELOAD = { course: fetchCourses, news: fetchNews }

  const requestDelete = (id, kind = 'course') => setConfirmState({ open: true, id, kind })
  const closeConfirm = () => setConfirmState({ open: false, id: null, kind: 'course' })

  const handleConfirmDelete = async () => {
    if (!isAdmin) return
    const target = DELETE_TARGETS[confirmState.kind]
    if (!target) return

    const deletedId = confirmState.id
    setDeleting(true)
    const endpoint = confirmState.kind === 'news' ? 'news' : 'courses'
    try {
      await apiJson(`/api/site-admin/${endpoint}/${deletedId}`, { method: 'DELETE' })
    } catch (err) {
      setDeleting(false)
      closeConfirm()
      showToast('ลบไม่สำเร็จ: ' + err.message, 'error')
      return
    }
    setDeleting(false)
    closeConfirm()

    showToast(`ลบ${target.label}เรียบร้อยแล้ว`, 'success')
    RELOAD[confirmState.kind]()

    // เดิมล้าง chunk ของ RAG ใน Supabase ตรงนี้ — เลิกแล้วใน Phase 4
    // เพราะไม่มีที่ใดอ่านตารางนั้นเพื่อตอบคำถาม (ดู src/lib/ragIngest.js)
  }

  return (
    <>
      <ConfirmDialog
        open={confirmState.open}
        title={`ยืนยันการลบ${DELETE_TARGETS[confirmState.kind]?.label || ''}`}
        message="การลบไม่สามารถย้อนกลับได้"
        onConfirm={handleConfirmDelete}
        onCancel={closeConfirm}
        loading={deleting}
      />

      {activeTab === 'overview' && (
        <div className="space-y-5 lg:space-y-6">
          {loadError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{loadError}</span>
            </div>
          )}

          {overviewLoading && !overview ? (
            <p className="text-center text-gray-500 py-12">กำลังโหลด...</p>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
                {[
                  { id: 'users', label: 'ผู้ใช้งานทั้งหมด', value: overview?.stats.users ?? 0, icon: Users },
                  { id: 'courses', label: 'หลักสูตรทั้งหมด', value: overview?.stats.courses ?? 0, icon: GraduationCap },
                  { id: 'news', label: 'ข่าวสารทั้งหมด', value: overview?.stats.news ?? 0, icon: Newspaper },
                  { id: 'knowledge', label: 'คลังความรู้ AI', value: overview?.stats.knowledge ?? 0, icon: Bot }
                ].map((card) => (
                  <div key={card.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:p-6">
                    <div className="w-11 h-11 rounded-xl bg-[#E8F5F1] flex items-center justify-center mb-4">
                      <card.icon className="w-5 h-5 text-pnru" />
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {(card.value ?? 0).toLocaleString('th-TH')}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{card.label}</p>
                  </div>
                ))}
              </div>

              {/* System Status */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">สถานะระบบ</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'web', label: 'เว็บเซิร์ฟเวอร์', icon: Server, ok: true, text: 'ทำงานปกติ' },
                    {
                      id: 'db',
                      label: 'ฐานข้อมูล',
                      icon: Database,
                      ok: Boolean(overview?.system.db),
                      text: overview?.system.db ? 'เชื่อมต่อแล้ว' : 'เชื่อมต่อไม่ได้'
                    },
                    {
                      id: 'ai',
                      label: 'โมเดล AI',
                      icon: Bot,
                      ok: true,
                      text: overview?.system.aiModel || 'ค่าเริ่มต้น (env)'
                    }
                  ].map((s) => (
                    <div key={s.id} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                        <s.icon className="w-4 h-4 text-pnru" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800">{s.label}</p>
                        <p className={`text-xs flex items-center gap-1.5 mt-0.5 ${s.ok ? 'text-green-600' : 'text-red-600'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="truncate">{s.text}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent SCI Connect + Recent Courses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Rss className="w-5 h-5 text-pnru" />
                      SCI Connect ล่าสุด
                    </h3>
                    <Link to="/admin/dashboard?tab=sciconnect" className="text-xs font-medium text-pnru hover:underline">
                      ดูทั้งหมด
                    </Link>
                  </div>
                  {!overview || overview.recentSciConnect.length === 0 ? (
                    <p className="text-sm text-gray-400 py-3">ยังไม่มีข่าวจาก SCI Connect</p>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {overview.recentSciConnect.map((item) => (
                        <li key={item.slug} className="py-3 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.published_date}</p>
                          </div>
                          {item.slug && (
                            <Link
                              to={`/sci-connect/${item.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-pnru hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              เปิดดู
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-pnru" />
                      หลักสูตรล่าสุด
                    </h3>
                    <Link to="/admin/dashboard?tab=courses" className="text-xs font-medium text-pnru hover:underline">
                      ดูทั้งหมด
                    </Link>
                  </div>
                  {!overview || overview.recentCourses.length === 0 ? (
                    <p className="text-sm text-gray-400 py-3">ยังไม่มีหลักสูตร</p>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {overview.recentCourses.map((item) => (
                        <li key={item.id} className="py-3">
                          <Link to={`/admin/courses/edit/${item.id}`} className="block group">
                            <p className="text-sm font-medium text-gray-800 truncate group-hover:text-pnru">{item.title}</p>
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-400">
                              {item.title_en && <span className="truncate">{item.title_en}</span>}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />{formatThaiDate(item.created_at)}
                              </span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'courses' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="ค้นหาหลักสูตร..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pnru"
              />
            </div>
            {canEdit && (
              <Link
                to="/admin/courses/create"
                className="inline-flex items-center justify-center gap-2 bg-pnru text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                เพิ่มหลักสูตร
              </Link>
            )}
          </div>

          {loadError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{loadError}</span>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <p className="p-6 text-center text-gray-500">กำลังโหลด...</p>
            ) : filteredCourses.length === 0 ? (
              <p className="p-6 text-center text-gray-500">
                {courseSearch ? 'ไม่พบหลักสูตรที่ค้นหา' : 'ยังไม่มีหลักสูตร'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">ชื่อหลักสูตร</th>
                      <th className="px-4 py-3 font-medium">ผู้สร้าง/แก้ไข</th>
                      <th className="px-4 py-3 font-medium text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className="border-t border-gray-100">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.title_en}</p>
                        </td>
                        <td className="px-4 py-3">
                          <ActorCell creator={course.creator} updater={course.updater} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {canEdit && (
                              <Link
                                to={`/admin/courses/edit/${course.id}`}
                                className="p-2 text-gray-500 hover:text-pnru hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </Link>
                            )}
                            {isAdmin && (
                              <button
                                onClick={() => requestDelete(course.id, 'course')}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'news' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={newsSearch}
                onChange={(e) => setNewsSearch(e.target.value)}
                placeholder="ค้นหาข่าว..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pnru"
              />
            </div>
            {canEdit && (
              <Link
                to="/admin/news/create"
                className="inline-flex items-center justify-center gap-2 bg-pnru text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                เพิ่มข่าว
              </Link>
            )}
          </div>

          {loadError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{loadError}</span>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <p className="p-6 text-center text-gray-500">กำลังโหลด...</p>
            ) : filteredNews.length === 0 ? (
              <p className="p-6 text-center text-gray-500">
                {newsSearch ? 'ไม่พบข่าวที่ค้นหา' : 'ยังไม่มีข่าว'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">หัวข้อข่าว</th>
                      <th className="px-4 py-3 font-medium">สถานะ</th>
                      <th className="px-4 py-3 font-medium">ผู้สร้าง/แก้ไข</th>
                      <th className="px-4 py-3 font-medium text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNews.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500">
                            {[item.category, item.date].filter(Boolean).join(' · ')}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {/* ข่าวร่างยังไม่ถูกส่งเข้า RAG และคนทั่วไปไม่เห็น — ต้องแยกให้ชัดในรายการ */}
                          {item.status === 'published' ? (
                            <span className="inline-block rounded-full bg-[#E8F5F1] px-2 py-0.5 text-xs text-pnru">
                              เผยแพร่แล้ว
                            </span>
                          ) : (
                            <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                              ร่าง
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <ActorCell creator={item.creator} updater={item.updater} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {canEdit && (
                              <Link
                                to={`/admin/news/edit/${item.id}`}
                                className="p-2 text-gray-500 hover:text-pnru hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </Link>
                            )}
                            {isAdmin && (
                              <button
                                onClick={() => requestDelete(item.id, 'news')}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sciconnect' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg p-3 flex-1">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>
                ข้อมูลนี้ sync มาจาก sci.pnru.ac.th อัตโนมัติทุก 30 นาที 
              </span>
            </div>

            {canEdit && (
              <button
                onClick={handleForceSyncSciNews}
                disabled={syncingSciConnect}
                className="inline-flex items-center justify-center gap-2 bg-pnru text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${syncingSciConnect ? 'animate-spin' : ''}`} />
                {syncingSciConnect ? 'กำลังอัปเดต...' : 'Force Update'}
              </button>
            )}
          </div>

          {loadError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{loadError}</span>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <p className="p-6 text-center text-gray-500">กำลังโหลด...</p>
            ) : sciConnectNews.length === 0 ? (
              <p className="p-6 text-center text-gray-500">ยังไม่มีข่าวจาก SCI Connect</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">หัวข้อข่าว</th>
                      <th className="px-4 py-3 font-medium">วันที่</th>
                      <th className="px-4 py-3 font-medium text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sciConnectNews.map((item) => (
                      <tr key={item.slug} className="border-t border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-md truncate">{item.title}</td>
                        <td className="px-4 py-3 text-gray-600">{item.published_date}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {item.slug && (
                              <Link
                                to={`/sci-connect/${item.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 p-2 text-gray-500 hover:text-pnru hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                                เปิดดู
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

const AdminDashboard = () => {
  const { user, role, loading: authLoading, canEdit, isAdmin, logout } = useAdminAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview')

  useEffect(() => {
    setActiveTab(searchParams.get('tab') || 'overview')
  }, [searchParams])

  const DASHBOARD_TABS = ['overview', 'courses', 'news', 'sciconnect']

  const handleSidebarNavigate = (tabId) => {
    if (!DASHBOARD_TABS.includes(tabId)) return false
    setActiveTab(tabId)
    setSearchParams(tabId === 'overview' ? {} : { tab: tabId })
    return true
  }

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">กำลังตรวจสอบสิทธิ์...</div>
  }

  return (
    <AdminLayout
      active={activeTab}
      title={TAB_TITLES[activeTab] || 'Admin'}
      user={user}
      role={role}
      onLogout={logout}
      onNavigate={handleSidebarNavigate}
    >
      <DashboardContent activeTab={activeTab} canEdit={canEdit} isAdmin={isAdmin} />
    </AdminLayout>
  )
}

export default AdminDashboard
