import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, ShieldAlert, Clock } from 'lucide-react'
import { logout, onAuthChange } from '../../../lib/apiAuth'
import { fetchAdminSession, canAccessAdminArea, ADMIN_ROLES } from '../../../lib/adminAuth'

// การ์ดกันเส้นทาง /admin/* — ตรวจ session + role/status จาก Supabase (ฝั่ง DB เป็นตัวตัดสิน)
// - ไม่ล็อกอิน                -> ไปหน้า /admin/login
// - ล็อกอินแต่ status=pending   -> แสดงหน้า "รอการอนุมัติ"
// - ล็อกอินแต่ไม่ใช่ผู้ดูแลระบบ  -> แสดงหน้า "ไม่มีสิทธิ์เข้าใช้งาน"
const ProtectedAdminRoute = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [state, setState] = useState({ loading: true, user: null, role: null, status: null })

  useEffect(() => {
    let active = true

    const check = async () => {
      const { user, role, status } = await fetchAdminSession()
      if (active) setState({ loading: false, user, role, status })
    }
    check()

    // ออกจากระบบจากแท็บอื่น / เซสชันถูกเพิกถอน -> ตรวจซ้ำ
    const stop = onAuthChange((user) => {
      if (!user) setState({ loading: false, user: null, role: null, status: null })
      else check()
    })

    return () => {
      active = false
      stop()
    }
  }, [])

  const handleSignOut = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  if (state.loading) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          กำลังตรวจสอบสิทธิ์...
        </div>
      </div>
    )
  }

  if (!state.user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  // ล็อกอินแล้ว แต่ยังไม่ได้รับอนุมัติ
  if (ADMIN_ROLES.includes(state.role) && state.status === 'pending') {
    return (
      <StatusScreen
        icon={Clock}
        title="บัญชีอยู่ระหว่างรอการอนุมัติ"
        message="บัญชีผู้ดูแลระบบของคุณถูกสร้างเรียบร้อยแล้ว แต่ต้องรอผู้ดูแลระบบระดับสูงอนุมัติก่อนจึงจะเข้าใช้งานได้"
        onSignOut={handleSignOut}
      />
    )
  }

  // ล็อกอินแล้ว แต่ไม่ใช่ผู้ดูแลระบบ (เช่น ผู้ใช้ทั่วไป)
  if (!canAccessAdminArea(state.role, state.status)) {
    return (
      <StatusScreen
        icon={ShieldAlert}
        title="ไม่มีสิทธิ์เข้าใช้งาน"
        message="บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบผู้ดูแล หากคิดว่าเป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ"
        onSignOut={handleSignOut}
      />
    )
  }

  return <Outlet />
}

const StatusScreen = ({ icon: Icon, title, message, onSignOut }) => (
  <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center p-4">
    <div
      className="bg-white border border-gray-200/80 rounded-[18px] shadow-[0_4px_24px_-8px_rgba(1,106,43,0.12),0_2px_8px_rgba(0,0,0,0.04)] p-8 text-center"
      style={{ width: 'min(400px, calc(100% - 32px))' }}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#E8F5F1] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-pnru" />
      </div>
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
      <button
        onClick={onSignOut}
        className="mt-6 w-full bg-pnru hover:bg-green-800 text-white font-semibold py-2.5 rounded-xl transition-colors"
      >
        ออกจากระบบ
      </button>
    </div>
  </div>
)

export default ProtectedAdminRoute
