import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Loader2, RotateCcw, ArrowRight, AlertTriangle, Info, ChevronDown } from 'lucide-react'
import { fetchSiteCourses } from '../lib/siteCourses'
import { forUndergraduateAdvice } from '../lib/courseLevels'
import { getFindMajorAnswers, clearFindMajorAnswers } from '../lib/findMajorAnswers'
import EngineNote from '../components/EngineNote'

const steps = [
  { id: 1, title: 'ข้อมูลพื้นฐาน', status: 'completed' },
  { id: 2, title: 'ความสนใจ', status: 'completed' },
  { id: 3, title: 'ความถนัด', status: 'completed' },
  { id: 4, title: 'เป้าหมายอาชีพ', status: 'completed' },
  { id: 5, title: 'ผลลัพธ์', status: 'current' }
]

const RecommendationCard = ({ course, matchScore, reason, highlight }) => {
  const navigate = useNavigate()
  if (!course) return null

  return (
    <div className={`rounded-xl border-2 p-5 lg:p-6 ${highlight ? 'border-pnru bg-[#E8F5F1]' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-lg lg:text-xl font-bold text-gray-800">{course.title}</h3>
          {course.title_en && <p className="text-sm text-gray-500">{course.title_en}</p>}
        </div>
        <div className={`shrink-0 px-3 py-1 rounded-full text-sm font-semibold ${highlight ? 'bg-pnru text-white' : 'bg-gray-100 text-gray-700'}`}>
          {matchScore}% เหมาะสม
        </div>
      </div>
      <p className="text-sm lg:text-base text-gray-700 leading-relaxed mb-4">{reason}</p>
      <button
        onClick={() => navigate(`/courses/${course.id}`)}
        className={`inline-flex min-h-[44px] items-center gap-2 text-sm font-medium ${highlight ? 'text-pnru' : 'text-gray-600'} hover:underline`}
      >
        ดูรายละเอียดหลักสูตร
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

/**
 * คำอธิบายที่มาของเปอร์เซ็นต์ แบบกดเปิด/ปิด
 *
 * ผู้ใช้เห็น "65% เหมาะสม" แล้วเข้าใจได้ง่ายว่าเป็นโอกาสที่จะเหมาะหรือเรียนสำเร็จ ซึ่งไม่ใช่ —
 * หลังบ้านวัดความใกล้เคียงระหว่างคำตอบกับเนื้อหาในเอกสารหลักสูตรและชื่อสาขา คิดแยกทีละสาขา
 * ส่วน AI เขียนเฉพาะคำอธิบายเหตุผล ไม่ได้ให้คะแนน
 *
 * ข้อที่ใช้คำนวณคือวิชาที่ชอบ ความสนใจ ความถนัด และเป้าหมายอาชีพเท่านั้น สายการเรียนและ
 * สภาพแวดล้อมการทำงานใช้แค่ตอนเขียนเหตุผล จึงเขียนว่า "ได้แก่" ไม่ใช่ "เช่น"
 */
const ScoreExplanation = () => {
  const [open, setOpen] = useState(false)
  const panelId = 'score-explanation-panel'

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md text-sm font-medium text-pnru hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-pnru/40"
      >
        <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
        เปอร์เซ็นต์คำนวณอย่างไร?
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-label="เปอร์เซ็นต์คำนวณอย่างไร"
        hidden={!open}
        className="mt-3 rounded-lg bg-[#E8F5F1] p-4 text-sm text-gray-700 leading-relaxed space-y-2"
      >
        <p>
          คะแนนความใกล้เคียงคำนวณจากคำตอบในแบบสอบถาม ได้แก่ วิชาที่ชอบ ความสนใจ ความถนัด
          และเป้าหมายอาชีพ โดยนำไปเปรียบเทียบกับเนื้อหาจริงในเอกสารหลักสูตรและชื่อของแต่ละสาขา
          ส่วน AI ทำหน้าที่เขียนคำอธิบายเหตุผลเท่านั้น ไม่ได้เป็นผู้ให้คะแนน
        </p>
        <p className="text-gray-600">
          <span className="font-semibold text-gray-700">หมายเหตุ:</span>{' '}
          เปอร์เซ็นต์นี้เป็นระดับความใกล้เคียงของข้อมูล ไม่ใช่ความน่าจะเป็นที่จะเรียนสำเร็จหรือเหมาะสมแบบตายตัว
          และคะแนนของแต่ละสาขาคำนวณแยกกัน จึงไม่จำเป็นต้องรวมกันเป็น 100%
        </p>
      </div>
    </div>
  )
}

const FindMajorResult = () => {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState(null)
  const [courses, setCourses] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const findCourse = (id) => courses.find((c) => c.id === id)

  const runRecommendation = useCallback(async (savedAnswers, coursesData) => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/recommend-major', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: savedAnswers, courses: coursesData })
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'AI request failed')
      }

      setResult(await response.json())
    } catch (err) {
      setError('ขออภัยครับ ระบบ AI ไม่สามารถวิเคราะห์ผลลัพธ์ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const savedAnswers = getFindMajorAnswers()

    if (!savedAnswers.track && (!savedAnswers.interests || savedAnswers.interests.length === 0)) {
      navigate('/find-major')
      return
    }

    setAnswers(savedAnswers)

    const init = async () => {
      let data = []
      try {
        // แบบสอบถามถามสายการเรียนระดับ ม.ปลาย/ปวช. คนที่ตอบคือผู้เลือกปริญญาตรี
        // จึงต้องตัดหลักสูตรบัณฑิตศึกษาออกก่อนส่งให้ AI จัดอันดับ
        // ไม่งั้นนักเรียน ม.6 จะได้คำแนะนำให้เรียนปริญญาโทหรือเอก
        data = forUndergraduateAdvice(await fetchSiteCourses())
      } catch {
        setError('ระบบยังอ่านข้อมูลสาขาวิชาไม่ได้ในขณะนี้')
        setLoading(false)
        return
      }

      if (data.length === 0) {
        setError('ไม่พบข้อมูลสาขาวิชาในระบบ')
        setLoading(false)
        return
      }

      setCourses(data)
      await runRecommendation(savedAnswers, data)
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRetry = () => {
    if (answers && courses.length > 0) {
      runRecommendation(answers, courses)
    }
  }

  const handleRestart = () => {
    clearFindMajorAnswers()
    navigate('/find-major')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Steps */}
          <aside className="lg:col-span-3">
            <div className="bg-[#E8F5F1] rounded-xl lg:rounded-2xl p-4 lg:p-6 lg:sticky lg:top-28">
              <h2 className="text-xl lg:text-2xl font-bold text-pnru mb-2">
                ค้นหาสาขาที่เหมาะกับคุณ
              </h2>
              <p className="text-xs lg:text-sm text-gray-600 mb-4 lg:mb-6">
                ตอบแบบสอบถามสั้น ๆ เพื่อค้นหาสาขาที่ใช่สำหรับคุณ
              </p>
              <div className="space-y-3 lg:space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-start">
                    <div className="flex flex-col items-center mr-3">
                      <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center font-medium text-xs lg:text-sm ${
                        step.status === 'completed' || step.status === 'current'
                          ? 'bg-pnru text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {step.status === 'completed' ? '✓' : step.id}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-0.5 h-6 lg:h-8 bg-gray-300 my-1"></div>
                      )}
                    </div>
                    <div className="pt-0.5 lg:pt-1">
                      <p className={`text-sm lg:text-base font-medium ${
                        step.status === 'current' ? 'text-pnru' : 'text-gray-700'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-5 lg:space-y-6">
            <div className="mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-pnru mb-1">ผลลัพธ์</h1>
              <p className="text-xs lg:text-sm text-gray-500 mb-3">ขั้นตอนที่ 5 จาก 5</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-pnru h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <span className="text-sm font-medium text-pnru">100%</span>
              </div>
            </div>

            {loading && (
              <div className="bg-white rounded-xl border border-gray-200 p-10 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-10 h-10 text-pnru animate-spin mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">AI กำลังวิเคราะห์คำตอบของคุณ...</h3>
                <p className="text-sm text-gray-500">SCI Advisor กำลังเทียบคำตอบของคุณกับสาขาที่เปิดสอนทั้งหมด</p>
              </div>
            )}

            {!loading && error && (
              <div className="bg-white rounded-xl border border-red-200 p-8 flex flex-col items-center justify-center text-center">
                <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
                <p className="text-gray-700 mb-5">{error}</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleRetry}
                    className="bg-pnru text-white px-5 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition"
                  >
                    ลองอีกครั้ง
                  </button>
                  <button
                    onClick={handleRestart}
                    className="bg-white border-2 border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    เริ่มทำแบบสอบถามใหม่
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && result && (
              <div className="space-y-5 lg:space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5 lg:p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-pnru" />
                    <h3 className="font-semibold text-gray-800">สรุปจาก AI</h3>
                  </div>
                  <p className="text-sm lg:text-base text-gray-700 leading-relaxed">{result.summary}</p>
                  {/* ใครเขียนคำอธิบาย และคะแนนมาจากไหน — ค่าทั้งหมดมาจากหลังบ้าน */}
                  <EngineNote engine={result.engine} className="mt-2" />
                  <ScoreExplanation />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">สาขาที่แนะนำสำหรับคุณ</h3>
                  <RecommendationCard
                    course={findCourse(result.primary.courseId)}
                    matchScore={result.primary.matchScore}
                    reason={result.primary.reason}
                    highlight
                  />
                </div>

                {result.alternatives?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">สาขาทางเลือกอื่นๆ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.alternatives.map((alt) => (
                        <RecommendationCard
                          key={alt.courseId}
                          course={findCourse(alt.courseId)}
                          matchScore={alt.matchScore}
                          reason={alt.reason}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleRestart}
                    className="inline-flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    เริ่มทำแบบสอบถามใหม่
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default FindMajorResult
