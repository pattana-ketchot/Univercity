import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Save, Upload } from 'lucide-react'

const NewsForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    image: ''
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const categories = [
    'ข่าวรับสมัคร',
    'กิจกรรม',
    'ทุนการศึกษา',
    'ประกาศ',
    'ข่าวสาร',
    'อื่นๆ'
  ]

  useEffect(() => {
    if (isEdit) {
      fetchNews()
    }
  }, [id])

  const fetchNews = async () => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      alert('ไม่พบข้อมูลข่าวสาร')
      navigate('/admin/dashboard')
    } else {
      setFormData(data)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `news-images/${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from('assets')
      .upload(filePath, file)

    if (uploadError) {
      alert('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath)

    setFormData({
      ...formData,
      image: publicUrl
    })
    setUploading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit) {
        const { error } = await supabase
          .from('news')
          .update(formData)
          .eq('id', id)

        if (error) throw error
        alert('อัพเดทข่าวสารสำเร็จ')
      } else {
        const { error } = await supabase
          .from('news')
          .insert([formData])

        if (error) throw error
        alert('เพิ่มข่าวสารสำเร็จ')
      }

      navigate('/admin/dashboard')
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับ
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEdit ? 'แก้ไขข่าวสาร' : 'เพิ่มข่าวสารใหม่'}
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รูปภาพข่าว
              </label>
              <div className="space-y-4">
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-64 object-cover border border-gray-200 rounded-lg"
                  />
                )}
                <div>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pnru transition">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {uploading ? 'กำลังอัพโหลด...' : 'เลือกรูปภาพ'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">หรือใส่ URL โดยตรง</p>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pnru focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หมวดหมู่ <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pnru focus:border-transparent"
              >
                <option value="">-- เลือกหมวดหมู่ --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หัวข้อข่าว <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pnru focus:border-transparent"
                placeholder="เช่น มหาวิทยาลัยเปิดรับสมัครนักศึกษาใหม่"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pnru focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รายละเอียด <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pnru focus:border-transparent"
                placeholder="รายละเอียดของข่าว..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex items-center gap-2 px-6 py-3 bg-pnru text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewsForm
