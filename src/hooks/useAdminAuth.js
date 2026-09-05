import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ADMIN_ROLES, canAccessAdminArea } from '../lib/adminAuth'

// เช็ค auth + role + status ของ Admin Panel แบบรวมศูนย์ (ใช้ร่วมกันทุกหน้า Admin)
// หมายเหตุ: เส้นทาง /admin/* ถูกกันด้วย <ProtectedAdminRoute> อีกชั้นหนึ่งแล้ว
// hook นี้เป็นการตรวจซ้ำระดับหน้า + ให้ข้อมูล role/สิทธิ์แก่ UI
//
// แคชผลตรวจสิทธิ์ไว้ระดับโมดูล เพื่อให้การสลับหน้าใน Admin ไม่ต้องขึ้นจอ
// "กำลังตรวจสอบสิทธิ์..." ใหม่ทุกครั้ง (ลดอาการกระตุก) — ยังตรวจซ้ำเบื้องหลังเสมอ
// ถูกล้างเมื่อ logout / session เปลี่ยน / ตรวจแล้วไม่ผ่าน
let sessionCache = null // { user, role, status }

const sameSession = (a, b) =>
  a && b && a.user?.id === b.user?.id && a.role === b.role && a.status === b.status

export const useAdminAuth = ({ requireAdmin = false } = {}) => {
  const navigate = useNavigate()

  // ใช้แคชเรนเดอร์ทันทีได้เฉพาะหน้าที่ไม่ได้บังคับ role='admin' — หน้า requireAdmin
  // (ตั้งค่า AI/ระบบ, ประวัติการใช้งาน, จัดการผู้ใช้) ต้องรอผลตรวจสิทธิ์สดเสมอ กัน
  // กรณีถูกลดสิทธิ์จาก admin เป็น editor ในแท็บ/เซสชันอื่นแล้วยังเห็นเนื้อหา admin-only
  // โผล่แวบก่อนถูกเด้งออกจากแคชที่ค้างสิทธิ์เดิมไว้
  const cacheUsable = sessionCache && !requireAdmin
  const [session, setSession] = useState(cacheUsable ? sessionCache : null)
  const [loading, setLoading] = useState(!cacheUsable)

  const checkAuth = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      sessionCache = null
      navigate('/admin/login')
      return
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, status')
      .eq('user_id', currentUser.id)
      .single()

    const currentRole = profile?.role || 'user'
    const currentStatus = profile?.status || 'approved'

    // ไม่ใช่ผู้ดูแลระบบ หรือยังไม่ได้รับอนุมัติ -> กลับไปหน้า login
    if (!canAccessAdminArea(currentRole, currentStatus)) {
      sessionCache = null
      navigate('/admin/login')
      return
    }

    if (requireAdmin && currentRole !== 'admin') {
      navigate('/admin/dashboard')
      return
    }

    const next = { user: currentUser, role: currentRole, status: currentStatus }
    sessionCache = next
    setSession((prev) => (sameSession(prev, next) ? prev : next))
    setLoading(false)
  }, [navigate, requireAdmin])

  useEffect(() => {
    // มีแคช -> เรนเดอร์ทันทีจากแคช แล้ว revalidate เงียบ ๆ / ไม่มีแคช -> ตรวจพร้อมจอโหลด
    checkAuth()

    // ออกจากระบบจากแท็บอื่น / token หมดอายุ -> ตรวจซ้ำ
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        sessionCache = null
        navigate('/admin/login')
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') checkAuth()
    })

    return () => sub?.subscription?.unsubscribe()
  }, [checkAuth, navigate])

  const logout = async () => {
    sessionCache = null
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return {
    user: session?.user || null,
    role: session?.role || null,
    status: session?.status || null,
    loading,
    canEdit: ADMIN_ROLES.includes(session?.role),
    isAdmin: session?.role === 'admin',
    logout
  }
}
