import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { apiJson } from '../../lib/apiAuth'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import AdminLayout from '../../components/admin/AdminLayout'
import { useToast } from '../../components/admin/Toast'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { getKnowledgeFileUrl, removeKnowledgeFile } from '../../lib/knowledgeStorage'
import { Plus, Pencil, Trash2, Search, AlertCircle, BrainCircuit, CheckCircle2, CircleDashed, Paperclip } from 'lucide-react'

const KnowledgeBaseContent = ({ canEdit, isAdmin }) => {
  const showToast = useToast()

  const [articles, setArticles] = useState([])
  const [syncedIds, setSyncedIds] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [confirmState, setConfirmState] = useState({ open: false, id: null, filePath: null })
  const [deleting, setDeleting] = useState(false)
  const [downloadingId, setDownloadingId] = useState(null)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await apiJson('/api/site-admin/knowledge')
      setArticles(data.articles || [])
    } catch (err) {
      setLoadError('โหลดข้อมูลความรู้ไม่สำเร็จ: ' + err.message)
      setArticles([])
    }

    // เดิมแสดงสถานะว่าบทความถูกส่งเข้าดัชนี RAG ของ Supabase แล้วหรือยัง
    // Phase 4 เลิกใช้ดัชนีนั้นแล้วเพราะไม่มีที่ใดอ่านเพื่อตอบคำถาม จึงไม่มีสถานะให้แสดง
    setSyncedIds(new Set())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const filteredArticles = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return articles
    return articles.filter((a) =>
      a.title?.toLowerCase().includes(q) || a.content?.toLowerCase().includes(q)
    )
  }, [articles, search])

  const requestDelete = (article) => setConfirmState({ open: true, id: article.id, filePath: article.file_path })
  const closeConfirm = () => setConfirmState({ open: false, id: null, filePath: null })

  const handleConfirmDelete = async () => {
    if (!isAdmin) return
    setDeleting(true)
    try {
      await apiJson(`/api/site-admin/knowledge/${confirmState.id}`, { method: 'DELETE' })
    } catch (err) {
      setDeleting(false)
      closeConfirm()
      showToast('ลบไม่สำเร็จ: ' + err.message, 'error')
      return
    }
    setDeleting(false)
    closeConfirm()

    showToast('ลบข้อมูลความรู้เรียบร้อยแล้ว', 'success')
    fetchArticles()

    // ลบไฟล์ต้นฉบับออกจาก Storage ด้วย (fire-and-forget)
    if (confirmState.filePath) removeKnowledgeFile(confirmState.filePath)
  }

  const handleDownload = async (article) => {
    setDownloadingId(article.id)
    try {
      const url = await getKnowledgeFileUrl(article.file_path)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      showToast(err.message || 'เปิดไฟล์ไม่สำเร็จ', 'error')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <>
      <ConfirmDialog
        open={confirmState.open}
        title="ยืนยันการลบข้อมูลความรู้"
        message="การลบไม่สามารถย้อนกลับได้ และจะลบข้อมูลออกจาก RAG ด้วย"
        onConfirm={handleConfirmDelete}
        onCancel={closeConfirm}
        loading={deleting}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาหัวข้อหรือเนื้อหา..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pnru"
          />
        </div>
        {canEdit && (
          <Link
            to="/admin/knowledge/create"
            className="inline-flex items-center justify-center gap-2 bg-pnru text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            เพิ่มข้อมูลความรู้
          </Link>
        )}
      </div>

      {loadError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{loadError}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-gray-500">กำลังโหลด...</p>
        ) : filteredArticles.length === 0 ? (
          <p className="p-6 text-center text-gray-500">
            {search ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลความรู้ — เพิ่มเนื้อหาให้ SCI Advisor ใช้ตอบคำถามได้ที่นี่'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">หัวข้อ</th>
                  <th className="px-4 py-3 font-medium">สถานะ RAG</th>
                  <th className="px-4 py-3 font-medium">แก้ไขล่าสุด</th>
                  <th className="px-4 py-3 font-medium text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredArticles.map((a) => {
                  const synced = syncedIds.has(a.id)
                  return (
                    <tr key={a.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{a.title}</p>
                        <p className="text-xs text-gray-400 truncate max-w-md">{a.content}</p>
                        {a.file_path && (
                          <button
                            onClick={() => handleDownload(a)}
                            disabled={downloadingId === a.id}
                            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-pnru mt-1 disabled:opacity-50"
                          >
                            <Paperclip className="w-3 h-3" />
                            {downloadingId === a.id ? 'กำลังเปิดไฟล์...' : (a.file_name || 'ไฟล์แนบ')}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {synced ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#E8F5F1] text-pnru px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ซิงค์แล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                            <CircleDashed className="w-3.5 h-3.5" />
                            ยังไม่ซิงค์
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <p className="text-gray-700">{a.updater?.full_name || a.updater?.email || a.creator?.full_name || a.creator?.email || 'ไม่ทราบผู้ใช้'}</p>
                        <p className="text-gray-400">{new Date(a.updated_at).toLocaleString('th-TH')}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <Link
                              to={`/admin/knowledge/edit/${a.id}`}
                              className="p-2 text-gray-500 hover:text-pnru hover:bg-[#E8F5F1] rounded-lg transition-colors"
                              aria-label="แก้ไข"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => requestDelete(a)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label="ลบ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

const KnowledgeBase = () => {
  const { user, role, canEdit, isAdmin, loading: authLoading, logout } = useAdminAuth()

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">กำลังตรวจสอบสิทธิ์...</div>
  }

  return (
    <AdminLayout active="knowledge" title="คลังความรู้ (RAG)" user={user} role={role} onLogout={logout}>
      <div className="flex items-start gap-2 bg-[#E8F5F1] text-pnru text-sm rounded-lg p-3 mb-6">
        <BrainCircuit className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <span>
          เนื้อหาที่เพิ่มที่นี่จะถูกแปลงเป็น embedding และให้ <strong>SCI Advisor</strong> (แชท AI) ใช้เป็นข้อมูลอ้างอิงตอบคำถามผู้ใช้ทั่วไป
          เหมาะกับข้อมูลทั่วไปที่ไม่ผูกกับหลักสูตรหรือข่าวโดยตรง เช่น ค่าเทอม ระเบียบการ คำถามที่พบบ่อย
        </span>
      </div>
      <KnowledgeBaseContent canEdit={canEdit} isAdmin={isAdmin} />
    </AdminLayout>
  )
}

export default KnowledgeBase
