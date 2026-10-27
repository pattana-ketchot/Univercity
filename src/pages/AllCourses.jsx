import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, GraduationCap, Scale, Briefcase, Star, ArrowRight } from 'lucide-react'
import { fetchSiteCourses } from '../lib/siteCourses'
import { levelOf, byKnownOrder } from '../lib/courseLevels'

const ALL_LEVELS = 'all'

const AllCourses = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('a-z')
  const [levelFilter, setLevelFilter] = useState(ALL_LEVELS)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setCourses(await fetchSiteCourses())
      } catch {
        setCourses([])
      }
      setLoading(false)
    }
    load()
  }, [])

  // ระดับที่มีให้เลือก — สร้างจากข้อมูลจริงที่ผู้ดูแลกรอกไว้ ไม่ใช่รายการที่เขียนตายตัว
  // ถ้าคณะยังไม่เปิดระดับใด ตัวเลือกนั้นก็ไม่ควรโผล่ให้กดแล้วได้หน้าว่าง
  const levels = useMemo(() => {
    const found = new Set()
    for (const course of courses) {
      const level = levelOf(course)
      if (level) found.add(level)
    }
    return [...found].sort(byKnownOrder)
  }, [courses])

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let filtered = courses

    // กรองตามระดับ — ตัดออกเท่านั้น ไม่ดึงหลักสูตรอื่นมาเติมให้ครบจำนวน
    // หลักสูตรที่ยังไม่ได้กรอกระดับจะไม่เข้าเกณฑ์ใดเลย ซึ่งถูกต้อง
    if (levelFilter !== ALL_LEVELS) {
      filtered = filtered.filter((course) => levelOf(course) === levelFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(course =>
        (course.title || '').toLowerCase().includes(query) ||
        (course.title_en || '').toLowerCase().includes(query) ||
        (course.description || '').toLowerCase().includes(query)
      )
    }

    // Sort
    if (sortBy === 'a-z') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title, 'th'))
    } else if (sortBy === 'z-a') {
      filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title, 'th'))
    }

    return filtered
  }, [courses, searchQuery, sortBy, levelFilter])

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-pnru mb-2 flex items-center gap-2">
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                หลักสูตรทั้งหมด
              </h1>
              <p className="text-gray-600 text-sm lg:text-base">
                ค้นหาหลักสูตรที่เปิดสอนในคณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยราชภัฏพระนคร
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              <GraduationCap className="w-5 h-5 text-pnru" />
              <span className="text-sm font-medium text-gray-700">รวมทั้งหมด {courses.length} หลักสูตร</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นชื่อหลักสูตร เช่น วิทยาการคอมพิวเตอร์, เทคโนโลยีอาหาร, การแพทย์แผนไทย..."
              className="w-full pl-12 pr-4 py-3 lg:py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru focus:border-transparent"
            />
          </div>

          {/* Level filter + Sort */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* ซ่อนทั้งแถวถ้ายังไม่มีหลักสูตรใดกรอกระดับไว้ — ตัวกรองที่มีตัวเลือกเดียวไม่ช่วยอะไร */}
            {levels.length > 1 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">ระดับการศึกษา</span>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru text-sm"
                >
                  <option value={ALL_LEVELS}>ทุกระดับ</option>
                  {levels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {levelFilter !== ALL_LEVELS && (
                  <span className="text-sm text-gray-500">
                    พบ {filteredCourses.length} หลักสูตร
                  </span>
                )}
              </div>
            ) : (
              <span />
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru text-sm"
            >
              <option value="a-z">เรียงตาม: ก-ฮ</option>
              <option value="z-a">เรียงตาม: ฮ-ก</option>
            </select>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Course Cards */}
          <div className="lg:col-span-4">
            {loading ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
                กำลังโหลดหลักสูตร...
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                {filteredCourses.map(course => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                  >
                    {/* Logo */}
                    <div className="flex items-center justify-center h-32 bg-gray-100 rounded-t-xl overflow-hidden">
                      {course.logo ? (
                        <img
                          src={course.logo}
                          alt={course.title}
                          className="w-20 h-20 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'block'
                          }}
                        />
                      ) : null}
                      <GraduationCap className="w-16 h-16 text-gray-400" style={{ display: course.logo ? 'none' : 'block' }} />
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-base lg:text-lg font-bold text-pnru mb-1 text-center">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-3 text-center">
                        {course.title_en}
                      </p>
                      <p className="text-sm text-gray-600 text-center mb-4 flex-1 line-clamp-3">
                        {course.description}
                      </p>

                      {/* Divider */}
                      <hr className="border-gray-200 mb-4" />

                      {/* Link */}
                      <Link
                        to={`/courses/${course.id}`}
                        className="flex min-h-[44px] items-center justify-center gap-2 text-pnru hover:text-opacity-80 font-medium text-sm transition-colors"
                      >
                        ดูรายละเอียด
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">ไม่พบหลักสูตรที่ค้นหา</h3>
                <p className="text-gray-500">
                  {levelFilter !== ALL_LEVELS
                    ? `ยังไม่มีหลักสูตรระดับ${levelFilter} ที่ตรงกับคำค้นหา — ลองเลือกทุกระดับ`
                    : 'ลองใช้คำค้นหาอื่น'}
                </p>
              </div>
            )}
          </div>

          {/* Recommendation Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-28">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                เครื่องมือแนะนำ
              </h3>

              <div className="space-y-3">
                {/* Compare Tool */}
                <Link
                  to="/compare"
                  className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <Scale className="w-6 h-6 text-pnru flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-pnru transition-colors">
                        เปรียบเทียบสาขา
                      </h4>
                      <p className="text-xs text-gray-600">
                        เปรียบเทียบข้อมูลเต็มและอาชีพหลังจบ
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Career Tool */}
                <Link
                  to="/careers"
                  className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-6 h-6 text-pnru flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-pnru transition-colors">
                        อาชีพหลังจบ
                      </h4>
                      <p className="text-xs text-gray-600">
                        สำรวจอาชีพและโอกาสในอนาคต
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default AllCourses
