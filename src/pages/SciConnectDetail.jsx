import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'

const SciConnectDetail = () => {
  const { slug } = useParams()
  const [item, setItem] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | not-found | error

  useEffect(() => {
    let cancelled = false

    // อ่านจาก backend ของเราเอง ไม่ใช่ webapi ที่ยังอ่าน Supabase
    //
    // เส้นทางใหม่คืนตัวข่าวตรง ๆ ไม่ได้ห่อใน { item } และตอบ 404 เมื่อไม่พบ
    // จึงต้องแยก 404 ออกจากข้อผิดพลาดอื่น ไม่งั้นข่าวที่ไม่มีจะขึ้นว่า "ระบบมีปัญหา"
    fetch(`/api/site/external-news/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (res.status === 404) return null
        if (!res.ok) throw new Error('request failed')
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        if (!data || !data.slug) {
          setStatus('not-found')
          return
        }
        setItem(data)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (status === 'loading') {
    return <div className="py-24 text-center text-gray-500">กำลังโหลดข่าว...</div>
  }

  if (status === 'not-found' || status === 'error') {
    return (
      <div className="py-24 text-center">
        <p className="text-gray-500 mb-4">
          {status === 'not-found' ? 'ไม่พบข่าวนี้' : 'ไม่สามารถโหลดข่าวได้ในขณะนี้'}
        </p>
        <Link to="/" className="inline-flex min-h-[44px] items-center text-pnru font-medium hover:underline">
          ← กลับหน้าแรก
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="inline-flex min-h-[44px] items-center text-pnru font-medium hover:underline">
        ← กลับหน้าแรก
      </Link>

      <article className="mt-6">
        {item.image_url && (
          <div className="w-full rounded-2xl overflow-hidden bg-gray-200 mb-6">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-auto"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        )}

        <span className="inline-block bg-pnru/10 text-pnru text-xs font-semibold px-3 py-1 rounded-full mb-4">
          SCI Connect
        </span>

        <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-3 leading-snug">
          {item.title}
        </h1>

        <p className="text-gray-500 text-sm mb-6">{item.published_date}</p>

        <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line mb-8">
          {item.description}
        </p>

        {item.facebook_url && (
          <a
            href={item.facebook_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-pnru text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            <ExternalLink className="w-4 h-4" />
            อ่านข่าวต้นฉบับ
          </a>
        )}
      </article>
    </div>
  )
}

export default SciConnectDetail
