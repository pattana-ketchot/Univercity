import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { apiJson } from '../../lib/apiAuth'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import AdminLayout from '../../components/admin/AdminLayout'
import { useToast } from '../../components/admin/Toast'
import { uploadFacultyPhoto, uploadCourseLogo, uploadCourseDocument, removeCourseFile, formatFileSize } from '../../lib/courseStorage'
import { ArrowLeft, AlertCircle, Plus, Trash2, Upload, Loader2, FileText, User, Users, Info, FileEdit, Image as ImageIcon } from 'lucide-react'

const FORM_TABS = [
  { id: 'basic', label: 'ข้อมูลหลักสูตร', icon: FileEdit },
  { id: 'important', label: 'ข้อมูลสำคัญ', icon: Info },
  { id: 'faculty', label: 'คณะอาจารย์', icon: Users }
]

// ตัวแบ่งบรรทัดของช่องที่กรอกเป็นรายการ — ประกาศไว้ที่เดียวเพื่อไม่ให้เขียนผิดคนละแบบ
const LINE_BREAK = String.fromCharCode(10)

// รูปประจำสาขา — ชนิดและขนาดที่รับ
//
// ด่านจริงอยู่ที่หลังบ้าน (ตรวจลายเซ็นไบต์แรกของไฟล์ ไม่ใช่นามสกุล และมีเพดานของหมวดนี้
// เป็น 5 MB) ด่านตรงนี้มีไว้บอกผู้ใช้ทันทีโดยไม่ต้องรออัปโหลดเสร็จก่อนถึงจะรู้ว่าไม่ผ่าน
const LOGO_MIME = { 'image/jpeg': 'JPG', 'image/png': 'PNG', 'image/webp': 'WebP' }
const LOGO_MAX_BYTES = 5 * 1024 * 1024

const LEVEL_OPTIONS = ['ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก', 'ประกาศนียบัตรบัณฑิต', 'อนุปริญญา']
const DURATION_OPTIONS = ['2 ปี', '3 ปี', '4 ปี', '4.5 ปี', '5 ปี', '6 ปี']

// ค่าที่บันทึกไว้แล้วแต่ไม่อยู่ในรายการตัวเลือก ต้องเพิ่มเข้าไปเป็นตัวเลือกด้วย
//
// เช่นหลักสูตรบัณฑิตศึกษาใช้ระยะเวลา "2 ปี (แผน 1 แบบวิชาการ)" ตามที่เว็บคณะประกาศ
// ซึ่งไม่ตรงกับตัวเลือกใด ถ้าไม่เพิ่มเข้าไป select จะแสดงว่างทั้งที่ข้อมูลมีอยู่
// ผู้ดูแลจะมองไม่เห็นค่าเดิมแล้วเผลอเลือกทับของทางการไปโดยไม่รู้ตัว
const withCurrent = (options, current) =>
  current && !options.includes(current) ? [current, ...options] : options

const emptyForm = {
  title: '',
  title_en: '',
  description: '',
  logo: '',
  careersText: '',
  detailLevel: '',
  detailDuration: '',
  detailTuitionPerSemester: '',
  detailTuitionTotal: '',
  detailAbout: '',
  detailQualificationsText: '',
  detailAdmissionConditionsText: '',
  detailQualificationsNote: '',
  detailFullConditionsUrl: '',
  detailSourceUrl: '',
  detailSourceCheckedAt: '',
  detailApplyUrl: '',
  highlights: [],
  faculty: [],
  documents: []
}

// รองรับ highlights แบบเก่าที่เป็น array ของ string ล้วน (ไม่มี description)
const normalizeHighlights = (highlights) =>
  (Array.isArray(highlights) ? highlights : []).map((item) =>
    typeof item === 'string' ? { title: item, description: '' } : { title: item?.title || '', description: item?.description || '' }
  )

