import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import AdminLayout from '../../components/admin/AdminLayout'
import { useToast } from '../../components/admin/Toast'
import { apiJson } from '../../lib/apiAuth'
import { Sparkles, AlertCircle, Save } from 'lucide-react'

const AiSettingsContent = () => {
  const showToast = useToast()
  const [model, setModel] = useState('')
  const [savedModel, setSavedModel] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await apiJson('/api/site-admin/ai-settings')
      setModel(data?.model || '')
      setSavedModel(data?.model || '')
    } catch (err) {
      setLoadError('โหลดค่าตั้งต้นไม่สำเร็จ: ' + err.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    if (!model.trim()) {
      showToast('กรุณาระบุชื่อโมเดล', 'error')
      return
    }

    setSaving(true)
    try {
      // หลังบ้านบันทึกผู้แก้ไขและเวลาจาก token เอง หน้าเว็บไม่ต้องส่งมา
      await apiJson('/api/site-admin/ai-settings', {
        method: 'PUT',
        body: JSON.stringify({ model: model.trim() })
      })
    } catch (err) {
      setSaving(false)
      showToast('บันทึกไม่สำเร็จ: ' + err.message, 'error')
      return
    }
    setSaving(false)

    setSavedModel(model.trim())
    showToast('บันทึกโมเดล AI เรียบร้อยแล้ว', 'success')
  }

  const hasChanges = model.trim() !== savedModel

  return (
    <div className="max-w-2xl">
      {loadError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{loadError}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#E8F5F1] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-pnru" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">โมเดล AI ที่ใช้งาน</h3>
            <p className="text-sm text-gray-400">ใช้กับ SCI Advisor (/chat) และระบบแนะนำสาขา (/find-major)</p>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อโมเดล</label>
          {loading ? (
            <div className="h-11 rounded-lg bg-gray-100 animate-pulse" />
          ) : (
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="เช่น openai/gpt-4o-mini, gemini-3.1-flash-lite"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pnru"
            />
          )}
          <p className="text-xs text-gray-400 mt-2">
            ต้องเป็นชื่อโมเดลที่ผู้ให้บริการ AI ปลายทาง (Base URL ที่ตั้งไว้ใน environment variables) รองรับ
            ส่วน Base URL และ API Key ยังต้องตั้งค่าผ่าน environment variables เท่านั้น
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading || saving || !hasChanges}
            className="inline-flex items-center gap-2 bg-pnru text-white px-5 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}

const AiSettings = () => {
  const { user, role, loading: authLoading, logout } = useAdminAuth({ requireAdmin: true })

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">กำลังตรวจสอบสิทธิ์...</div>
  }

  return (
    <AdminLayout active="ai-settings" title="ตั้งค่า AI" user={user} role={role} onLogout={logout}>
      <AiSettingsContent />
    </AdminLayout>
  )
}

export default AiSettings
