import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Trash2, X, Check, GraduationCap, Sparkles, Loader2, AlertTriangle } from 'lucide-react'
import { supabase, isConfigured } from '../lib/supabase'

const CompareResult = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  useEffect(() => {
    const fetchCourses = async () => {
      const courseIds = searchParams.get('courses')?.split(',').filter(Boolean) || []

      if (!isConfigured || courseIds.length === 0) {
        setSelectedCourses([])
        setLoading(false)
        return
      }

      setLoading(true)
      const { data } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds)

      const merged = (data || []).map((course) => ({
        ...course,
        careers: course.careers || []
      }))

      // Keep the order the user selected them in
      const ordered = courseIds
        .map((id) => merged.find((c) => c.id === id))
        .filter(Boolean)

      setSelectedCourses(ordered)
      // การเปลี่ยนชุดสาขาทำให้ผลวิเคราะห์เดิมใช้ไม่ได้
      setAiResult(null)
      setAiError('')
      setLoading(false)
    }

    fetchCourses()
  }, [searchParams])

  const runAiCompare = async () => {
    if (selectedCourses.length < 2) return

    setAiLoading(true)
    setAiError('')
    setAiResult(null)

    try {
      const payload = selectedCourses.map((c) => ({
        id: c.id,
        title: c.title,
        title_en: c.title_en,
        description: c.description,
        careers: c.careers
      }))

      const response = await fetch('/api/compare-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses: payload })
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'AI request failed')
      }

      setAiResult(await response.json())
    } catch {
      setAiError('ระบบ AI ไม่สามารถวิเคราะห์การเปรียบเทียบได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setAiLoading(false)
    }
  }

  const handleRemoveCourse = (courseId) => {
    const newIds = selectedCourses
      .filter(c => c.id !== courseId)
      .map(c => c.id)
      .join(',')

    if (newIds) {
      setSearchParams({ courses: newIds })
    } else {
      navigate('/compare')
    }
  }

  const handleClearAll = () => {
    setShowConfirmClear(true)
  }

  const confirmClearAll = () => {
    setShowConfirmClear(false)
    navigate('/compare')
  }

  const handleAddMore = () => {
    navigate('/compare')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-pnru mb-4">
            ผลการเปรียบเทียบ
          </h1>
          <p className="text-gray-600 text-sm lg:text-base mb-6">
            เปรียบเทียบความแตกต่างของแต่ละสาขาที่คุณเลือก
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddMore}
              className="inline-flex items-center gap-2 px-4 py-2 bg-pnru text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              เพิ่มสาขาอื่น
            </button>
            {selectedCourses.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                ล้างทั้งหมด
              </button>
            )}
          </div>
        </div>

        {/* AI Comparison */}
        {!loading && selectedCourses.length >= 2 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pnru" />
                <h2 className="text-lg lg:text-xl font-bold text-gray-800">เปรียบเทียบด้วย AI</h2>
              </div>
              {!aiLoading && (
                <button
                  onClick={runAiCompare}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-pnru text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  {aiResult ? 'วิเคราะห์อีกครั้ง' : 'ให้ AI ช่วยวิเคราะห์'}
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              ให้ AI สรุปจุดเด่น ข้อควรพิจารณา และความเหมาะสมของแต่ละสาขา จากข้อมูลหลักสูตรที่มีในระบบ
            </p>

            {aiLoading && (
              <div className="mt-5 flex flex-col items-center justify-center text-center py-6">
                <Loader2 className="w-8 h-8 text-pnru animate-spin mb-3" />
                <p className="text-sm text-gray-600">AI กำลังวิเคราะห์การเปรียบเทียบ...</p>
              </div>
            )}

            {!aiLoading && aiError && (
              <div className="mt-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}

            {!aiLoading && aiResult && (
              <div className="mt-5 space-y-5">
                {aiResult.summary && (
                  <p className="text-sm lg:text-base text-gray-700 leading-relaxed">{aiResult.summary}</p>
                )}

                {Array.isArray(aiResult.courses) && aiResult.courses.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiResult.courses.map((item) => {
                      const course = selectedCourses.find((c) => c.id === item.courseId)
                      return (
                        <div key={item.courseId} className="rounded-lg border border-gray-200 p-4">
                          <h3 className="font-bold text-pnru">{course?.title || 'สาขา'}</h3>
                          {item.bestFor && (
                            <p className="mt-1 text-sm text-gray-600">
                              <span className="font-medium text-gray-800">เหมาะกับ:</span> {item.bestFor}
                            </p>
                          )}
                          {Array.isArray(item.pros) && item.pros.length > 0 && (
                            <ul className="mt-3 space-y-1.5">
                              {item.pros.map((p, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <Check className="w-4 h-4 text-pnru flex-shrink-0 mt-0.5" />
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {Array.isArray(item.cons) && item.cons.length > 0 && (
                            <ul className="mt-2 space-y-1.5">
                              {item.cons.map((c, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
                                  <span className="text-amber-500 font-bold leading-none mt-0.5">!</span>
                                  <span>{c}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {aiResult.verdict && (
                  <div className="bg-[#E8F5F1] border border-pnru/20 rounded-lg p-4">
                    <p className="text-sm lg:text-base text-pnru font-medium leading-relaxed">{aiResult.verdict}</p>
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  สร้างโดย AI จากข้อมูลหลักสูตรในระบบ • โปรดใช้วิจารณญาณประกอบการตัดสินใจ
                </p>
              </div>
            )}
          </div>
        )}

        {/* Comparison Table */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
            กำลังโหลดข้อมูล...
          </div>
        ) : selectedCourses.length >= 2 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="bg-pnru/10 px-4 py-4 text-left text-sm font-bold text-pnru border-r border-gray-200 sticky left-0 z-20 min-w-[200px]">
                      หัวข้อเปรียบเทียบ
                    </th>
                    {selectedCourses.map(course => (
                      <th key={course.id} className="bg-white px-4 py-4 min-w-[280px]">
                        <div className="flex flex-col items-center gap-3">
                          {/* Logo */}
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            {course.logo ? (
                              <img
                                src={course.logo}
                                alt={course.title}
                                className="w-12 h-12 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'block'
                                }}
                              />
                            ) : null}
                            <GraduationCap
                              className="w-10 h-10 text-gray-400"
                              style={{ display: course.logo ? 'none' : 'block' }}
                            />
                          </div>

                          {/* Course Name */}
                          <div className="text-center">
                            <h3 className="font-bold text-pnru mb-1">{course.title}</h3>
                            <p className="text-xs text-gray-500">{course.title_en}</p>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveCourse(course.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="ลบ"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {/* Row: Description */}
                  <tr className="border-b border-gray-200">
                    <td className="bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-700 border-r border-gray-200 sticky left-0 z-10">
                      รายละเอียดหลักสูตร
                    </td>
                    {selectedCourses.map(course => (
                      <td key={course.id} className="px-4 py-4 text-sm text-gray-600">
                        {course.description}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Careers */}
                  <tr>
                    <td className="bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-700 border-r border-gray-200 sticky left-0 z-10">
                      อาชีพที่สามารถทำได้
                    </td>
                    {selectedCourses.map(course => (
                      <td key={course.id} className="px-4 py-4">
                        <ul className="space-y-1">
                          {course.careers.map((career, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <Check className="w-4 h-4 text-pnru mt-0.5 flex-shrink-0" />
                              <span>{career}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Empty State
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              กรุณาเลือกอย่างน้อย 2 สาขาเพื่อเปรียบเทียบ
            </h3>
            <p className="text-gray-500 mb-6">
              คุณสามารถเลือกได้สูงสุด 4 สาขา
            </p>
            <button
              onClick={handleAddMore}
              className="bg-pnru text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              เลือกสาขา
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              ยืนยันการล้างข้อมูล
            </h3>
            <p className="text-gray-600 mb-6">
              คุณต้องการลบหลักสูตรที่เลือกทั้งหมดใช่หรือไม่?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmClearAll}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompareResult
