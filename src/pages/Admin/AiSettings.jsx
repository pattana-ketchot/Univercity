import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import AdminLayout from '../../components/admin/AdminLayout'
import { useToast } from '../../components/admin/Toast'
import { apiJson } from '../../lib/apiAuth'
import { Sparkles, AlertCircle, Save, CheckCircle2, XCircle, Activity } from 'lucide-react'

// ว่าง = ยังไม่เลือก ให้ใช้ค่าจาก environment ของเซิร์ฟเวอร์
const USE_ENV = ''

const PROVIDERS = [
  { value: USE_ENV, label: 'ใช้ค่าจากเซิร์ฟเวอร์ (ไม่กำหนดเอง)' },
  { value: 'gemini', label: 'Gemini (ของ Google · เรียกผ่านอินเทอร์เน็ต)' },
  { value: 'ollama', label: 'Ollama (โมเดลในเครื่อง · ไม่ส่งข้อมูลออก)' }
]

const providerLabel = (p) => {
  if (p === 'gemini') return 'Gemini'
  if (p === 'ollama') return 'Ollama (ในเครื่อง)'
  return p || '—'
}

const AiSettingsContent = () => {
  const showToast = useToast()
  const [provider, setProvider] = useState(USE_ENV)
  const [model, setModel] = useState('')
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  // ผลการตรวจกับผู้ให้บริการจริง — null = ยังไม่ได้ตรวจ ซึ่งไม่เท่ากับ "ใช้งานได้"
  const [check, setCheck] = useState(null)
  const [checking, setChecking] = useState(false)

  const applyInfo = useCallback((data) => {
    setInfo(data)
    setProvider(data?.saved?.provider || USE_ENV)
    setModel(data?.saved?.model || '')
  }, [])

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      applyInfo(await apiJson('/api/site-admin/ai-settings'))
    } catch (err) {
      setLoadError('โหลดค่าตั้งต้นไม่สำเร็จ: ' + err.message)
    }
    setLoading(false)
  }, [applyInfo])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    try {
      // หลังบ้านบันทึกผู้แก้ไขและเวลาจาก token เอง หน้าเว็บไม่ต้องส่งมา
      // และหลังบ้านคืน "ค่าที่ใช้จริง" กลับมาด้วย ซึ่งอาจไม่เท่ากับที่เพิ่งบันทึก
      const data = await apiJson('/api/site-admin/ai-settings', {
        method: 'PUT',
        body: JSON.stringify({
          provider: provider || null,
          model: model.trim() || null
        })
      })
      applyInfo(data)
      // ค่าเปลี่ยนแล้ว ผลตรวจครั้งก่อนเป็นของคู่ผู้ให้บริการ/รุ่นเดิม จึงใช้ยืนยันต่อไม่ได้
      setCheck(null)
      showToast('บันทึกแล้ว — กด ตรวจการเชื่อมต่อ เพื่อยืนยันว่าใช้งานได้จริง', 'success')
    } catch (err) {
      showToast('บันทึกไม่สำเร็จ: ' + err.message, 'error')
    }
    setSaving(false)
  }

  const handleCheck = async () => {
    setChecking(true)
    try {
      const data = await apiJson('/api/site-admin/ai-settings/check', { method: 'POST' })
      applyInfo(data)
      setCheck(data?.check || null)
    } catch (err) {
      setCheck({ ok: false, error: err.message })
    }
    setChecking(false)
  }

  const eff = info?.effective
  const defaults = info?.defaults
  const savedProvider = info?.saved?.provider || USE_ENV
  const savedModel = info?.saved?.model || ''
  const hasChanges = provider !== savedProvider || model.trim() !== savedModel
  const modelPlaceholder = provider === 'gemini'
    ? (defaults?.gemini_model || 'เช่น gemini-3.5-flash-lite')
    : provider === 'ollama'
      ? (defaults?.ollama_model || 'เช่น qwen2.5:3b')
      : 'ใช้รุ่นที่ตั้งไว้ในเซิร์ฟเวอร์'

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
            <h3 className="text-base font-bold text-gray-900">โมเดลที่ใช้เขียนคำตอบ</h3>
            <p className="text-sm text-gray-400">ใช้กับ SCI Advisor (/chat) และระบบแนะนำสาขา (/find-major)</p>
          </div>
        </div>

        {/* ที่ใช้จริง — ต้องแยกจากที่บันทึก เพราะสองค่านี้ต่างกันได้ */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-medium text-gray-500 mb-2">ที่ระบบใช้ตอบอยู่จริงตอนนี้</div>
          {loading ? (
            <div className="h-6 rounded bg-gray-200 animate-pulse w-2/3" />
          ) : (
            <>
              <div className="text-sm font-semibold text-gray-900">
                {providerLabel(eff?.provider)} · {eff?.model || '—'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {eff?.source === 'db'
                  ? 'มาจากค่าที่ตั้งไว้ในหน้านี้'
                  : 'มาจากค่าตั้งต้นของเซิร์ฟเวอร์ (environment)'}
              </div>
              {eff?.note && (
                <div className="flex items-start gap-2 mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{eff.note}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ผู้ให้บริการ</label>
          {loading ? (
            <div className="h-11 rounded-lg bg-gray-100 animate-pulse" />
          ) : (
            <select
              value={provider}
              onChange={(e) => {
                // ล้างชื่อรุ่นเมื่อเปลี่ยนผู้ให้บริการ เพราะชื่อรุ่นของสองเจ้าใช้ข้ามกันไม่ได้
                // ถ้าไม่ล้าง การสลับจาก Gemini ไป Ollama จะบันทึก "gemini-3.5-flash-lite"
                // เป็นชื่อรุ่นของ Ollama แล้วไปล้มตอนเรียกจริง
                setProvider(e.target.value)
                setModel('')
                setCheck(null)
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pnru"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value || 'env'} value={p.value}>{p.label}</option>
              ))}
            </select>
          )}
          {provider === 'gemini' && defaults && !defaults.has_gemini_key && (
            <div className="flex items-start gap-2 mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>เซิร์ฟเวอร์ยังไม่มี GEMINI_API_KEY — เลือกไว้ได้ แต่ระบบจะยังตอบด้วยโมเดลในเครื่อง ต้องตั้งคีย์ที่ environment ก่อน</span>
            </div>
          )}
        </div>

        <div className="mt-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            ชื่อรุ่น <span className="text-gray-400 font-normal">(เว้นว่างได้)</span>
          </label>
          {loading ? (
            <div className="h-11 rounded-lg bg-gray-100 animate-pulse" />
          ) : (
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={modelPlaceholder}
              disabled={!provider}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pnru disabled:bg-gray-50 disabled:text-gray-400"
            />
          )}
          <p className="text-xs text-gray-400 mt-2">
            {provider
              ? 'เว้นว่างไว้เพื่อใช้รุ่นตั้งต้นของผู้ให้บริการที่ตั้งไว้ในเซิร์ฟเวอร์'
              : 'เลือกผู้ให้บริการก่อนจึงจะกำหนดชื่อรุ่นได้'}
            {' '}API Key และ Base URL ตั้งได้ที่ environment ของเซิร์ฟเวอร์เท่านั้น ไม่เก็บไว้ในหน้านี้
          </p>
        </div>

        {/* ตัวแปลงข้อความเป็นเวกเตอร์เปลี่ยนไม่ได้ — บอกไว้ให้ไม่ต้องเดา */}
        {defaults && (
          <p className="text-xs text-gray-400 mt-4">
            การค้นเอกสารยังใช้ <span className="font-medium text-gray-500">{info?.embedding?.model}</span> เหมือนเดิมทุกกรณี
            สวิตช์นี้เปลี่ยนเฉพาะโมเดลที่เขียนคำตอบ จึงไม่ต้องสร้างเวกเตอร์ของเอกสารใหม่
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={handleCheck}
            disabled={loading || checking || saving}
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Activity className="w-4 h-4" />
            {checking ? 'กำลังตรวจ...' : 'ตรวจการเชื่อมต่อ'}
          </button>
          <button
            onClick={handleSave}
            disabled={loading || saving || !hasChanges}
            className="inline-flex items-center gap-2 bg-pnru text-white px-5 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>

        {/* "บันทึกสำเร็จ" ไม่ยืนยันว่าใช้งานได้ ผลตรวจที่ยิงคำขอจริงเท่านั้นที่ยืนยัน */}
        {check && (
          <div className={'flex items-start gap-2 mt-4 text-sm rounded-lg p-3 border ' + (check.ok
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-700')}>
            {check.ok
              ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              : <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            <div className="min-w-0">
              <div className="font-medium">
                {providerLabel(check.provider)}{check.model ? ' · ' + check.model : ''}
                {check.ok ? ' ใช้งานได้' : ' ยังใช้งานไม่ได้'}
              </div>
              {/* แยกสองขั้นให้เห็น เพราะ "เรียกได้" ไม่เท่ากับ "ตอบคำถามจริงทันเพดานเวลา" */}
              {check.hello && (
                <div className="text-xs mt-1.5 opacity-90">
                  {check.hello.ok ? '✓' : '✗'} เรียกผู้ให้บริการได้ ({check.hello.ms} มิลลิวินาที)
                  {!check.hello.ok && check.hello.error ? ' — ' + check.hello.error : ''}
                </div>
              )}
              {check.work && (
                <>
                  <div className="text-xs mt-0.5 opacity-90">
                    {check.work.ok ? '✓' : '✗'} ผ่านด่านตรวจหลักฐานทันเพดาน {check.budget_s} วินาที
                    {' '}({check.work.ms} มิลลิวินาที)
                  </div>
                  {/* วัดแล้วพบว่าขั้นนี้ถูกกว่าของจริงได้หลายเท่า จึงห้ามอ่านว่า "ใช้งานได้แน่" */}
                  {check.work.ok && (
                    <div className="text-xs mt-0.5 opacity-70">
                      เป็นการวัดด้วยเนื้อหาตัวอย่าง คำถามจริงอาจใช้เวลามากกว่านี้
                    </div>
                  )}
                </>
              )}
              {!check.ok && check.error && (
                <div className="text-xs mt-1.5 break-words">{check.error}</div>
              )}
              {check.ok && check.reply && (
                <div className="text-xs mt-1.5 opacity-80 break-words">คำตอบที่ได้: {check.reply}</div>
              )}
            </div>
          </div>
        )}
        {!check && !loading && (
          <p className="text-xs text-gray-400 mt-4">
            ยังไม่ได้ตรวจในรอบนี้ — การบันทึกสำเร็จยืนยันแค่ว่าค่าถูกเก็บแล้ว ไม่ได้ยืนยันว่าผู้ให้บริการตอบคำถามจริงได้ทันเวลา
          </p>
        )}

        {info?.saved?.updated_at && (
          <p className="text-xs text-gray-400 mt-3">
            แก้ไขล่าสุด {new Date(info.saved.updated_at).toLocaleString('th-TH')}
          </p>
        )}
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
