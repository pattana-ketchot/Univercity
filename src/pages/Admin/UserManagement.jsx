import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import AdminLayout from '../../components/admin/AdminLayout'
import { useToast } from '../../components/admin/Toast'
import { supabase } from '../../lib/supabase'
import { AlertCircle } from 'lucide-react'

const ROLES = ['user', 'editor', 'admin']

const formatDate = (value) => {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleDateString('th-TH', { dateStyle: 'medium' })
  } catch {
    return value
  }
}

const UserManagementContent = ({ currentUserId }) => {
  const showToast = useToast()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, user_id, role, status, full_name, email, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      setLoadError('โหลดข้อมูลผู้ใช้งานไม่สำเร็จ: ' + error.message)
      setProfiles([])
      setLoading(false)
      return
    }

    setProfiles(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const handleRoleChange = async (userId, role) => {
    const { error } = await supabase.from('user_profiles').update({ role }).eq('user_id', userId)
    if (error) {
      showToast('เปลี่ยน role ไม่สำเร็จ: ' + error.message, 'error')
      return
    }
    showToast('เปลี่ยน role เรียบร้อยแล้ว', 'success')
    fetchProfiles()
  }

  const handleStatusChange = async (userId, status) => {
    const { error } = await supabase.from('user_profiles').update({ status }).eq('user_id', userId)
    if (error) {
      showToast('อัปเดตสถานะไม่สำเร็จ: ' + error.message, 'error')
      return
    }
    showToast(status === 'approved' ? 'อนุมัติผู้ดูแลระบบเรียบร้อยแล้ว' : 'ระงับบัญชีเรียบร้อยแล้ว', 'success')
    fetchProfiles()
  }

  return (
    <div>
      {loadError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{loadError}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-gray-500">กำลังโหลด...</p>
        ) : profiles.length === 0 ? (
          <p className="p-6 text-center text-gray-500">ยังไม่มีผู้ใช้งาน</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">ชื่อ</th>
                  <th className="px-4 py-3 font-medium">อีเมล</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">สถานะ</th>
                  <th className="px-4 py-3 font-medium">วันที่สร้าง</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-900">
                      {profile.full_name || '(ไม่มีชื่อ)'}
                      {profile.user_id === currentUserId && (
                        <span className="ml-2 text-xs text-gray-400">(คุณ)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{profile.email || '-'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={profile.role}
                        onChange={(e) => handleRoleChange(profile.user_id, e.target.value)}
                        disabled={profile.user_id === currentUserId}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-pnru"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {profile.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            รออนุมัติ
                          </span>
                          {profile.user_id !== currentUserId && (
                            <button
                              onClick={() => handleStatusChange(profile.user_id, 'approved')}
                              className="text-xs font-medium text-pnru hover:underline"
                            >
                              อนุมัติ
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            อนุมัติแล้ว
                          </span>
                          {profile.user_id !== currentUserId && (
                            <button
                              onClick={() => handleStatusChange(profile.user_id, 'pending')}
                              className="text-xs font-medium text-gray-400 hover:text-red-600 hover:underline"
                            >
                              ระงับ
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(profile.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const UserManagement = () => {
  const { user, role, loading: authLoading, logout } = useAdminAuth({ requireAdmin: true })

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">กำลังตรวจสอบสิทธิ์...</div>
  }

  return (
    <AdminLayout active="users" title="จัดการผู้ใช้งาน" user={user} role={role} onLogout={logout}>
      <UserManagementContent currentUserId={user?.id} />
    </AdminLayout>
  )
}

export default UserManagement
