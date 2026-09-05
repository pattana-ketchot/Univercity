import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, Lightbulb, Briefcase, GraduationCap, ArrowRight } from 'lucide-react'
import { supabase, isConfigured } from '../lib/supabase'

const Careers = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      if (!isConfigured) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('courses')
        .select('id, title, title_en, logo, careers')
        .order('title', { ascending: true })

      setCourses((data || []).filter((c) => c.careers && c.careers.length > 0))
      setLoading(false)
    }
    fetchCourses()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-pnru mb-2 flex items-center gap-2">
            <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            อาชีพหลังจบ
          </h1>
          <p className="text-gray-600 text-sm lg:text-base mb-4">
            ตัวอย่างอาชีพที่สามารถประกอบได้หลังสำเร็จการศึกษาในแต่ละสาขา
          </p>

          {/* Info Banner */}
          <div className="bg-[#E8F5F1] border border-pnru/20 rounded-lg p-4 flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-pnru flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              อาชีพที่แสดงเป็นเพียงตัวอย่าง สามารถประกอบอาชีพอื่น ๆ เพิ่มเติมตามความถนัดและความสนใจได้
            </p>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Career Course Cards */}
          <div className="lg:col-span-4">
            {loading ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
                กำลังโหลดข้อมูล...
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">ยังไม่มีข้อมูลหลักสูตร</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                {courses.map(course => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-pnru transition-all flex flex-col"
                  >
                    {/* Logo */}
                    <div className="flex items-center justify-center h-28 bg-gray-100 rounded-t-xl">
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
                        className="w-14 h-14 text-gray-400"
                        style={{ display: course.logo ? 'none' : 'block' }}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-base lg:text-lg font-bold text-pnru mb-3 text-center min-h-[3rem] flex items-center justify-center">
                        {course.title}
                      </h3>

                      {/* Career List */}
                      <div className="mb-4 flex-1">
                        <ul className="space-y-1.5">
                          {course.careers.map((career, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-pnru mt-1 flex-shrink-0">•</span>
                              <span className="leading-tight">{career}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Divider */}
                      <hr className="border-gray-200 mb-3" />

                      {/* Link */}
                      <Link
                        to={`/courses/${course.id}`}
                        className="flex items-center justify-center gap-2 text-pnru hover:text-opacity-80 font-medium text-sm transition-colors"
                      >
                        ดูรายละเอียด
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Career Planning Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-28">
              {/* Icon */}
              <div className="w-16 h-16 bg-[#E8F5F1] rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-pnru" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
                วางแผนอนาคตของคุณตั้งแต่วันนี้
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 text-center mb-4">
                ค้นหาสาขาที่ใช่ พัฒนาทักษะที่ชอบ และเตรียมพร้อมรับโอกาสที่คุณสนใจได้
              </p>

              {/* Action Item */}
              <div className="bg-[#E8F5F1] rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="w-6 h-6 text-pnru flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-gray-800 mb-1">
                      ทุกสาขามีโอกาสเติบโตในสายอาชีพ
                    </p>
                    <p className="text-xs text-gray-600">
                      เลือกเส้นทางที่ใช่ ค้นหาความถนัดของคุณ
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <a
                href="/find-major"
                className="block w-full bg-pnru text-white text-center py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
              >
                ค้นหาสาขาที่เหมาะกับฉัน
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Careers
