import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import AdminLayout from '../../components/admin/AdminLayout'
import { useToast } from '../../components/admin/Toast'
import { triggerIngest } from '../../lib/ragIngest'
import { extractFileText } from '../../lib/extractFile'
import { uploadKnowledgeFile, removeKnowledgeFile } from '../../lib/knowledgeStorage'
import { ArrowLeft, AlertCircle, UploadCloud, Loader2, FileText, X } from 'lucide-react'

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const emptyForm = { title: '', content: '' }
const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md']

const KnowledgeFormContent = ({ user }) => {
  const navigate = useNavigate()
  const showToast = useToast()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [attachedFile, setAttachedFile] = useState(null) // { path, name, size } | null
  const fileInputRef = useRef(null)
  const originalFilePathRef = useRef(null) // ไฟล์เดิมที่บันทึกไว้แล้ว (ใช้เทียบตอนบันทึกว่าต้องลบไฟล์เก่าออกจาก storage ไหม)

  useEffect(() => {
    if (!isEdit) return

    const fetchArticle = async () => {
      const { data, error: fetchError } = await supabase.from('knowledge_articles').select('*').eq('id', id).single()
      if (fetchError || !data) {
        setError('ไม่พบข้อมูลความรู้นี้')
        setLoading(false)
        return
      }
      setForm({ title: data.title || '', content: data.content || '' })
      if (data.file_path) {
        const existing = { path: data.file_path, name: data.file_name, size: data.file_size }
        setAttachedFile(existing)
        setUploadedFileName(data.file_name || '')
        originalFilePathRef.current = data.file_path
      }
      setLoading(false)
    }

    fetchArticle()
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // เลือกไฟล์เดิมซ้ำได้
    if (!file) return

    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase()
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      showToast('รองรับเฉพาะไฟล์ .pdf, .docx, .txt, .md', 'error')
      return
    }

    // ไฟล์ที่แนบอยู่ตอนนี้ยังไม่เคยถูกบันทึก (อัปโหลดไว้ระหว่างเซสชันนี้เอง) ลบทิ้งได้เลยก่อนแทนที่ด้วยไฟล์ใหม่
    if (attachedFile && attachedFile.path !== originalFilePathRef.current) {
      removeKnowledgeFile(attachedFile.path)
    }

    setExtracting(true)
    setUploadedFileName(file.name)
    setAttachedFile(null)
    try {
      const [textResult, uploadResult] = await Promise.allSettled([
        extractFileText(file),
        uploadKnowledgeFile(file)
      ])

      if (uploadResult.status === 'fulfilled') {
        setAttachedFile(uploadResult.value)
      } else {
        showToast(uploadResult.reason?.message || 'อัปโหลดไฟล์ต้นฉบับไม่สำเร็จ', 'error')
      }

      if (textResult.status === 'fulfilled') {
        const text = textResult.value
        if (text.trim()) {
          setForm((prev) => ({
            title: prev.title || file.name.replace(/\.[^.]+$/, ''),
            content: prev.content ? `${prev.content}\n\n${text.trim()}` : text.trim()
          }))
        }
      } else {
        showToast(textResult.reason?.message || 'อ่านเนื้อหาจากไฟล์ไม่สำเร็จ (ยังแนบไฟล์ต้นฉบับไว้ได้ แต่ต้องพิมพ์เนื้อหาเอง)', 'error')
      }

      if (uploadResult.status === 'fulfilled' && textResult.status === 'fulfilled' && textResult.value.trim()) {
        showToast(`นำเข้าไฟล์ "${file.name}" เรียบร้อยแล้ว — ตรวจสอบเนื้อหาก่อนบันทึก`, 'success')
      }
    } finally {
      setExtracting(false)
    }
  }

  const handleRemoveAttachment = () => {
    if (attachedFile && attachedFile.path !== originalFilePathRef.current) {
      removeKnowledgeFile(attachedFile.path)
    }
    setAttachedFile(null)
    setUploadedFileName('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      file_path: attachedFile?.path || null,
      file_name: attachedFile?.name || null,
      file_size: attachedFile?.size || null
    }

    setSaving(true)
    const { data: saved, error: saveError } = isEdit
      ? await supabase.from('knowledge_articles').update({ ...payload, updated_by: user?.id }).eq('id', id).select('id').single()
      : await supabase.from('knowledge_articles').insert({ ...payload, created_by: user?.id, updated_by: user?.id }).select('id').single()
    setSaving(false)

    if (saveError) {
      setError('บันทึกไม่สำเร็จ: ' + saveError.message)
      showToast('บันทึกไม่สำเร็จ', 'error')
      return
    }

    showToast(isEdit ? 'บันทึกการแก้ไขเรียบร้อยแล้ว' : 'เพิ่มข้อมูลความรู้เรียบร้อยแล้ว', 'success')

    // ไฟล์เก่าถูกแทนที่/ลบไปแล้ว ไม่มีอะไรอ้างอิงอีกต่อไป ลบทิ้งจาก storage (fire-and-forget)
    if (originalFilePathRef.current && originalFilePathRef.current !== payload.file_path) {
      removeKnowledgeFile(originalFilePathRef.current)
    }

    // ส่งเข้า RAG แบบ fire-and-forget (chunk + embed ฝั่ง server) — ให้ SCI Advisor ค้นเจอเนื้อหานี้ได้
    const articleId = saved?.id || id
    if (articleId) {
      triggerIngest({ sourceType: 'knowledge', sourceId: articleId, title: payload.title, content: payload.content })
    }

    navigate('/admin/knowledge')
  }

  if (loading) {
    return <p className="text-center text-gray-500 py-12">กำลังโหลด...</p>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/admin/knowledge" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-pnru mb-4">
        <ArrowLeft className="w-4 h-4" />
        กลับไปคลังความรู้
      </Link>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 space-y-5">
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อ</label>
          <input
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            placeholder="เช่น ค่าเทอมและการผ่อนชำระ, ขั้นตอนการลงทะเบียนเรียน"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">แนบไฟล์ (ไม่บังคับ)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={extracting}
              className="flex-1 flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-left hover:border-pnru hover:bg-[#E8F5F1]/40 transition-colors disabled:opacity-60"
            >
              {extracting ? (
                <Loader2 className="w-5 h-5 text-pnru animate-spin flex-shrink-0" />
              ) : attachedFile ? (
                <FileText className="w-5 h-5 text-pnru flex-shrink-0" />
              ) : (
                <UploadCloud className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
              <span className="text-sm text-gray-600 truncate">
                {extracting
                  ? `กำลังนำเข้าไฟล์ "${uploadedFileName}"...`
                  : attachedFile
                    ? `${attachedFile.name}${attachedFile.size ? ` (${formatFileSize(attachedFile.size)})` : ''} — เลือกไฟล์ใหม่เพื่อแทนที่`
                    : 'เลือกไฟล์ .pdf, .docx, .txt หรือ .md — เก็บไฟล์ต้นฉบับไว้ใน Storage และดึงเนื้อหามาใส่อัตโนมัติ'}
              </span>
            </button>
            {attachedFile && !extracting && (
              <button
                type="button"
                onClick={handleRemoveAttachment}
                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                aria-label="เอาไฟล์ที่แนบออก"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">เนื้อหา</label>
          <textarea
            name="content"
            required
            rows={10}
            value={form.content}
            onChange={handleChange}
            placeholder="พิมพ์เนื้อหาที่ต้องการให้ SCI Advisor ใช้ตอบคำถาม เช่น รายละเอียดค่าเทอม, ระเบียบต่างๆ, คำถามที่พบบ่อย"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru font-mono text-sm"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            เนื้อหาจะถูกแบ่งเป็นส่วนย่อยและแปลงเป็น embedding อัตโนมัติหลังบันทึก เพื่อให้ SCI Advisor ค้นหาและอ้างอิงได้
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-pnru hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึกและซิงค์เข้า RAG'}
        </button>
      </form>
    </div>
  )
}

const KnowledgeForm = () => {
  const { id } = useParams()
  const { user, role, loading: authLoading, logout } = useAdminAuth()

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">กำลังตรวจสอบสิทธิ์...</div>
  }

  return (
    <AdminLayout active="knowledge" title={id ? 'แก้ไขข้อมูลความรู้' : 'เพิ่มข้อมูลความรู้ใหม่'} user={user} role={role} onLogout={logout}>
      <KnowledgeFormContent user={user} />
    </AdminLayout>
  )
}

export default KnowledgeForm
