import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Save, Upload } from 'lucide-react'

const CourseForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    description: '',
    logo: '',
    category: '',
    careers: []
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [careerInput, setCareerInput] = useState('')

  useEffect(() => {
    if (isEdit) {
      fetchCourse()
    }
  }, [id])

  const fetchCourse = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      alert('ไม่พบข้อมูลหลักสูตร')
      navigate('/admin/dashboard')
    } else {
      setFormData({
        ...data,
        careers: data.careers || [] // แปลง null เป็น []
      })
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddCareer = () => {
    const careers = formData.careers || []
    if (careerInput.trim() && !careers.includes(careerInput.trim())) {
      setFormData({
        ...formData,
        careers: [...careers, careerInput.trim()]
      })
      setCareerInput('')
    }
  }

  const handleRemoveCareer = (index) => {
    const careers = formData.careers || []
    setFormData({
      ...formData,
      careers: careers.filter((_, i) => i !== index)
    })
  }

  const handleCareerKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCareer()
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `course-logos/${fileName}`

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
      logo: publicUrl
    })
    setUploading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit) {
        const { error } = await supabase
          .from('courses')
          .update(formData)
          .eq('id', id)

        if (error) throw error
        alert('อัพเดทหลักสูตรสำเร็จ')
      } else {
        const { error } = await supabase
          .from('courses')
          .insert([formData])

        if (error) throw error
        alert('เพิ่มหลักสูตรสำเร็จ')
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
            {isEdit ? 'แก้ไขหลักสูตร' : 'เพิ่มหลักสูตรใหม่'}
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                โลโก้หลักสูตร
              </label>
              <div className="flex items-start gap-4">
                {formData.logo && (
                  <img
                    src={formData.logo}
                    alt="Preview"
                    className="w-24 h-24 object-contain border border-gray-200 rounded"
                  />
                )}
                <div className="flex-1">
                  <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pnru transition">
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
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pnru focus:border-transparent"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </div>

            {/* Title (Thai) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อหลักสูตร (ภาษาไทย) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pnru focus:border-transparent"
                placeholder="เช่น วิทยาการคอมพิวเตอร์"
              />
            </div>

            {/* Title (English) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อหลักสูตร (ภาษาอังกฤษ) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title_en"
                value={formData.title_en}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pnru focus:border-transparent"
                placeholder="เช่น Computer Science"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                คำอธิบาย <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pnru focus:border-transparent"
                placeholder="คำอธิบายเกี่ยวกับหลักสูตร..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หมวดหมู่
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pnru focus:border-transparent"
              >
                <option value="">-- เลือกหมวดหมู่ --</option>
                <option value="computer">คอมพิวเตอร์และเทคโนโลยี</option>
                <option value="health">วิทยาศาสตร์สุขภาพ</option>
                <option value="science">วิทยาศาสตร์และสิ่งแวดล้อม</option>
                <option value="business">ธุรกิจและการจัดการ</option>
              </select>
            </div>

            {/* Careers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                อาชีพหลังจบ
              </label>

              {/* Career Input */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={careerInput}
                  onChange={(e) => setCareerInput(e.target.value)}
                  onKeyPress={handleCareerKeyPress}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pnru focus:border-transparent"
                  placeholder="เช่น นักพัฒนาซอฟต์แวร์"
                />
                <button
                  type="button"
                  onClick={handleAddCareer}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  เพิ่ม
                </button>
              </div>

              {/* Career List */}
              {formData.careers && formData.careers.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <p className="text-xs text-gray-600 mb-2">อาชีพที่เพิ่มแล้ว:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.careers.map((career, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5"
                      >
                        <span className="text-sm text-gray-700">{career}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCareer(index)}
                          className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                กด Enter หรือคลิก "เพิ่ม" เพื่อเพิ่มอาชีพ
              </p>
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

export default CourseForm