const normalizeFaculty = (faculty) =>
  (Array.isArray(faculty) ? faculty : []).map((item) => ({
    name: item?.name || '',
    nameEn: item?.nameEn || '',
    positionTh: item?.positionTh || item?.expertise || '',
    // ตำแหน่งบริหารเพิ่มเติม เช่น ประธานสาขาวิชา — แยกจากตำแหน่งทางวิชาการ
    roleTh: item?.roleTh || '',
    positionEn: item?.positionEn || '',
    email: item?.email || '',
    image: item?.image || '',
    image_path: item?.image_path || '',
    _uploading: false
  }))

const normalizeDocuments = (documents) =>
  (Array.isArray(documents) ? documents : []).map((item) => ({
    name: item?.name || '',
    type: item?.type || '',
    size: item?.size || '',
    url: item?.url || '',
    path: item?.path || '',
    _uploading: false
  }))

const CourseFormContent = ({ user }) => {
  const navigate = useNavigate()
  const showToast = useToast()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('basic')
  // สถานะของการอัปโหลดรูปประจำสาขา — แยกจาก error ของทั้งฟอร์ม เพราะต้องขึ้นตรงช่องนั้น
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState('')
  const [logoBroken, setLogoBroken] = useState(false)

  useEffect(() => {
    if (!isEdit) return

    const fetchCourse = async () => {
      let data = null
      let fetchError = null
      try {
        data = await apiJson(`/api/site-admin/courses/${id}`)
      } catch (err) {
        fetchError = err
      }
      if (fetchError || !data) {
        setError('ไม่พบหลักสูตรนี้')
        setLoading(false)
        return
      }
      const detail = data.detail || {}
      setForm({
        title: data.title || '',
        title_en: data.title_en || '',
        description: data.description || '',
        logo: data.logo_url || '',
        careersText: (data.careers || []).join('\n'),
        detailLevel: detail.level || '',
        detailDuration: detail.duration || '',
        detailTuitionPerSemester: detail.tuition_per_semester || '',
        detailTuitionTotal: detail.tuition_total || '',
        detailAbout: detail.about || '',
        detailQualificationsText: (detail.qualifications || []).join('\n'),
        detailAdmissionConditionsText: (detail.admission_conditions || []).join(LINE_BREAK),
        detailQualificationsNote: detail.qualifications_note || '',
        detailFullConditionsUrl: detail.full_conditions_url || '',
        detailSourceUrl: detail.source_url || '',
        detailSourceCheckedAt: detail.source_checked_at || '',
        detailApplyUrl: detail.apply_url || '',
        highlights: normalizeHighlights(detail.highlights),
        faculty: normalizeFaculty(detail.faculty),
        documents: normalizeDocuments(detail.documents)
      })
      setLoading(false)
    }

    fetchCourse()
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // ตัวช่วยจัดการ list ที่แก้ไขได้ (highlights/faculty/documents) แบบเดียวกันทั้ง 3 ชุด
  const addRow = (listName, template) => {
    setForm((prev) => ({ ...prev, [listName]: [...prev[listName], template] }))
  }
  const removeRow = (listName, index) => {
    const row = form[listName][index]
    const path = row?.image_path || row?.path
    if (path) removeCourseFile(path)
    setForm((prev) => ({ ...prev, [listName]: prev[listName].filter((_, i) => i !== index) }))
  }
  const updateRow = (listName, index, field, value) => {
    setForm((prev) => ({
      ...prev,
      [listName]: prev[listName].map((row, i) => (i === index ? { ...row, [field]: value } : row))
    }))
  }

  // รูปประจำสาขา: อัปโหลดแล้วเติม URL ลงช่องเดิม
  //
  // **ยังไม่เปลี่ยนรูปของหลักสูตรจนกว่าจะกดบันทึกสำเร็จ** — ที่นี่แก้แต่ค่าในฟอร์ม
  // ไฟล์ที่อัปโหลดถูกตั้งชื่อจาก hash ของเนื้อไฟล์ จึงไม่ทับของเดิมและไม่ชนกันเอง
  // ถ้าเลือกรูปแล้วเปลี่ยนใจ เลือกใหม่หรือแก้ URL เองได้ก่อนบันทึก
  const handleLogoFileChange = async (file, input) => {
    // ล้างค่าของ input ทันที เพื่อให้เลือก "ไฟล์เดิม" ซ้ำแล้วยัง onChange อีกครั้ง
    if (input) input.value = ''
    if (!file) return
    setLogoError('')
    if (!LOGO_MIME[file.type]) {
      setLogoError(`รับเฉพาะไฟล์ ${Object.values(LOGO_MIME).join(', ')} — ` +
        `ไฟล์ที่เลือกเป็น ${file.type || 'ชนิดที่อ่านไม่ออก'}`)
      return
    }
    if (file.size > LOGO_MAX_BYTES) {
      setLogoError(`ไฟล์ขนาด ${formatFileSize(file.size)} ใหญ่เกินเพดาน 5 MB — ย่อรูปก่อนแล้วลองใหม่`)
      return
    }
    setLogoUploading(true)
    try {
      const uploaded = await uploadCourseLogo(file)
      setForm((prev) => ({ ...prev, logo: uploaded.url }))
      setLogoBroken(false)
    } catch (err) {
      setLogoError('อัปโหลดรูปไม่สำเร็จ: ' + err.message)
    } finally {
      setLogoUploading(false)
    }
  }

  const handleLogoUrlChange = (e) => {
    setLogoError('')
    setLogoBroken(false)
    handleChange(e)
  }

  const handleFacultyPhotoChange = async (index, file) => {
    if (!file) return
    const prevPath = form.faculty[index]?.image_path
    updateRow('faculty', index, '_uploading', true)
    try {
      const uploaded = await uploadFacultyPhoto(file)
      setForm((prev) => ({
        ...prev,
        faculty: prev.faculty.map((row, i) =>
          i === index ? { ...row, image: uploaded.url, image_path: uploaded.path, _uploading: false } : row
        )
      }))
      if (prevPath) removeCourseFile(prevPath)
    } catch (err) {
      showToast('อัปโหลดรูปไม่สำเร็จ: ' + err.message, 'error')
      updateRow('faculty', index, '_uploading', false)
    }
  }

  const handleDocumentFileChange = async (index, file) => {
    if (!file) return
    const prevPath = form.documents[index]?.path
    updateRow('documents', index, '_uploading', true)
    try {
      const uploaded = await uploadCourseDocument(file)
      setForm((prev) => ({
        ...prev,
        documents: prev.documents.map((row, i) =>
          i === index
            ? {
                ...row,
                name: row.name.trim() || uploaded.name,
                type: (uploaded.name.split('.').pop() || '').toUpperCase(),
                size: formatFileSize(uploaded.size),
                url: uploaded.url,
                path: uploaded.path,
                _uploading: false
              }
            : row
        )
      }))
      if (prevPath) removeCourseFile(prevPath)
    } catch (err) {
      showToast('อัปโหลดเอกสารไม่สำเร็จ: ' + err.message, 'error')
      updateRow('documents', index, '_uploading', false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // ช่อง required (ชื่อ/คำอธิบาย) อยู่ในแท็บ "ข้อมูลหลักสูตร" — ถ้า unmount อยู่ (อยู่แท็บอื่น)
    // HTML5 required จะไม่ทำงาน เลยเช็คเองอีกชั้นแล้วสลับแท็บให้เห็น error
    if (!form.title.trim() || !form.title_en.trim() || !form.description.trim()) {
      setActiveTab('basic')
      setError('กรุณากรอกชื่อหลักสูตรและคำอธิบายให้ครบก่อนบันทึก')
      return
    }

    const qualifications = form.detailQualificationsText
      .split('\n')
      .map((q) => q.trim())
      .filter(Boolean)
    const admissionConditions = form.detailAdmissionConditionsText
      .split(LINE_BREAK)
      .map((q) => q.trim())
      .filter(Boolean)
    const highlights = form.highlights
      .filter((h) => h.title.trim())
      .map((h) => ({ title: h.title.trim(), description: h.description.trim() || undefined }))
    const faculty = form.faculty
      .filter((f) => f.name.trim())
      .map((f) => ({
        name: f.name.trim(),
        nameEn: f.nameEn.trim() || undefined,
        positionTh: f.positionTh.trim() || undefined,
        roleTh: f.roleTh.trim() || undefined,
        positionEn: f.positionEn.trim() || undefined,
        email: f.email.trim() || undefined,
        image: f.image || undefined,
        image_path: f.image_path || undefined
      }))
    const documents = form.documents
      .filter((d) => d.name.trim() && d.url)
      .map((d) => ({
        name: d.name.trim(),
        type: d.type.trim() || undefined,
        size: d.size.trim() || undefined,
        url: d.url,
        path: d.path || undefined
      }))

    const detailFields = {
      level: form.detailLevel.trim() || undefined,
      duration: form.detailDuration.trim() || undefined,
      tuition_per_semester: form.detailTuitionPerSemester.trim() || undefined,
      tuition_total: form.detailTuitionTotal.trim() || undefined,
      about: form.detailAbout.trim() || undefined,
      qualifications: qualifications.length ? qualifications : undefined,
      admission_conditions: admissionConditions.length ? admissionConditions : undefined,
      qualifications_note: form.detailQualificationsNote.trim() || undefined,
      full_conditions_url: form.detailFullConditionsUrl.trim() || undefined,
      source_url: form.detailSourceUrl.trim() || undefined,
      source_checked_at: form.detailSourceCheckedAt.trim() || undefined,
      apply_url: form.detailApplyUrl.trim() || undefined,
      highlights: highlights.length ? highlights : undefined,
      faculty: faculty.length ? faculty : undefined,
      documents: documents.length ? documents : undefined
    }
    const hasDetail = Object.values(detailFields).some((v) => v !== undefined)
    const detail = hasDetail ? detailFields : null

    const payload = {
      title: form.title.trim(),
      title_en: form.title_en.trim(),
      description: form.description.trim(),
      // หลังบ้านใช้ชื่อ logo_url ส่วนฟอร์มใช้ logo มาตั้งแต่ต้น
      logo_url: form.logo.trim() || null,
      careers: form.careersText.split('\n').map((c) => c.trim()).filter(Boolean),
      detail
    }

    setSaving(true)
    let saved = null
    try {
      // ผู้แก้ไขมาจาก token ที่หลังบ้าน ไม่ต้องส่ง created_by/updated_by มาเอง
      saved = await apiJson(
        isEdit ? `/api/site-admin/courses/${id}` : '/api/site-admin/courses',
        { method: isEdit ? 'PUT' : 'POST', body: JSON.stringify(payload) }
      )
    } catch (err) {
      setSaving(false)
      setError('บันทึกไม่สำเร็จ: ' + err.message)
      showToast('บันทึกไม่สำเร็จ', 'error')
      return
    }
    setSaving(false)

    showToast(isEdit ? 'บันทึกการแก้ไขเรียบร้อยแล้ว' : 'เพิ่มหลักสูตรเรียบร้อยแล้ว', 'success')

    // เดิมมีการส่งหลักสูตรเข้าดัชนี RAG ของ Supabase ตรงนี้ — เลิกแล้วใน Phase 4
    // เพราะไม่มีที่ใดอ่านตารางนั้นเพื่อตอบคำถามเลย (ดู src/lib/ragIngest.js)
    // คำตอบของ AI มาจากเอกสาร มคอ.2 ใน public.course_chunks ซึ่งเป็นคนละชุดกัน

    navigate('/admin/dashboard?tab=courses')
  }

  if (loading) {
    return <p className="text-center text-gray-500 py-12">กำลังโหลด...</p>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/admin/dashboard?tab=courses" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-pnru mb-4">
        <ArrowLeft className="w-4 h-4" />
        กลับไปหลักสูตร
      </Link>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 px-2">
          {FORM_TABS.map((tab) => {
            const TabIcon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                  active ? 'border-pnru text-pnru' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="p-6 lg:p-8 space-y-5">
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'basic' && (
        <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อหลักสูตร (ไทย)</label>
          <input
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อหลักสูตร (อังกฤษ)</label>
          <input
            name="title_en"
            required
            value={form.title_en}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">คำอธิบายสั้น ๆ</label>
          <textarea
            name="description"
            required
            rows={3}
            value={form.description}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">รูปประจำสาขา</label>
          <div className="flex items-start gap-3">
            {/* ตัวอย่างรูป — โหลดจาก URL จริงที่จะถูกบันทึก ถ้าโหลดไม่ขึ้นแปลว่าหน้าเว็บ
                ก็จะแสดงไม่ขึ้นเหมือนกัน จึงบอกผู้ใช้ตรงนี้เลย ไม่ปล่อยให้ไปเจอทีหลัง */}
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              {logoUploading ? (
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              ) : form.logo && !logoBroken ? (
                <img
                  src={form.logo}
                  alt="ตัวอย่างรูปประจำสาขา"
                  className="h-full w-full object-cover"
                  onError={() => setLogoBroken(true)}
                  onLoad={() => setLogoBroken(false)}
                />
              ) : (
                <ImageIcon className="w-7 h-7 text-gray-300" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-xs font-medium transition-colors ${
                  logoUploading ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50 cursor-pointer'
                }`}>
                  <Upload className="w-3.5 h-3.5" />
                  {logoUploading ? 'กำลังอัปโหลด…' : form.logo ? 'เปลี่ยนรูป' : 'เลือกรูปจากคอมพิวเตอร์'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={logoUploading}
                    onChange={(e) => handleLogoFileChange(e.target.files?.[0], e.target)}
                  />
                </label>
                <span className="text-xs text-gray-400">JPG, PNG หรือ WebP ไม่เกิน 5 MB</span>
              </div>

              {/* ยังวาง URL เองได้เหมือนเดิม — รูปที่โฮสต์ไว้ที่อื่นหรือไฟล์ใน /assets ยังใช้ได้ */}
              <input
                name="logo"
                value={form.logo}
                onChange={handleLogoUrlChange}
                placeholder="หรือวาง URL เอง เช่น /assets/courses/example.png"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
              />

              {logoError ? (
                <p className="flex items-start gap-1.5 text-xs text-red-600">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {logoError}
                </p>
              ) : form.logo && logoBroken ? (
                <p className="flex items-start gap-1.5 text-xs text-amber-600">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  เปิดรูปจาก URL นี้ไม่ได้ — ตรวจ URL อีกครั้ง หรือกดเลือกรูปจากคอมพิวเตอร์
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  รูปบนหน้าเว็บจะเปลี่ยนเมื่อกดบันทึกสำเร็จเท่านั้น · รูปเดิมไม่ถูกลบหรือเขียนทับ
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">อาชีพหลังจบ (บรรทัดละ 1 อาชีพ)</label>
          <textarea
            name="careersText"
            rows={4}
            value={form.careersText}
            onChange={handleChange}
            placeholder={'นักพัฒนาซอฟต์แวร์\nนักวิเคราะห์ระบบ'}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru font-mono text-sm"
          />
        </div>
        </>
        )}

        {activeTab === 'important' && (
        <>
        {/* ---------- ข้อมูลสำหรับหน้ารายละเอียดหลักสูตร ---------- */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-4">ข้อมูลพื้นฐาน (ไม่บังคับ)</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ระดับการศึกษา</label>
              <select
                name="detailLevel"
                value={form.detailLevel}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
              >
                <option value="">-- เลือกระดับการศึกษา --</option>
                {withCurrent(LEVEL_OPTIONS, form.detailLevel).map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ระยะเวลาศึกษา</label>
              <select
                name="detailDuration"
                value={form.detailDuration}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
              >
                <option value="">-- เลือกระยะเวลา --</option>
                {withCurrent(DURATION_OPTIONS, form.detailDuration).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ค่าเล่าเรียนต่อภาคการศึกษา</label>
              <input
                name="detailTuitionPerSemester"
                value={form.detailTuitionPerSemester}
                onChange={handleChange}
                placeholder="เช่น 8,500 บาท"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ค่าใช้จ่ายตลอดหลักสูตร</label>
              <input
                name="detailTuitionTotal"
                value={form.detailTuitionTotal}
                onChange={handleChange}
                placeholder="เช่น 68,000 บาท"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">เกี่ยวกับสาขา</label>
            <textarea
              name="detailAbout"
              rows={3}
              value={form.detailAbout}
              onChange={handleChange}
              placeholder={'คำอธิบายสาขาแบบละเอียด แสดงในแท็บ "รายละเอียดหลักสูตร"'}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">คุณสมบัติผู้สมัคร (บรรทัดละ 1 ข้อ)</label>
            <textarea
              name="detailQualificationsText"
              rows={4}
              value={form.detailQualificationsText}
              onChange={handleChange}
              placeholder={'สำเร็จการศึกษาระดับมัธยมศึกษาตอนปลายหรือเทียบเท่า\nมีผลการเรียนเฉลี่ยสะสมไม่ต่ำกว่า 2.00'}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru font-mono text-sm"
            />
          </div>

          {/* เงื่อนไขที่ผูกกับรอบรับสมัคร แยกจากคุณสมบัติทั่วไปข้างบน
              ส่วนนี้เปลี่ยนทุกรอบรับสมัคร เช่น ต้องมีผลการเรียนกี่ภาคจึงสมัครรอบนั้นได้
              แยกช่องไว้เพื่อให้แก้เฉพาะส่วนที่เปลี่ยนได้ โดยไม่ต้องแตะคุณสมบัติทั่วไป */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              เงื่อนไขตามรอบรับสมัคร (บรรทัดละ 1 ข้อ)
            </label>
            <textarea
              name="detailAdmissionConditionsText"
              rows={3}
              value={form.detailAdmissionConditionsText}
              onChange={handleChange}
              placeholder="เช่น ใช้เกรดเฉลี่ยสะสม/หน่วยกิตสะสม อย่างน้อย 4-5 ภาคการศึกษา ในการสมัครเรียน"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru font-mono text-sm"
            />
          </div>

          {/* ใช้เมื่อข้อความคุณสมบัติด้านบนเป็นฉบับย่อ ไม่ใช่เงื่อนไขครบทุกข้อ
              เช่น หลักสูตรบัณฑิตศึกษาที่เล่ม มคอ.2 แยกเงื่อนไขตามแผนการเรียน */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ข้อความกำกับใต้คุณสมบัติ (ไม่จำเป็น)
              </label>
              <input
                name="detailQualificationsNote"
                value={form.detailQualificationsNote}
                onChange={handleChange}
                placeholder="เช่น ข้อความข้างต้นเป็นฉบับย่อ"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ลิงก์เงื่อนไขฉบับเต็ม (ไม่จำเป็น)
              </label>
              <input
                name="detailFullConditionsUrl"
                value={form.detailFullConditionsUrl}
                onChange={handleChange}
                placeholder="เช่น ลิงก์เล่ม มคอ.2"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
              />
            </div>
          </div>

          {/* ที่มาของข้อมูลคุณสมบัติ — คุณสมบัติที่รับสมัครเปลี่ยนได้ทุกปีการศึกษา
              ถ้าไม่บันทึกว่าลอกมาจากไหนและตรวจเมื่อไร ปีถัดไปจะไม่มีใครรู้ว่ายังใช้ได้อยู่หรือเปล่า
              สองช่องนี้แสดงเป็นบรรทัดเล็กใต้หัวข้อคุณสมบัติผู้สมัครในหน้ารายละเอียด */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ลิงก์ข้อมูลต้นทาง</label>
              <input
                name="detailSourceUrl"
                value={form.detailSourceUrl}
                onChange={handleChange}
                placeholder="เช่น https://sci.pnru.ac.th/program_detail.php?id=26"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">วันที่ตรวจข้อมูล</label>
              <input
                name="detailSourceCheckedAt"
                value={form.detailSourceCheckedAt}
                onChange={handleChange}
                placeholder="เช่น 27 ต.ค. 2569"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
              />
            </div>
          </div>

          {/* ปล่อยว่างไว้ได้ หน้ารายละเอียดจะใช้ลิงก์รับสมัครกลางของมหาวิทยาลัย
              ใส่เฉพาะกรณีหลักสูตรนี้มีช่องทางรับสมัครของตัวเอง */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ลิงก์สมัครเรียนเฉพาะหลักสูตรนี้ (ไม่จำเป็น)
            </label>
            <input
              name="detailApplyUrl"
              value={form.detailApplyUrl}
              onChange={handleChange}
              placeholder="ปล่อยว่าง = ใช้ลิงก์รับสมัครกลางของมหาวิทยาลัย"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
            />
          </div>
        </div>

        {/* ---------- จุดเด่นหลักสูตร ---------- */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3 mt-4">
            <label className="block text-sm font-medium text-gray-700">จุดเด่นหลักสูตร</label>
            <button
              type="button"
              onClick={() => addRow('highlights', { title: '', description: '' })}
              className="inline-flex items-center gap-1 text-xs font-medium text-pnru hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่มจุดเด่น
            </button>
          </div>
          {form.highlights.length === 0 && (
            <p className="text-xs text-gray-400">ยังไม่มีจุดเด่น กด "เพิ่มจุดเด่น" เพื่อเริ่มกรอก</p>
          )}
          <div className="space-y-3">
            {form.highlights.map((row, index) => (
              <div key={index} className="flex gap-2 items-start bg-gray-50 rounded-lg p-3">
                <div className="flex-1 space-y-2">
                  <input
                    value={row.title}
                    onChange={(e) => updateRow('highlights', index, 'title', e.target.value)}
                    placeholder="หัวข้อจุดเด่น"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pnru"
                  />
                  <input
                    value={row.description}
                    onChange={(e) => updateRow('highlights', index, 'description', e.target.value)}
                    placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pnru"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow('highlights', index)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="ลบจุดเด่นนี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- เอกสารหลักสูตร ---------- */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3 mt-4">
            <label className="block text-sm font-medium text-gray-700">เอกสารหลักสูตร</label>
            <button
              type="button"
              onClick={() => addRow('documents', { name: '', type: '', size: '', url: '', path: '', _uploading: false })}
              className="inline-flex items-center gap-1 text-xs font-medium text-pnru hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่มเอกสาร
            </button>
          </div>
          {form.documents.length === 0 && (
            <p className="text-xs text-gray-400">ยังไม่มีเอกสาร กด "เพิ่มเอกสาร" เพื่อเริ่มกรอก</p>
          )}
          <div className="space-y-3">
            {form.documents.map((row, index) => (
              <div key={index} className="flex gap-2 items-center bg-gray-50 rounded-lg p-3">
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-white cursor-pointer transition-colors flex-shrink-0">
                    {row._uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {row.url ? 'แนบไฟล์ใหม่' : 'แนบไฟล์'}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleDocumentFileChange(index, e.target.files?.[0])}
                    />
                  </label>

                  {row.url ? (
                    <div className="flex-1 flex items-center gap-2 min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                      <FileText className="w-4 h-4 text-pnru flex-shrink-0" />
                      <input
                        value={row.name}
                        onChange={(e) => updateRow('documents', index, 'name', e.target.value)}
                        placeholder="ชื่อที่แสดง"
                        className="flex-1 min-w-0 text-sm focus:outline-none"
                      />
                      <span className="text-xs text-gray-400 flex-shrink-0">{[row.type, row.size].filter(Boolean).join(' • ')}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">ยังไม่ได้แนบไฟล์</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeRow('documents', index)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  aria-label="ลบเอกสารนี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        </>
        )}

        {activeTab === 'faculty' && (
        <>
        {/* ---------- คณาจารย์ ---------- */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3 mt-4">
            <label className="block text-sm font-medium text-gray-700">คณาจารย์</label>
            <button
              type="button"
              onClick={() => addRow('faculty', { name: '', nameEn: '', positionTh: '', roleTh: '', positionEn: '', email: '', image: '', image_path: '', _uploading: false })}
              className="inline-flex items-center gap-1 text-xs font-medium text-pnru hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่มอาจารย์
            </button>
          </div>
          {form.faculty.length === 0 && (
            <p className="text-xs text-gray-400">ยังไม่มีข้อมูลคณาจารย์ กด "เพิ่มอาจารย์" เพื่อเริ่มกรอก</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {form.faculty.map((row, index) => (
              <div key={index} className="relative bg-gray-50 rounded-lg p-4 text-center">
                <button
                  type="button"
                  onClick={() => removeRow('faculty', index)}
                  className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="ลบอาจารย์นี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <label className="mx-auto mb-3 flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-200 hover:opacity-80 transition-opacity">
                  {row._uploading ? (
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  ) : row.image ? (
                    <img src={row.image} alt={row.name || 'อาจารย์'} className="h-full w-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFacultyPhotoChange(index, e.target.files?.[0])}
                  />
                </label>

                <input
                  value={row.name}
                  onChange={(e) => updateRow('faculty', index, 'name', e.target.value)}
                  placeholder="ชื่อ-นามสกุล (ไทย)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-pnru mb-2"
                />
                <input
                  value={row.nameEn}
                  onChange={(e) => updateRow('faculty', index, 'nameEn', e.target.value)}
                  placeholder="ชื่อ-นามสกุล (อังกฤษ, ไม่บังคับ)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-pnru mb-2"
                />
                {/* ตำแหน่งทางวิชาการ — ยังรองรับหลายบรรทัดเหมือนเดิม ข้อมูลเก่าที่เคาะบรรทัดไว้
                    จึงแสดงเหมือนเดิมทุกประการ หน้าเว็บแสดงตามที่กรอก ไม่ได้แยกข้อความเอง */}
                <textarea
                  value={row.positionTh}
                  onChange={(e) => updateRow('faculty', index, 'positionTh', e.target.value)}
                  rows={2}
                  placeholder={'ตำแหน่งทางวิชาการ (ไทย, ไม่บังคับ)\nเช่น ผศ. หรือ รศ. ดร. — ขึ้นบรรทัดใหม่ได้'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-pnru mb-2"
                />
                {/* ตำแหน่งบริหารแยกเป็นช่องของตัวเอง เพราะเป็นคนละเรื่องกับตำแหน่งทางวิชาการ
                    แยกเก็บไว้แล้วค้นหาหรือเรียงตามบทบาทภายหลังได้ ไม่ต้องเดาจากข้อความรวม */}
                <input
                  value={row.roleTh}
                  onChange={(e) => updateRow('faculty', index, 'roleTh', e.target.value)}
                  placeholder="ตำแหน่งเสริม (ไม่บังคับ) เช่น ประธานสาขาวิชา"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-pnru mb-2"
                />
                <input
                  value={row.positionEn}
                  onChange={(e) => updateRow('faculty', index, 'positionEn', e.target.value)}
                  placeholder="ตำแหน่ง (อังกฤษ, ไม่บังคับ)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-pnru mb-2"
                />
                <input
                  type="email"
                  value={row.email}
                  onChange={(e) => updateRow('faculty', index, 'email', e.target.value)}
                  placeholder="อีเมล (ไม่บังคับ)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-pnru"
                />
              </div>
            ))}
          </div>
        </div>
        </>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-pnru hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        </div>
      </form>
    </div>
  )
}

const CourseForm = () => {
  const { id } = useParams()
  const { user, role, loading: authLoading, logout } = useAdminAuth()

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">กำลังตรวจสอบสิทธิ์...</div>
  }

  return (
    <AdminLayout active="courses" title={id ? 'แก้ไขหลักสูตร' : 'เพิ่มหลักสูตรใหม่'} user={user} role={role} onLogout={logout}>
      <CourseFormContent user={user} />
    </AdminLayout>
  )
}

export default CourseForm
