import { useState, useMemo, useEffect } from 'react'
import { Search, GraduationCap, Scale, Briefcase, Star, ArrowRight } from 'lucide-react'
import { supabase, isConfigured } from '../lib/supabase'

const AllCourses = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('a-z')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'computer', label: 'คอมพิวเตอร์และเทคโนโลยี' },
    { id: 'health', label: 'วิทยาศาสตร์สุขภาพ' },
    { id: 'science', label: 'วิทยาศาสตร์และสิ่งแวดล้อม' },
    { id: 'business', label: 'ธุรกิจและการจัดการ' }
  ]

  // ข้อมูล fallback
  const fallbackCourses = [
    {
      id: 1,
      title: 'วิทยาการคอมพิวเตอร์',
      title_en: 'Computer Science',
      description: 'เรียนรู้การพัฒนาซอฟต์แวร์ AI และ Data Science',
      category: 'computer',
      logo: '/assets/courses/computer.png'
    },
    {
      id: 2,
      title: 'เทคโนโลยีสารสนเทศ',
      title_en: 'Information Technology',
      description: 'การจัดการระบบ เครือข่าย และความปลอดภัย',
      category: 'computer',
      logo: '/assets/courses/it.png'
    },
    {
      id: 3,
      title: 'คณิตศาสตร์',
      title_en: 'Mathematics',
      description: 'พื้นฐานทางคณิตศาสตร์และการประยุกต์',
      category: 'science',
      logo: '/assets/courses/math.png'
    },
    {
      id: 4,
      title: 'คอมพิวเตอร์แอนิเมชันและมัลติมีเดีย',
      title_en: 'Computer Animation and Multimedia',
      description: 'สร้างสรรค์งานแอนิเมชันและสื่อดิจิทัล',
      category: 'computer',
      logo: '/assets/courses/animation.png'
    },
    {
      id: 5,
      title: 'การจัดการสิ่งแวดล้อม',
      title_en: 'Environmental Management',
      description: 'อนุรักษ์และจัดการทรัพยากรธรรมชาติ',
      category: 'science',
      logo: '/assets/courses/env.png'
    },
    {
      id: 6,
      title: 'วิทยาศาสตร์เครื่องสำอาง',
      title_en: 'Cosmetic Science',
      description: 'วิจัยและพัฒนาผลิตภัณฑ์เครื่องสำอาง',
      category: 'health',
      logo: '/assets/courses/cosmetic.png'
    },
    {
      id: 7,
      title: 'เทคโนโลยีอาหารและความเป็นผู้ประกอบการสมัยใหม่',
      title_en: 'Food Technology and Modern Entrepreneurship',
      description: 'นวัตกรรมอาหารและการทำธุรกิจ',
      category: 'business',
      logo: '/assets/courses/food.png'
    },
    {
      id: 8,
      title: 'การแพทย์แผนไทยประยุกต์',
      title_en: 'Applied Thai Traditional Medicine',
      description: 'แพทย์แผนไทยผสมผสานเทคโนโลยีสมัยใหม่',
      category: 'health',
      logo: '/assets/courses/medicine.png'
    },
    {
      id: 9,
      title: 'เทคโนโลยีการเกษตรสมัยใหม่',
      title_en: 'Modern Agricultural Technology',
      description: 'เกษตรอัจฉริยะและเทคโนโลยีการผลิต',
      category: 'science',
      logo: '/assets/courses/agri.png'
    },
    {
      id: 10,
      title: 'เทคโนโลยีผลิตภัณฑ์ชีวภาพเพื่อการประกอบธุรกิจ',
      title_en: 'Bioproduct Technology for Business',
      description: 'ผลิตภัณฑ์ชีวภาพและการพาณิชย์',
      category: 'business',
      logo: '/assets/courses/bio.png'
    }
  ]

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    // ถ้ายังไม่ได้ตั้งค่า Supabase ให้ใช้ข้อมูล fallback
    if (!isConfigured) {
      setCourses(fallbackCourses)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching courses:', error)
        setCourses(fallbackCourses)
      } else if (data && data.length > 0) {
        setCourses(data)
      } else {
        setCourses(fallbackCourses)
      }
    } catch (error) {
      console.error('Error:', error)
      setCourses(fallbackCourses)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let filtered = courses

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.title_en.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query)
      )
    }

    // Sort
    if (sortBy === 'a-z') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title, 'th'))
    } else if (sortBy === 'z-a') {
      filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title, 'th'))
    }

    return filtered
  }, [courses, searchQuery, selectedCategory, sortBy])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pnru mb-4"></div>
          <p className="text-gray-600">กำลังโหลดหลักสูตร...</p>
        </div>
      </div>
    )
  }

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

          {/* Category Tabs and Sort */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 lg:pb-0">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-pnru text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

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
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
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
                      <p className="text-sm text-gray-600 text-center mb-4 flex-1">
                        {course.description}
                      </p>

                      {/* Divider */}
                      <hr className="border-gray-200 mb-4" />

                      {/* Link */}
                      <a
                        href={`/courses/${course.id}`}
                        className="flex items-center justify-center gap-2 text-pnru hover:text-opacity-80 font-medium text-sm transition-colors"
                      >
                        ดูรายละเอียด
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">ไม่พบหลักสูตรที่ค้นหา</h3>
                <p className="text-gray-500">ลองใช้คำค้นหาอื่น หรือเลือกหมวดหมู่ทั้งหมด</p>
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
                <a
                  href="/compare"
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
                </a>

                {/* Career Tool */}
                <a
                  href="/careers"
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
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default AllCourses
