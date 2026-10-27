import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import {
  fetchAdminSession,
  canAccessAdminArea,
  validateRegisterForm,
  signUpAdminAccount,
} from '../../lib/adminAuth'
import AdminAuthLayout from '../../components/admin/auth/AdminAuthLayout'
import AdminAuthCard from '../../components/admin/auth/AdminAuthCard'
import AdminAuthInput from '../../components/admin/auth/AdminAuthInput'
import PasswordInput from '../../components/admin/auth/PasswordInput'

const EMPTY = { fullName: '', email: '', password: '', confirmPassword: '' }

const AdminRegister = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [done, setDone] = useState(null) // { needsApproval: boolean }

  useEffect(() => {
    let active = true
    ;(async () => {
      const { user, role, status } = await fetchAdminSession()
      if (!active) return
      if (user && canAccessAdminArea(role, status)) {
        navigate('/admin/dashboard', { replace: true })
        return
      }
      setChecking(false)
    })()
    return () => { active = false }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    const errors = validateRegisterForm(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsLoading(true)
    try {
      const result = await signUpAdminAccount({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      })

      if (!result.ok) {
        setFormError(result.error)
        return
      }

      setDone({ needsApproval: result.needsApproval })
    } catch {
      setFormError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-pnru" />
      </div>
    )
  }

  if (done) {
    return (
      <AdminAuthLayout>
        <AdminAuthCard title="สร้างบัญชีเรียบร้อยแล้ว" subtitle="สร้างบัญชีสำหรับผู้ดูแลระบบ">
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>
              บัญชีของคุณยัง<strong>ไม่มีสิทธิ์เข้าใช้งานระบบผู้ดูแล</strong>{' '}
              โปรดติดต่อผู้ดูแลระบบระดับสูงให้กำหนดสิทธิ์ (role) ให้บัญชีของคุณที่หน้าจัดการผู้ใช้
              เมื่อได้รับสิทธิ์แล้วจึงจะเข้าสู่ระบบได้
            </span>
          </div>
          <Link
            to="/admin/login"
            className="mt-5 block w-full text-center bg-pnru hover:bg-green-800 text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            ไปหน้าเข้าสู่ระบบ
          </Link>
        </AdminAuthCard>
      </AdminAuthLayout>
    )
  }

  return (
    <AdminAuthLayout>
      <AdminAuthCard
        title="Create Admin Account"
        subtitle="สร้างบัญชีสำหรับผู้ดูแลระบบ"
        footer={
          <>
            มีบัญชีผู้ดูแลระบบอยู่แล้ว?{' '}
            <Link to="/admin/login" className="font-medium text-pnru hover:underline">
              เข้าสู่ระบบ
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

          <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 text-gray-500 text-xs rounded-xl p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              การสมัครเป็นเพียงการขอบัญชี — บัญชีใหม่จะยังไม่มีสิทธิ์เข้าระบบ
              จนกว่าผู้ดูแลระบบระดับสูงจะอนุมัติและกำหนดสิทธิ์ให้
            </span>
          </div>

          <AdminAuthInput
            label="ชื่อ-นามสกุล"
            name="fullName"
            type="text"
            autoComplete="name"
            icon={User}
            placeholder="เช่น สมชาย ใจดี"
            value={form.fullName}
            onChange={handleChange}
            error={fieldErrors.fullName}
          />

          <AdminAuthInput
            label="อีเมล"
            name="email"
            type="email"
            autoComplete="email"
            icon={Mail}
            placeholder="admin@example.com"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
          />

          <PasswordInput
            name="password"
            autoComplete="new-password"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
          />

          <PasswordInput
            label="ยืนยันรหัสผ่าน"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            value={form.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-pnru hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชี'}
          </button>
        </form>
      </AdminAuthCard>
    </AdminAuthLayout>
  )
}

export default AdminRegister
