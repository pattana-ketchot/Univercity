import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SciConnectCard from '../components/SciConnectCard'

const SciConnectAll = () => {
  const [news, setNews] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error

  useEffect(() => {
    let cancelled = false

    // อ่านจาก backend ของเราเอง ไม่ใช่ webapi ที่ยังอ่าน Supabase
    fetch('/api/site/external-news?limit=15')
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

  return (
    <section className="py-16 bg-white w-full min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex min-h-[44px] items-center text-pnru font-medium hover:underline">
          ← กลับหน้าแรก
        </Link>

        <div className="text-center mb-12 mt-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-pnru mb-4">ข่าวสารทั้งหมด</h1>
          <p className="text-lg text-gray-600">ข่าวและกิจกรรมจาก SCI Connect ของคณะ</p>
        </div>

        {status === 'loading' && (
          <p className="text-center text-gray-500 py-8">กำลังโหลดข่าว...</p>
        )}

        {status === 'error' && (
          <p className="text-center text-gray-500 py-8">ไม่สามารถโหลดข่าวได้ในขณะนี้</p>
        )}

        {status === 'ready' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {news.map((item, index) => (
              <SciConnectCard key={item.slug || index} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default SciConnectAll
