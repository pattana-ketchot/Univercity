import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  LayoutDashboard,
  GraduationCap,
  Newspaper,
  Users,
  LogOut,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  BarChart3,
  Menu,
  X,
  Crown,
  PenLine
} from 'lucide-react'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [courses, setCourses] = useState([])
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalNews: 0,
    recentCourses: 0,
    recentNews: 0
  })

  useEffect(() => {
    checkUser()
    fetchStats()
  }, [])

  useEffect(() => {
    if (activeTab === 'courses') {
      fetchCourses()
    } else if (activeTab === 'news') {
      fetchNews()
    }
  }, [activeTab])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      navigate('/admin/login')
      return
    }

    setUser(user)

    // ดึง role ของ user
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile) {
      setUserRole(profile.role)
    }
  }

  const fetchStats = async () => {
    try {
      // นับจำนวนหลักสูตรทั้งหมด
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })

      // นับจำนวนข่าวสารทั้งหมด
      const { count: newsCount } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true })

      // นับหลักสูตรที่เพิ่มใน 30 วันที่แล้ว
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: recentCoursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())

      // นับข่าวสารที่เพิ่มใน 30 วันที่แล้ว
      const { count: recentNewsCount } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())

      setStats({
        totalCourses: coursesCount || 0,
        totalNews: newsCount || 0,
        recentCourses: recentCoursesCount || 0,
        recentNews: recentNewsCount || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchCourses = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching courses:', error)
    } else {
      setCourses(data || [])
    }
    setLoading(false)
  }

  const fetchNews = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching news:', error)
    } else {
      setNews(data || [])
    }
    setLoading(false)
  }

  const handleDeleteCourse = async (id) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบหลักสูตรนี้?')) return

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      alert('ลบหลักสูตรสำเร็จ')
      fetchCourses()
      fetchStats()
    }
  }

  const handleDeleteNews = async (id) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบข่าวสารนี้?')) return

    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id)

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      alert('ลบข่าวสารสำเร็จ')
      fetchNews()
      fetchStats()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const navItems = [
    { id: 'overview', label: 'ภาพรวม', icon: BarChart3 },
    { id: 'courses', label: 'จัดการหลักสูตร', icon: GraduationCap },
    { id: 'news', label: 'จัดการข่าวสาร', icon: Newspaper }
  ]

  const pageTitle = navItems.find(item => item.id === activeTab)?.label || 'ภาพรวม'

  const roleBadge = userRole === 'admin'
    ? { label: 'Administrator', icon: Crown, className: 'bg-amber-100 text-amber-700' }
    : userRole === 'editor'
    ? { label: 'Editor', icon: PenLine, className: 'bg-blue-100 text-blue-700' }
    : { label: 'User', icon: Users, className: 'bg-gray-100 text-gray-600' }

  const goTo = (tabOrPath, isTab = true) => {
    if (isTab) {
      setActiveTab(tabOrPath)
    } else {
      navigate(tabOrPath)
    }
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-pnru rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-800">{pageTitle}</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="เปิดเมนู"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 lg:z-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-pnru rounded-lg flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-800 leading-tight">Admin Panel</p>
              <p className="text-xs text-gray-400 leading-tight">PNRU SCI-Tech</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
            aria-label="ปิดเมนู"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => goTo(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#E8F5F1] text-pnru'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-pnru' : 'text-gray-400'}`} />
                {item.label}
              </button>
            )
          })}

          {userRole === 'admin' && (
            <button
              onClick={() => goTo('/admin/users', false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Users className="w-5 h-5 flex-shrink-0 text-gray-400" />
              จัดการผู้ใช้
            </button>
          )}

          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              สร้างข้อมูลใหม่
            </p>
            <button
              onClick={() => goTo('/admin/courses/create', false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-5 h-5 flex-shrink-0 text-gray-400" />
              เพิ่มหลักสูตร
            </button>
            <button
              onClick={() => goTo('/admin/news/create', false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-5 h-5 flex-shrink-0 text-gray-400" />
              เพิ่มข่าวสาร
            </button>
          </div>
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 mb-2">
            <div className="w-10 h-10 rounded-full bg-pnru text-white flex items-center justify-center font-semibold flex-shrink-0">
              {user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${roleBadge.className}`}>
                <roleBadge.icon className="w-3 h-3" />
                {roleBadge.label}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
          {/* Desktop Page Header */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">
              จัดการเนื้อหาเว็บไซต์คณะวิทยาศาสตร์และเทคโนโลยี
            </p>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Courses */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      +{stats.recentCourses} ใหม่
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.totalCourses}</h3>
                  <p className="text-sm text-gray-500">หลักสูตรทั้งหมด</p>
                </div>

                {/* Total News */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <Newspaper className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      +{stats.recentNews} ใหม่
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.totalNews}</h3>
                  <p className="text-sm text-gray-500">ข่าวสารทั้งหมด</p>
                </div>

                {/* Recent Updates */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-1">
                    {stats.recentCourses + stats.recentNews}
                  </h3>
                  <p className="text-sm text-gray-500">อัพเดทใน 30 วันที่แล้ว</p>
                </div>

                {/* User Role */}
                <div className="bg-gradient-to-br from-pnru to-green-600 rounded-2xl shadow-sm p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <roleBadge.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{roleBadge.label}</h3>
                  <p className="text-sm text-white/80">บทบาทของคุณ</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-pnru" />
                  เพิ่มข้อมูลใหม่
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/admin/courses/create')}
                    className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-pnru hover:bg-green-50 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <GraduationCap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800 group-hover:text-pnru transition-colors">เพิ่มหลักสูตร</h3>
                      <p className="text-sm text-gray-500">สร้างหลักสูตรใหม่</p>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/admin/news/create')}
                    className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-pnru hover:bg-green-50 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <Newspaper className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800 group-hover:text-pnru transition-colors">เพิ่มข่าวสาร</h3>
                      <p className="text-sm text-gray-500">สร้างข่าวสารใหม่</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Recent Courses */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      หลักสูตรล่าสุด
                    </h2>
                    <button
                      onClick={() => setActiveTab('courses')}
                      className="text-xs font-medium text-pnru hover:underline"
                    >
                      ดูทั้งหมด
                    </button>
                  </div>
                  <div className="space-y-2">
                    {courses.slice(0, 5).map((course) => (
                      <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <img
                          src={course.logo}
                          alt={course.title}
                          className="w-10 h-10 object-contain rounded-lg bg-gray-50 flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-gray-800 truncate">{course.title}</h3>
                          <p className="text-xs text-gray-400">{formatDate(course.created_at)}</p>
                        </div>
                      </div>
                    ))}
                    {courses.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-8">ยังไม่มีหลักสูตร</p>
                    )}
                  </div>
                </div>

                {/* Recent News */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                      <Newspaper className="w-5 h-5 text-emerald-600" />
                      ข่าวสารล่าสุด
                    </h2>
                    <button
                      onClick={() => setActiveTab('news')}
                      className="text-xs font-medium text-pnru hover:underline"
                    >
                      ดูทั้งหมด
                    </button>
                  </div>
                  <div className="space-y-2">
                    {news.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Newspaper className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-gray-800 truncate">{item.title}</h3>
                          <p className="text-xs text-gray-400">{formatDate(item.created_at)}</p>
                        </div>
                      </div>
                    ))}
                    {news.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-8">ยังไม่มีข่าวสาร</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">หลักสูตรทั้งหมด</h2>
                  <p className="text-sm text-gray-500">{courses.length} รายการ</p>
                </div>
                <button
                  onClick={() => navigate('/admin/courses/create')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-pnru text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มหลักสูตร
                </button>
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pnru"></div>
                  <p className="mt-3 text-sm text-gray-500">กำลังโหลด...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-16">
                  <GraduationCap className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">ยังไม่มีหลักสูตร</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          หลักสูตร
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          ชื่อภาษาอังกฤษ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          คำอธิบาย
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          การจัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {courses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={course.logo}
                                alt={course.title}
                                className="w-10 h-10 object-contain rounded-lg bg-gray-50 flex-shrink-0"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><text y="32" font-size="32">📚</text></svg>'
                                }}
                              />
                              <span className="text-sm font-medium text-gray-800">{course.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="text-sm text-gray-500">{course.title_en}</div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="text-sm text-gray-500 max-w-xs truncate">{course.description}</div>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => navigate(`/admin/courses/edit/${course.id}`)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                aria-label="แก้ไข"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(course.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                aria-label="ลบ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">ข่าวสารทั้งหมด</h2>
                  <p className="text-sm text-gray-500">{news.length} รายการ</p>
                </div>
                <button
                  onClick={() => navigate('/admin/news/create')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-pnru text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มข่าวสาร
                </button>
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pnru"></div>
                  <p className="mt-3 text-sm text-gray-500">กำลังโหลด...</p>
                </div>
              ) : news.length === 0 ? (
                <div className="text-center py-16">
                  <Newspaper className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">ยังไม่มีข่าวสาร</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {news.map((item) => (
                    <div key={item.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23e5e7eb" width="400" height="300"/><text x="50%" y="50%" font-size="48" text-anchor="middle" dy=".3em">📰</text></svg>'
                        }}
                      />
                      <div className="p-4">
                        <span className="inline-block bg-pnru/10 text-pnru text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
                          {item.category}
                        </span>
                        <h3 className="font-bold text-gray-800 mb-1.5 line-clamp-2">{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/news/edit/${item.id}`)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteNews(item.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
                          >
                            ลบ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
