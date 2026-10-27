import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SciConnectCard from './SciConnectCard'

const SciConnectNews = () => {
  const [news, setNews] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error

  useEffect(() => {
    let cancelled = false

    // อ่านจาก backend ของเราเอง (web.external_news) ไม่ใช่ /api/sci-connect-news
    // ซึ่งเป็นของ webapi ที่ยังอ่าน Supabase อยู่ — ดู test/noSupabase.test.mjs
    fetch('/api/site/external-news')
      .then((res) => {
        if (!res.ok) throw new Error('request failed')
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        if (!Array.isArray(data.news) || data.news.length === 0) {
          setStatus('error')
          return
        }
        setNews(data.news)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'loading') {
    return <div className="py-16 text-center text-gray-500">กำลังโหลดข่าว SCI Connect...</div>
  }

  if (status === 'error') {
    return <div className="py-16 text-center text-gray-500">ไม่สามารถโหลดข่าว SCI Connect ได้ในขณะนี้</div>
  }

  return (
    <section className="pt-10 sm:pt-12 lg:pt-16 bg-white w-full">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pnru mb-3 sm:mb-4">ข่าวและกิจกรรมล่าสุด</h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">ข่าวและกิจกรรมล่าสุดจาก Facebook ของคณะ</p>
        </div>

        {/* Mobile: horizontal-scroll single-card carousel (same overflow-x-auto pattern as
            CourseCarousel, swipeable via native touch scroll). md+: reverts to the original
            grid — SciConnectCard itself is untouched (shared with SciConnectAll), so this
            wrapper div is what carries the responsive sizing. */}
        <div className="flex gap-4 overflow-x-auto course-scroll pb-2 md:grid md:overflow-visible md:pb-0 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {news.map((item, index) => (
            <div key={item.slug || index} className="w-[min(87vw,380px)] flex-shrink-0 md:w-auto md:flex-shrink">
              <SciConnectCard item={item} index={index} />
            </div>
          ))}
        </div>

        <div className="text-center mt-6 sm:mt-8 lg:mt-10">
          <Link
            to="/sci-connect"
            className="inline-flex items-center gap-2 bg-pnru text-white px-6 sm:px-7 lg:px-8 py-2.5 lg:py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            ข่าวสารทั้งหมด
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default SciConnectNews
