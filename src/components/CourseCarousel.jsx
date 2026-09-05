import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CourseCard from './CourseCard'
import { supabase, isConfigured } from '../lib/supabase'
import Reveal from './Reveal'

const CourseCarousel = () => {
  const scrollRef = useRef(null)
  const [courses, setCourses] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error

  useEffect(() => {
    const fetchCourses = async () => {
      if (!isConfigured) {
        setStatus('ready')
        return
      }
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, title_en, description, logo')
        .order('created_at', { ascending: true })
        .limit(8)

      if (error) {
        setStatus('error')
        return
      }

      setCourses(data || [])
      setStatus('ready')
    }
    fetchCourses()
  }, [])

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="bg-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mb-4">
        {/* Section Header */}
        <Reveal as="div" className="flex items-center justify-between gap-3 mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-pnru">หลักสูตรในคณะวิทยาศาสตร์และเทคโนโลยี</h2>
          <Link to="/courses" className="flex-shrink-0 whitespace-nowrap text-sm md:text-base text-pnru font-medium hover:underline">
            ดูหลักสูตรทั้งหมด →
          </Link>
        </Reveal>

        {/* Carousel */}
        <Reveal delay={140}>
        {status === 'loading' ? (
          <p className="text-center text-gray-500 py-8">กำลังโหลดหลักสูตร...</p>
        ) : status === 'error' ? (
          <p className="text-center text-gray-500 py-8">ไม่สามารถโหลดข้อมูลหลักสูตรได้ในขณะนี้</p>
        ) : courses.length === 0 ? (
          <p className="text-center text-gray-500 py-8">ยังไม่มีข้อมูลหลักสูตร</p>
        ) : (
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 z-10 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
            >
              <span className="text-lg md:text-xl text-primary">‹</span>
            </button>

            {/* Cards Container — fade-only stagger (no transform) so it never fights horizontal swipe/scroll */}
            <div
              ref={scrollRef}
              className="flex space-x-4 overflow-x-auto course-scroll pb-2"
            >
              {courses.map((course, index) => (
                <Reveal
                  as="div"
                  key={course.id}
                  direction="fade"
                  delay={index * 80}
                  className="w-[min(85vw,300px)] xl:w-[310px] 2xl:w-[320px] flex-shrink-0"
                >
                  <CourseCard
                    id={course.id}
                    logo={course.logo}
                    title={course.title}
                    titleEn={course.title_en}
                    description={course.description}
                  />
                </Reveal>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 z-10 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
            >
              <span className="text-lg md:text-xl text-primary">›</span>
            </button>
          </div>
        )}
        </Reveal>
      </div>
    </section>
  )
}

export default CourseCarousel
