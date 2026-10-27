import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { apiJson } from '../../lib/apiAuth'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import AdminLayout from '../../components/admin/AdminLayout'
import { useToast } from '../../components/admin/Toast'
import { ArrowLeft, AlertCircle } from 'lucide-react'

const CATEGORIES = ['ข่าวรับสมัคร', 'กิจกรรม', 'ทุนการศึกษา', 'ประกาศ']
const STATUSES = [
  { id: 'draft', label: 'ฉบับร่าง' },
  { id: 'published', label: 'เผยแพร่แล้ว' }
]

const emptyForm = { title: '', description: '', category: CATEGORIES[0], date: '', image: '', status: 'draft' }

const NewsFormContent = ({ user }) => {
  const navigate = useNavigate()
  const showToast = useToast()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return

    const fetchNews = async () => {
      let data = null
      let fetchError = null
      try {
        data = await apiJson(`/api/site-admin/news/${id}`)
      } catch (err) {
        fetchError = err
      }
      if (fetchError || !data) {
        setError('ไม่พบข่าวนี้')
        setLoading(false)
        return
      }
      setForm({
        title: data.title || '',
        description: data.description || '',
        category: data.category || CATEGORIES[0],
        // หลังบ้านใช้ชื่อ published_on และ image_url ส่วนฟอร์มใช้ date กับ image
        date: data.published_on || '',
        image: data.image_url || '',
        status: data.status || 'draft'
      })
      setLoading(false)
    }

    fetchNews()
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      // หลังบ้านใช้ชื่อ published_on และ image_url
      published_on: form.date || null,
      image_url: form.image.trim() || null,
      status: form.status
    }

    setSaving(true)
    try {
      // ผู้แก้ไขมาจาก token ที่หลังบ้าน ไม่ต้องส่ง created_by/updated_by มาเอง
      await apiJson(
        isEdit ? `/api/site-admin/news/${id}` : '/api/site-admin/news',
        { method: isEdit ? 'PUT' : 'POST', body: JSON.stringify(payload) }
      )
    } catch (err) {
      setSaving(false)
      setError('บันทึกไม่สำเร็จ: ' + err.message)
      showToast('บันทึกไม่สำเร็จ', 'error')
      return
    }
    setSaving(false)

    showToast(isEdit ? 'บันทึกการแก้ไขเรียบร้อยแล้ว' : 'เพิ่มข่าวเรียบร้อยแล้ว', 'success')

    // เดิมมีการส่งข่าวเข้าดัชนี RAG ของ Supabase ตรงนี้ — เลิกแล้วใน Phase 4
    // เพราะไม่มีที่ใดอ่านตารางนั้นเพื่อตอบคำถามเลย (ดู src/lib/ragIngest.js)

    navigate('/admin/dashboard?tab=news')
  }

  if (loading) {
    return <p className="text-center text-gray-500 py-12">กำลังโหลด...</p>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/admin/dashboard?tab=news" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-pnru mb-4">
        <ArrowLeft className="w-4 h-4" />
        กลับไปข่าวสาร
      </Link>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 space-y-5">
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อข่าว</label>
          <input
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">รายละเอียด</label>
          <textarea
            name="description"
            required
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">หมวดหมู่</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">วันที่</label>
            <input
              type="date"
              name="date"
              required
              value={form.date}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">สถานะ</label>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, status: s.id }))}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm border transition-colors ${
                  form.status === s.id
                    ? 'bg-pnru text-white border-pnru'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">URL รูปภาพ</label>
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="/assets/news/example.png"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-pnru hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </form>
    </div>
  )
}

const NewsForm = () => {
  const { id } = useParams()
  const { user, role, loading: authLoading, logout } = useAdminAuth()

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">กำลังตรวจสอบสิทธิ์...</div>
  }

  return (
    <AdminLayout active="news" title={id ? 'แก้ไขข่าว' : 'เพิ่มข่าวใหม่'} user={user} role={role} onLogout={logout}>
      <NewsFormContent user={user} />
    </AdminLayout>
  )
}

export default NewsForm
