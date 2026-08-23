import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Trash2, X, Star, Check, GraduationCap } from 'lucide-react'
import { supabase, isConfigured } from '../lib/supabase'

const CompareResult = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCourses, setSelectedCourses] = useState([])
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const courseIds = searchParams.get('courses')
    if (courseIds) {
      fetchCoursesById(courseIds.split(','))
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const fetchCoursesById = async (ids) => {
    setLoading(true)

    // ถ้ายังไม่ได้ตั้งค่า Supabase ให้ใช้ข้อมูล fallback
    if (!isConfigured) {
      setSelectedCourses(getFallbackCoursesById(ids))
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .in('id', ids)

      if (error) {
        console.error('Error fetching courses:', error)
        setSelectedCourses(getFallbackCoursesById(ids))
      } else if (data && data.length > 0) {
        // เพิ่มข้อมูลเพิ่มเติมที่ไม่มีใน database
        const enrichedCourses = data.map(course => enrichCourseData(course))
        setSelectedCourses(enrichedCourses)
      } else {
        setSelectedCourses(getFallbackCoursesById(ids))
      }
    } catch (error) {
      console.error('Error:', error)
      setSelectedCourses(getFallbackCoursesById(ids))
    } finally {
      setLoading(false)
    }
  }

  // เพิ่มข้อมูลเสริมที่ไม่มีใน database
  const enrichCourseData = (course) => {
    return {
      ...course,
      duration: '4 ปี (8 ภาคการศึกษา)',
      credits: 'ไม่น้อยกว่า 130 หน่วยกิต',
      highlights: [
        'หลักสูตรที่ทันสมัย',
        'อาจารย์ผู้เชี่ยวชาญ',
        'ห้องปฏิบัติการครบครัน',
        'โอกาสฝึกงาน'
      ],
      skills: ['วิชาชีพ', 'การสื่อสาร', 'การทำงานเป็นทีม', 'การแก้ปัญหา', 'เทคโนโลยี'],
      careers: ['นักวิชาชีพ', 'นักวิจัย', 'ผู้ประกอบการ', 'ที่ปรึกษา'],
      jobOpportunity: { stars: 4, label: 'สูง' },
      suitability: 'เหมาะกับผู้ที่สนใจและมีความมุ่งมั่นในสาขานี้'
    }
  }

  // Fallback data
  const getFallbackCoursesById = (ids) => {
    const fallbackCourses = [
      {
        id: 1,
        title: 'วิทยาการคอมพิวเตอร์',
        title_en: 'Computer Science',
        description: 'เรียนรู้การพัฒนาซอฟต์แวร์ AI และ Data Science',
        logo: '/assets/courses/computer.png',
        duration: '4 ปี (8 ภาคการศึกษา)',
        credits: 'ไม่น้อยกว่า 129 หน่วยกิต',
        highlights: ['Programming และ Algorithm', 'AI และ Machine Learning', 'Data Science', 'Software Engineering'],
        skills: ['Python', 'JavaScript', 'Database', 'Cloud Computing', 'AI/ML'],
        careers: ['Software Developer', 'Data Scientist', 'AI Engineer', 'System Analyst'],
        jobOpportunity: { stars: 5, label: 'สูงมาก' },
        suitability: 'เหมาะกับผู้ที่ชอบแก้ปัญหาและคิดเชิงตรรกะ'
      },
      {
        id: 2,
        title: 'เทคโนโลยีสารสนเทศ',
        title_en: 'Information Technology',
        description: 'การจัดการระบบ เครือข่าย และความปลอดภัย',
        logo: '/assets/courses/it.png',
        duration: '4 ปี (8 ภาคการศึกษา)',
        credits: 'ไม่น้อยกว่า 130 หน่วยกิต',
        highlights: ['Network และ Security', 'IT Infrastructure', 'Database Management', 'IT Service Management'],
        skills: ['Network', 'Cybersecurity', 'Cloud', 'System Admin', 'IT Support'],
        careers: ['Network Engineer', 'Security Analyst', 'IT Manager', 'Cloud Architect'],
        jobOpportunity: { stars: 5, label: 'สูงมาก' },
        suitability: 'เหมาะกับผู้ที่สนใจระบบและโครงสร้างพื้นฐานทาง IT'
      },
      {
        id: 3,
        title: 'คณิตศาสตร์',
        title_en: 'Mathematics',
        description: 'พื้นฐานทางคณิตศาสตร์และการประยุกต์',
        logo: '/assets/courses/math.png',
        duration: '4 ปี (8 ภาคการศึกษา)',
        credits: 'ไม่น้อยกว่า 128 หน่วยกิต',
        highlights: ['Calculus และ Analysis', 'Statistics', 'Applied Mathematics', 'Mathematical Modeling'],
        skills: ['Analytical Thinking', 'Statistics', 'Data Analysis', 'Problem Solving', 'R/Python'],
        careers: ['Data Analyst', 'Actuary', 'Math Teacher', 'Research Scientist'],
        jobOpportunity: { stars: 4, label: 'สูง' },
        suitability: 'เหมาะกับผู้ที่มีความสามารถทางคณิตศาสตร์และชอบวิเคราะห์'
      }
    ]

    return fallbackCourses.filter(course => ids.includes(String(course.id)))
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pnru mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
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

        {/* Comparison Table */}
        {selectedCourses.length >= 2 ? (
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
                  {/* Row: Duration */}
                  <tr className="border-b border-gray-200">
                    <td className="bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-700 border-r border-gray-200 sticky left-0 z-10">
                      ระยะเวลาการศึกษา
                    </td>
                    {selectedCourses.map(course => (
                      <td key={course.id} className="px-4 py-4 text-sm text-gray-600 text-center">
                        {course.duration}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Credits */}
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <td className="bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-700 border-r border-gray-200 sticky left-0 z-10">
                      หน่วยกิตรวม
                    </td>
                    {selectedCourses.map(course => (
                      <td key={course.id} className="px-4 py-4 text-sm text-gray-600 text-center">
                        {course.credits}
                      </td>
                    ))}
                  </tr>

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

                  {/* Row: Highlights */}
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <td className="bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-700 border-r border-gray-200 sticky left-0 z-10">
                      วิชาเด่น / เน้นเรียนอะไร
                    </td>
                    {selectedCourses.map(course => (
                      <td key={course.id} className="px-4 py-4">
                        <ul className="space-y-1">
                          {course.highlights.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-pnru mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Skills */}
                  <tr className="border-b border-gray-200">
                    <td className="bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-700 border-r border-gray-200 sticky left-0 z-10">
                      ทักษะที่ได้รับ
                    </td>
                    {selectedCourses.map((course, index) => (
                      <td key={course.id} className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {course.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                index % 2 === 0
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Careers */}
                  <tr className="border-b border-gray-200 bg-gray-50/50">
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

                  {/* Row: Job Opportunity */}
                  <tr className="border-b border-gray-200">
                    <td className="bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-700 border-r border-gray-200 sticky left-0 z-10">
                      โอกาสในการทำงาน
                    </td>
                    {selectedCourses.map(course => (
                      <td key={course.id} className="px-4 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                className={`w-5 h-5 ${
                                  idx < course.jobOpportunity.stars
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {course.jobOpportunity.label}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Suitability */}
                  <tr>
                    <td className="bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-700 border-r border-gray-200 sticky left-0 z-10">
                      ความเหมาะสมกับคุณ
                    </td>
                    {selectedCourses.map(course => (
                      <td key={course.id} className="px-4 py-4 text-sm text-gray-600">
                        {course.suitability}
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
