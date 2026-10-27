import { useRef, useState, useEffect } from 'react'
import { GraduationCap, Briefcase, Database, ShieldCheck } from 'lucide-react'
import { fetchSiteCourses } from '../lib/siteCourses'
import Reveal from './Reveal'

const StatItem = ({ item }) => {
  const Icon = item.icon
  return (
    <div className="flex items-center gap-4">
      <Icon
        className="w-9 h-9 lg:w-11 lg:h-11 flex-shrink-0 text-pnru"
        strokeWidth={1.75}
      />
      <p className="leading-snug">
        <span className="block font-bold text-lg lg:text-xl text-pnru">
          {item.number}
        </span>
        <span className="block text-sm text-gray-600">
          {item.label}
        </span>
      </p>
    </div>
  )
}

const HomeQuickLinks = () => {
  const scrollRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [totalCourses, setTotalCourses] = useState(null)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setTotalCourses((await fetchSiteCourses()).length)
      } catch {
        // นับไม่ได้ก็ไม่ต้องแสดงตัวเลข ดีกว่าแสดง 0 ซึ่งอ่านว่า "ไม่มีหลักสูตร"
      }
    }
    fetchCount()
  }, [])

  const stats = [
    {
      number: totalCourses === null ? '...' : `${totalCourses}+`,
      label: 'หลักสูตร',
      icon: GraduationCap,
    },
    {
      number: 'แนะแนวอาชีพ',
      label: 'จากผู้เชี่ยวชาญ',
      icon: Briefcase,
    },
    {
      number: 'ข้อมูลจริง',
      label: 'จากหลักสูตร',
      icon: Database,
    },
    {
      number: 'เชื่อถือได้',
      label: 'อัพเดตทุกปี',
      icon: ShieldCheck,
    },
  ]

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el || el.clientWidth === 0) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    setActiveIndex(index)
  }

  return (
    <section className="bg-cream">
      <Reveal className="max-w-[1400px] mx-auto py-10 lg:py-12 mb-8">
        {/* Desktop / Tablet: horizontal grid, no carousel */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6 lg:gap-x-12 px-6 lg:px-12">
          {stats.map((item, index) => (
            <StatItem key={index} item={item} />
          ))}
        </div>

        {/* Mobile: horizontal scroll-snap slider, one item per view */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="sm:hidden flex overflow-x-auto snap-x snap-mandatory course-scroll"
        >
          {stats.map((item, index) => (
            <div key={index} className="min-w-full flex-shrink-0 snap-start px-6">
              <StatItem item={item} />
            </div>
          ))}
        </div>

        {/* Pagination dots (mobile only) */}
        <div className="sm:hidden flex justify-center gap-2 mt-6">
          {stats.map((_, index) => (
            <span
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                index === activeIndex ? 'bg-pnru' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </Reveal>
    </section>
  )
}

export default HomeQuickLinks
