import { useState, useEffect, useRef } from 'react'
import CourseCard from './CourseCard'
import { supabase, isConfigured } from '../lib/supabase'

const CourseCarousel = () => {
  const scrollRef = useRef(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  // ข้อมูล fallback สำหรับกรณีที่ยังไม่ได้ตั้งค่า Supabase
  const fallbackCourses = [
    {
      logo: '/assets/courses/engineering.png',
      title: 'วิศวกรรมศาสตร์',
      titleEn: 'Engineering',
      description: 'พัฒนาทักษะทางด้านวิศวกรรมและเทคโนโลยีสมัยใหม่'
    },
    {
      logo: '/assets/courses/business.png',
      title: 'บริหารธุรกิจ',
      titleEn: 'Business Administration',
      description: 'เรียนรู้การบริหารจัดการและพัฒนาธุรกิจอย่างมืออาชีพ'
    },
    {
      logo: '/assets/courses/computer.png',
      title: 'วิทยาการคอมพิวเตอร์',
      titleEn: 'Computer Science',
      description: 'ศึกษาเทคโนโลยีดิจิทัลและการพัฒนาซอฟต์แวร์'
    },
    {
      logo: '/assets/courses/medicine.png',
      title: 'แพทยศาสตร์',
      titleEn: 'Medicine',
      description: 'การศึกษาด้านการแพทย์และสาธารณสุขอย่างครบวงจร'
    },
    {
      logo: '/assets/courses/arts.png',
      title: 'ศิลปกรรมศาสตร์',
      titleEn: 'Fine Arts',
      description: 'พัฒนาความคิดสร้างสรรค์และทักษะทางศิลปะ'
    },
    {
      logo: '/assets/courses/law.png',
      title: 'นิติศาสตร์',
      titleEn: 'Law',
      description: 'ศึกษากฎหมายและระบบกระบวนการยุติธรรม'
    },
    {
      logo: '/assets/courses/science.png',
      title: 'วิทยาศาสตร์',
      titleEn: 'Science',
      description: 'ค้นพบและเรียนรู้วิทยาศาสตร์ในทุกมิติ'
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
        .limit(10)

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

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (loading) {
    return (
      <section className="bg-white">
        <div className="max-w-[1920px] mx-auto px-12 mb-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pnru"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดหลักสูตร...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white">
      <div className="max-w-[1920px] mx-auto px-12 mb-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-pnru">หลักสูตรในคณะวิทยาศาสตร์และเทคโนโลยี</h2>
          <a href="/courses" className="text-pnru font-medium hover:underline">
            ดูหลักสูตรทั้งหมด →
          </a>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
          >
            <span className="text-xl text-primary">‹</span>
          </button>

          {/* Cards Container */}
          <div
            ref={scrollRef}
            className="flex space-x-4 overflow-x-auto course-scroll pb-2"
          >
            {courses.map((course, index) => (
              <CourseCard
                key={course.id || index}
                logo={course.logo}
                title={course.title}
                titleEn={course.title_en}
                description={course.description}
              />
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
          >
            <span className="text-xl text-primary">›</span>
          </button>
        </div>
      </div>
    </section>
  )
}

export default CourseCarousel
