import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { supabase, isConfigured } from '../../lib/supabase'
import {
  fetchAdminSession,
  canAccessAdminArea,
  friendlyAuthError,
  isValidEmail,
  validateLoginForm,
} from '../../lib/adminAuth'
import AdminAuthLayout from '../../components/admin/auth/AdminAuthLayout'
import AdminAuthCard from '../../components/admin/auth/AdminAuthCard'
import AdminAuthInput from '../../components/admin/auth/AdminAuthInput'
import PasswordInput from '../../components/admin/auth/PasswordInput'

const REMEMBER_KEY = 'admin_remember_email'

const AdminLogin = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [remember, setRemember] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  // ผู้ดูแลระบบที่ล็อกอินอยู่แล้ว -> ไปแดชบอร์ดทันที
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const stored = localStorage.getItem(REMEMBER_KEY)
        if (stored && active) {
          setForm((f) => ({ ...f, email: stored }))
          setRemember(true)
        }
      } catch { /* ignore storage errors */ }

      const { user, role, status } = await fetchAdminSession()
      if (!active) return
      if (user && canAccessAdminArea(role, status)) {
        navigate('/admin/dashboard', { replace: true })
        return
      }
      setCheckingSession(false)
    })()
    return () => { active = false }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    setFormError('')
  }

  const handleForgotPassword = async () => {
    setNotice('')
    setFormError('')
    const email = form.email.trim()
    if (!isValidEmail(email)) {
      setFieldErrors((prev) => ({ ...prev, email: 'กรอกอีเมลให้ถูกต้องก่อน แล้วกด "ลืมรหัสผ่าน?" อีกครั้ง' }))
      return
    }
    if (!isConfigured) {
      setFormError('ยังไม่ได้ตั้งค่า Supabase (ดู ADMIN_SETUP.md)')
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`,
    })
    if (error) {
      setFormError(friendlyAuthError(error))
      return
    }
    setNotice(`ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ ${email} แล้ว (หากมีบัญชีนี้ในระบบ)`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setNotice('')

    const errors = validateLoginForm(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    if (!isConfigured) {
      setFormError('ยังไม่ได้ตั้งค่า Supabase กรุณาดูวิธีตั้งค่าใน ADMIN_SETUP.md')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      })

      if (error) {
        setFormError(friendlyAuthError(error))
        return
      }

      // ไม่เช็ค role/status ซ้ำที่นี่ — <ProtectedAdminRoute> ที่ครอบทุกหน้า /admin/*
      // จะเป็นคนตัดสินและแสดงหน้า "รอการอนุมัติ"/"ไม่มีสิทธิ์" ที่ออกแบบไว้แล้วเอง
      // (กันไม่ให้ผู้ใช้เจอ UX คนละแบบสำหรับ DB state เดียวกัน)
      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, form.email.trim())
        else localStorage.removeItem(REMEMBER_KEY)
      } catch { /* ignore storage errors */ }

      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setFormError(friendlyAuthError(err))
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-pnru" />
      </div>
    )
  }

  return (
    <AdminAuthLayout>
      <AdminAuthCard
        title="Admin Portal"
        subtitle="เข้าสู่ระบบสำหรับผู้ดูแลระบบ"
        footer={
          <>
            ยังไม่มีบัญชีผู้ดูแลระบบ?{' '}
            <Link to="/admin/register" className="inline-flex min-h-[44px] items-center font-medium text-pnru hover:underline">
              สร้างบัญชี
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}
          {notice && (
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{notice}</span>
            </div>
          )}

          <AdminAuthInput
            label="อีเมล"
            name="email"
            type="email"
            autoComplete="username"
            icon={Mail}
            placeholder="admin@example.com"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
          />

          <PasswordInput
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
          />

          <div className="flex items-center justify-between text-sm">
            {/* min-h 44px ให้ทั้งสองอันกดถูกด้วยนิ้ว ตัวช่องติ๊กกับตัวอักษรยังเท่าเดิม */}
            <label className="flex min-h-[44px] items-center gap-2 text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-pnru focus:ring-pnru/30"
              />
              จดจำฉัน
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="min-h-[44px] px-1 font-medium text-pnru hover:underline"
            >
              ลืมรหัสผ่าน?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-pnru hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </AdminAuthCard>
    </AdminAuthLayout>
  )
}

export default AdminLogin
