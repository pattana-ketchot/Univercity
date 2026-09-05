import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scale, GraduationCap, Plus, Check, X, ArrowRight, Info } from 'lucide-react'
import { supabase, isConfigured } from '../lib/supabase'

const CompareCourses = () => {
  const navigate = useNavigate()
  const [selectedCourses, setSelectedCourses] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const MAX_SELECTION = 4
  const MIN_SELECTION = 2

  useEffect(() => {
    const fetchCourses = async () => {
      if (!isConfigured) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('courses')
        .select('id, title, title_en, description, logo')
        .order('title', { ascending: true })

      setCourses(data || [])
      setLoading(false)
    }
    fetchCourses()
  }, [])

  const handleToggleCourse = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId)
      } else {
        if (prev.length < MAX_SELECTION) {
          return [...prev, courseId]
        }
        return prev
      }
    })
  }

  const handleRemoveCourse = (courseId) => {
    setSelectedCourses(prev => prev.filter(id => id !== courseId))
  }

  const handleCompare = () => {
    if (selectedCourses.length < MIN_SELECTION) {
      alert(`กรุณาเลือกอย่างน้อย ${MIN_SELECTION} สาขา`)
      return
    }

    const ids = selectedCourses.join(',')
    navigate(`/compare/result?courses=${ids}`)
  }

  const isMaxed = selectedCourses.length >= MAX_SELECTION
  const canCompare = selectedCourses.length >= MIN_SELECTION

  const selectedCoursesData = courses.filter(course =>
    selectedCourses.includes(course.id)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-pnru mb-2">
                เปรียบเทียบสาขา
              </h1>
              <p className="text-gray-600 text-sm lg:text-base">
                เลือกหลักสูตรที่คุณสนใจ 2-4 สาขา เพื่อเปรียบเทียบความแตกต่างในมุมมองที่สำคัญ
              </p>
            </div>
            <div className="bg-[#E8F5F1] px-4 py-2 rounded-lg border border-pnru/20 flex items-center gap-2">
              <Info className="w-5 h-5 text-pnru" />
              <span className="text-sm font-medium text-pnru whitespace-nowrap">
                คุณสามารถเปรียบเทียบได้สูงสุด {MAX_SELECTION} สาขา
              </span>
            </div>
          </div>

          {/* Selection Counter */}
          <div className="text-lg font-semibold text-gray-700">
            เลือกสาขาที่ต้องการเปรียบเทียบ ({selectedCourses.length} / {MAX_SELECTION})
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Course Selection Panel */}
          <div className="order-2 lg:order-1 lg:col-span-9">
            <div className="bg-white rounded-xl border-2 border-blue-100 p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  เลือกสาขาที่ต้องการเปรียบเทียบ
                </h2>
                <p className="text-sm text-gray-600">
                  คลิกที่การ์ดเพื่อเพิ่มสาขาในการเปรียบเทียบ
                </p>
              </div>

              {/* Course Grid */}
              {loading ? (
                <p className="text-center text-gray-500 py-8">กำลังโหลดหลักสูตร...</p>
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {courses.map(course => {
                  const isSelected = selectedCourses.includes(course.id)
                  const isDisabled = isMaxed && !isSelected

                  return (
                    <div
                      key={course.id}
                      className={`bg-white rounded-xl border-2 shadow-sm transition-all relative ${
                        isSelected
                          ? 'border-pnru bg-[#E8F5F1]'
                          : isDisabled
                          ? 'border-gray-200 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer'
                      }`}
                      onClick={() => !isDisabled && handleToggleCourse(course.id)}
                    >
                      {/* Selection Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isDisabled) handleToggleCourse(course.id)
                        }}
                        disabled={isDisabled}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-pnru text-white'
                            : isDisabled
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        aria-label={isSelected ? 'ยกเลิกการเลือก' : 'เลือกหลักสูตร'}
                      >
                        {isSelected ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </button>

                      {/* Logo */}
                      <div className="flex items-center justify-center h-24 bg-gray-100 rounded-t-xl">
                        {course.logo ? (
                          <img
                            src={course.logo}
                            alt={course.title}
                            className="w-16 h-16 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'block'
                            }}
                          />
                        ) : null}
                        <GraduationCap
                          className="w-12 h-12 text-gray-400"
                          style={{ display: course.logo ? 'none' : 'block' }}
                        />
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        <h3 className="text-sm font-bold text-pnru mb-1 text-center line-clamp-2 min-h-[2.5rem]">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2 text-center line-clamp-1">
                          {course.title_en}
                        </p>
                        <p className="text-xs text-gray-600 text-center line-clamp-2 mb-3 min-h-[2rem]">
                          {course.description}
                        </p>

                        {/* Divider */}
                        <hr className="border-gray-200 mb-3" />

                        {/* Link */}
                        <a
                          href={`/courses/${course.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center gap-1 text-pnru hover:text-opacity-80 font-medium text-xs transition-colors"
                        >
                          ดูรายละเอียด
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
              )}
            </div>
          </div>

          {/* Comparison Preview Panel — shown first on mobile so the selection/compare
              button is visible without scrolling past the whole course grid; reverts to
              its original right-column position on desktop */}
          <aside className="order-1 lg:order-2 lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:sticky lg:top-28">
              {selectedCourses.length === 0 ? (
                // Empty State
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-[#E8F5F1] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Scale className="w-10 h-10 text-pnru" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    ยังไม่ได้เลือกสาขาเพื่อเปรียบเทียบ
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    กรุณาเลือกอย่างน้อย {MIN_SELECTION} สาขา (สูงสุด {MAX_SELECTION} สาขา) เพื่อเริ่มเปรียบเทียบ
                  </p>
                  <div className="text-6xl text-gray-300 mb-4">←</div>
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 px-4 py-3 rounded-lg font-medium cursor-not-allowed"
                  >
                    ถัดไป
                  </button>
                </div>
              ) : (
                // Selected Courses
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    สาขาที่เลือก ({selectedCourses.length})
                  </h3>

                  <div className="space-y-3 mb-6">
                    {selectedCoursesData.map(course => (
                      <div
                        key={course.id}
                        className="bg-gray-50 rounded-lg p-3 flex items-start justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800 truncate">
                            {course.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {course.title_en}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveCourse(course.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                          aria-label="ลบ"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {selectedCourses.length < MIN_SELECTION && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg mb-4">
                      เลือกอีก {MIN_SELECTION - selectedCourses.length} สาขาเพื่อเริ่มเปรียบเทียบ
                    </p>
                  )}

                  <button
                    onClick={handleCompare}
                    disabled={!canCompare}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      canCompare
                        ? 'bg-pnru text-white hover:bg-opacity-90'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    ถัดไป
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default CompareCourses
