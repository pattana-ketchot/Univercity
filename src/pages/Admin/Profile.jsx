import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import AdminLayout from '../../components/admin/AdminLayout'
import { useToast } from '../../components/admin/Toast'
import { apiJson } from '../../lib/apiAuth'
import { PASSWORD_MIN, friendlyAuthError } from '../../lib/adminAuth'
import AdminAuthInput from '../../components/admin/auth/AdminAuthInput'
import PasswordInput from '../../components/admin/auth/PasswordInput'
import { User, Mail } from 'lucide-react'

const roleLabel = { admin: 'ผู้ดูแลระบบ', editor: 'ผู้แก้ไขเนื้อหา', user: 'ผู้ใช้ทั่วไป' }

const ProfileContent = ({ user, role }) => {
  const showToast = useToast()
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [passwords, setPasswords] = useState({ currentPassword: '', password: '', confirmPassword: '' })
  const [passwordErrors, setPasswordErrors] = useState({})

  useEffect(() => {
    let active = true
    const fetchProfile = async () => {
      let data = null
      try {
        data = await apiJson('/api/auth/me')
      } catch {
        data = null
      }
      if (active) {
        setFullName(data?.full_name || '')
        setLoading(false)
      }
    }
    fetchProfile()
    return () => {
      active = false
    }
  }, [user.id])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setProfileError('กรุณากรอกชื่อที่แสดง')
      return
    }
    setProfileError('')
    setSavingProfile(true)
    try {
      await apiJson('/api/auth/me', {
        method: 'PUT',
        body: JSON.stringify({ full_name: fullName.trim() })
      })
    } catch (err) {
      setSavingProfile(false)
      showToast('บันทึกไม่สำเร็จ: ' + err.message, 'error')
      return
    }
    setSavingProfile(false)
    showToast('บันทึกโปรไฟล์เรียบร้อยแล้ว', 'success')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!passwords.currentPassword) errors.currentPassword = 'กรุณากรอกรหัสผ่านเดิม'
    if (!passwords.password) errors.password = 'กรุณากรอกรหัสผ่านใหม่'
    else if (passwords.password.length < PASSWORD_MIN) errors.password = `รหัสผ่านต้องมีอย่างน้อย ${PASSWORD_MIN} ตัวอักษร`
    if (!passwords.confirmPassword) errors.confirmPassword = 'กรุณายืนยันรหัสผ่านใหม่'
    else if (passwords.confirmPassword !== passwords.password) errors.confirmPassword = 'รหัสผ่านไม่ตรงกัน'

    setPasswordErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSavingPassword(true)
    try {
      // ต้องใส่รหัสผ่านเดิมด้วย — หลังบ้านบังคับไว้ กันคนที่ยืมเครื่องที่เปิดค้างยึดบัญชี
      await apiJson('/api/auth/password/change', {
        method: 'POST',
        body: JSON.stringify({
          current_password: passwords.currentPassword,
          new_password: passwords.password
        })
      })
    } catch (err) {
      setSavingPassword(false)
      showToast(friendlyAuthError(err), 'error')
      return
    }
    setSavingPassword(false)
    setPasswords({ currentPassword: '', password: '', confirmPassword: '' })
    showToast('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว', 'success')
  }

  if (loading) {
    return <p className="text-center text-gray-500 py-12">กำลังโหลด...</p>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSaveProfile} className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 space-y-5">
        <div className="flex items-center gap-3 pb-1">
          <div className="w-14 h-14 rounded-full bg-pnru text-white flex items-center justify-center text-xl font-semibold flex-shrink-0">
            {(fullName || user.email || 'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">ข้อมูลโปรไฟล์</h3>
            <span className="inline-flex items-center mt-1 text-xs font-medium bg-[#E8F5F1] text-pnru px-2.5 py-1 rounded-full">
              {roleLabel[role] || role}
            </span>
          </div>
        </div>

        <AdminAuthInput
          label="ชื่อที่แสดง"
          icon={User}
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value)
            setProfileError('')
          }}
          error={profileError}
        />

        <AdminAuthInput label="อีเมล" icon={Mail} value={user.email || ''} disabled className="opacity-60" />

        <button
          type="submit"
          disabled={savingProfile}
          className="w-full bg-pnru hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {savingProfile ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 space-y-5">
        <h3 className="text-base font-bold text-gray-900">เปลี่ยนรหัสผ่าน</h3>

        {/* ต้องใส่รหัสผ่านเดิม — หลังบ้านบังคับไว้ กันคนที่ยืมเครื่องที่เปิดค้างยึดบัญชี */}
        <PasswordInput
          label="รหัสผ่านเดิม"
          placeholder="รหัสผ่านที่ใช้อยู่ตอนนี้"
          value={passwords.currentPassword}
          onChange={(e) => {
            setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))
            setPasswordErrors((prev) => ({ ...prev, currentPassword: undefined }))
          }}
          error={passwordErrors.currentPassword}
        />

        <PasswordInput
          label="รหัสผ่านใหม่"
          placeholder={`อย่างน้อย ${PASSWORD_MIN} ตัวอักษร`}
          value={passwords.password}
          onChange={(e) => {
            setPasswords((prev) => ({ ...prev, password: e.target.value }))
            setPasswordErrors((prev) => ({ ...prev, password: undefined }))
          }}
          error={passwordErrors.password}
        />

        <PasswordInput
          label="ยืนยันรหัสผ่านใหม่"
          value={passwords.confirmPassword}
          onChange={(e) => {
            setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))
            setPasswordErrors((prev) => ({ ...prev, confirmPassword: undefined }))
          }}
          error={passwordErrors.confirmPassword}
        />

        <button
          type="submit"
          disabled={savingPassword}
          className="w-full bg-pnru hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {savingPassword ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
        </button>
      </form>
    </div>
  )
}

const Profile = () => {
  const { user, role, loading: authLoading, logout } = useAdminAuth()

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">กำลังตรวจสอบสิทธิ์...</div>
  }

  return (
    <AdminLayout active="profile" title="โปรไฟล์ของฉัน" user={user} role={role} onLogout={logout}>
      <ProfileContent user={user} role={role} />
    </AdminLayout>
  )
}

export default Profile
