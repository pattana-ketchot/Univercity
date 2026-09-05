import { useAdminAuth } from '../../hooks/useAdminAuth'
import AdminLayout from '../../components/admin/AdminLayout'
import { ScrollText } from 'lucide-react'

const LogsContent = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 lg:p-14 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
    <div className="w-14 h-14 rounded-2xl bg-[#E8F5F1] flex items-center justify-center mb-4">
      <ScrollText className="w-7 h-7 text-pnru" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-1">ประวัติการใช้งาน</h3>
    <p className="text-sm text-gray-500">หน้านี้กำลังอยู่ระหว่างการพัฒนา จะเปิดใช้งานเร็วๆ นี้</p>
  </div>
)

const Logs = () => {
  const { user, role, loading: authLoading, logout } = useAdminAuth({ requireAdmin: true })

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">กำลังตรวจสอบสิทธิ์...</div>
  }

  return (
    <AdminLayout active="logs" title="ประวัติการใช้งาน" user={user} role={role} onLogout={logout}>
      <LogsContent />
    </AdminLayout>
  )
}

export default Logs
