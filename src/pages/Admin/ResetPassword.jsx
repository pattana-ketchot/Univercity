import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from 'lucide-react'
import { apiJson } from '../../lib/apiAuth'
import {
  friendlyAuthError,
  readResetToken,
  validateResetPasswordForm,
} from '../../lib/adminAuth'
import AdminAuthLayout from '../../components/admin/auth/AdminAuthLayout'
import AdminAuthCard from '../../components/admin/auth/AdminAuthCard'
import PasswordInput from '../../components/admin/auth/PasswordInput'

// หน้าปลายทางของลิงก์ตั้งรหัสผ่านใหม่
//
// ต้องมีหน้านี้ เพราะ /auth/admin/reset-link คืนลิงก์มาที่ /admin/reset-password
// ถ้าไม่มี เส้นทางจะตกไปที่ index.html แล้วลิงก์ที่ผู้ดูแลส่งให้ก็ใช้ไม่ได้เลย
//
// ไม่มีด่านสิทธิ์โดยตั้งใจ — คนที่ต้องใช้หน้านี้คือคนที่เข้าสู่ระบบไม่ได้อยู่แล้ว
// ตัวที่กันคือ token ซึ่งใช้ได้ครั้งเดียวและมีอายุจำกัด (ตรวจที่หลังบ้าน)
const AdminResetPassword = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const token = useMemo(() => readResetToken(location.search), [location.search])

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [done, setDone] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // บอกตั้งแต่เปิดหน้าว่าลิงก์ไม่มีรหัสยืนยัน ดีกว่าให้กรอกรหัสผ่านเสร็จแล้วเพิ่งรู้
  useEffect(() => {
    if (!token) {
      setFormError('ลิงก์นี้ไม่มีรหัสยืนยัน กรุณาคัดลอกลิงก์ทั้งบรรทัดจากผู้ดูแลอีกครั้ง')
    }
  }, [token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validateResetPasswordForm({ token, ...form })
    setFieldErrors(errors)
    if (errors.token) {
      setFormError(errors.token)
      return
    }
    if (Object.keys(errors).length > 0) return

    setIsLoading(true)
    setFormError('')
    try {
      await apiJson('/api/auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ token, new_password: form.password }),
      })
      setDone(true)
      // ตั้งรหัสใหม่แล้วทุกเซสชันถูกถอน จึงต้องเข้าสู่ระบบอีกครั้งเสมอ
      setTimeout(() => navigate('/admin/login', { replace: true }), 2500)
    } catch (error) {
      setFormError(friendlyAuthError(error))
    } finally {
      setIsLoading(false)
    }
  }

  if (done) {
    return (
      <AdminAuthLayout>
        <AdminAuthCard
          title="ตั้งรหัสผ่านใหม่เรียบร้อย"
          subtitle="กำลังพาไปหน้าเข้าสู่ระบบ"
        >
          <div className="flex items-start gap-2 bg-[#E8F5F1] text-pnru rounded-lg p-3 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>ใช้รหัสผ่านใหม่เข้าสู่ระบบได้ทันที — อุปกรณ์อื่นที่ค้างอยู่ถูกให้ออกจากระบบทั้งหมดแล้ว</span>
          </div>
          <Link
            to="/admin/login"
            className="mt-4 w-full inline-flex items-center justify-center h-11 rounded-lg bg-pnru text-white font-medium hover:brightness-110"
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
        title="ตั้งรหัสผ่านใหม่"
        subtitle="ลิงก์นี้ใช้ได้ครั้งเดียวและมีอายุจำกัด"
        footer={
          <Link to="/admin/login" className="text-pnru hover:underline">
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        }
      >
        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          {formError && (
            <div
              role="alert"
              className="flex items-start gap-2 bg-red-50 text-red-700 rounded-lg p-3 text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <PasswordInput
            label="รหัสผ่านใหม่"
            name="password"
            icon={KeyRound}
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
            autoComplete="new-password"
            placeholder="อย่างน้อย 8 ตัวอักษร"
          />

          <PasswordInput
            label="ยืนยันรหัสผ่านใหม่"
            name="confirmPassword"
            icon={KeyRound}
            value={form.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
            placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
          />

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full h-11 rounded-lg bg-pnru text-white font-medium hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'กำลังบันทึก...' : 'ตั้งรหัสผ่านใหม่'}
          </button>
        </form>
      </AdminAuthCard>
    </AdminAuthLayout>
  )
}

export default AdminResetPassword
