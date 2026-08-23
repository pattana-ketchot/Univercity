import { useState, useEffect } from 'react'
import { Calendar, ArrowRight } from 'lucide-react'
import { supabase, isConfigured } from '../lib/supabase'

const Banner = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  // ข้อมูล fallback สำหรับกรณีที่ยังไม่ได้ตั้งค่า Supabase
  const fallbackNews = [
    {
      id: 1,
      image: '/assets/news/news1.png',
      title: 'มหาวิทยาลัยราชภัฏพิบูลสงคราม เปิดรับสมัครนักศึกษาใหม่ ประจำปีการศึกษา 2567',
      date: '15 มกราคม 2567',
      category: 'ข่าวรับสมัคร',
      description: 'เปิดรับสมัครนักศึกษาใหม่ในหลากหลายสาขาวิชา พร้อมทุนการศึกษาสำหรับผู้มีผลการเรียนดี'
    },
    {
      id: 2,
      image: '/assets/news/news2.png',
      title: 'โครงการแนะแนวการศึกษาต่อ "เปิดโลกสาขาวิชา ค้นหาตัวตนที่แท้จริง"',
      date: '10 มกราคม 2567',
      category: 'กิจกรรม',
      description: 'ชวนน้องๆ ม.ปลายมาร่วมกิจกรรมแนะแนวการศึกษา พบกับอาจารย์และรุ่นพี่จากทุกคณะ'
    },
    {
      id: 3,
      image: '/assets/news/news3.png',
      title: 'ทุนการศึกษาเพื่อนักเรียนที่มีความสามารถพิเศษ ประจำปี 2567',
      date: '5 มกราคม 2567',
      category: 'ทุนการศึกษา',
      description: 'มอบทุนการศึกษาเต็มจำนวนสำหรับนักเรียนที่มีผลงานดีเด่นด้านวิชาการและกีฬา'
    }
  ]

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    // ถ้ายังไม่ได้ตั้งค่า Supabase ให้ใช้ข้อมูล fallback
    if (!isConfigured) {
      setNews(fallbackNews)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false })
        .limit(3)

      if (error) {
        console.error('Error fetching news:', error)
        setNews(fallbackNews)
      } else if (data && data.length > 0) {
        setNews(data)
      } else {
        setNews(fallbackNews)
      }
    } catch (error) {
      console.error('Error:', error)
      setNews(fallbackNews)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 w-full">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pnru"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข่าวสาร...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50 w-full">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-pnru mb-4">
            ข่าวสารและประชาสัมพันธ์
          </h2>
          <p className="text-lg text-gray-600">
            ติดตามข่าวสารและกิจกรรมล่าสุดจากมหาวิทยาลัย
          </p>
        </div>

        {/* News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {news.map((newsItem) => (
            <div
              key={newsItem.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Image Section */}
              <div className="w-full h-48 bg-gray-200 overflow-hidden">
                <img
                  src={newsItem.image}
                  alt={newsItem.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-pnru/10 to-green-100"><span class="text-6xl">📰</span></div>'
                  }}
                />
              </div>

              {/* Content Section */}
              <div className="p-6 flex flex-col flex-grow">
                {/* Category & Date */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block bg-pnru/10 text-pnru text-xs font-semibold px-3 py-1 rounded-full">
                    {newsItem.category}
                  </span>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{newsItem.date}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-navy mb-3 leading-snug line-clamp-2">
                  {newsItem.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed flex-grow mb-5 line-clamp-3">
                  {newsItem.description}
                </p>

                {/* Divider Line */}
                <div className="w-full h-px bg-gray-200 mb-4"></div>

                {/* Read More Button */}
                <a
                  href="#"
                  className="text-pnru font-medium text-sm flex items-center justify-center gap-2 group hover:text-green-700 transition-colors"
                >
                  <span>อ่านเพิ่มเติม</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* View All News Button */}
        <div className="text-center mt-10">
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-pnru text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            ดูข่าวสารทั้งหมด
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  )
}

export default Banner
