import { supabase } from './supabase'

// ===== Validation helpers (ใช้ร่วมกันทั้งหน้า login และ register) =====
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isValidEmail = (email) => EMAIL_RE.test(String(email || '').trim())

export const PASSWORD_MIN = 8

// ===== แปลง error จาก Supabase Auth ให้เป็นข้อความภาษาไทยที่เข้าใจง่าย =====
export const friendlyAuthError = (error) => {
  if (!error) return ''
  const msg = (error.message || String(error)).toLowerCase()

  if (msg.includes('invalid login credentials')) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  if (msg.includes('email not confirmed')) return 'บัญชีนี้ยังไม่ได้ยืนยันอีเมล กรุณาติดต่อผู้ดูแลระบบ'
  if (msg.includes('user already registered') || msg.includes('already been registered'))
    return 'อีเมลนี้ถูกใช้งานแล้ว'
  if (msg.includes('password should be at least')) return `รหัสผ่านต้องมีอย่างน้อย ${PASSWORD_MIN} ตัวอักษร`
  if (msg.includes('rate limit') || msg.includes('too many requests'))
    return 'มีการพยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่'
  if (msg.includes('network') || msg.includes('fetch')) return 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต'

  return error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
}

// ===== ดึง session + role + status ของผู้ใช้ปัจจุบัน (ตรวจจากฝั่ง Supabase เสมอ) =====
// ไม่พึ่ง localStorage ในการตัดสินสิทธิ์ — role/status มาจากตาราง user_profiles เท่านั้น
export const fetchAdminSession = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, role: null, status: null }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  return {
    user,
    role: profile?.role || 'user',
    status: profile?.status || 'approved',
  }
}

export const ADMIN_ROLES = ['admin', 'editor']

// อนุญาตเข้าพื้นที่ผู้ดูแลระบบเมื่อ: เป็น admin/editor + สถานะ approved
export const canAccessAdminArea = (role, status) =>
  ADMIN_ROLES.includes(role) && status === 'approved'

// ===== Validation ของฟอร์ม — คืน object { field: ข้อความ } (ว่าง = ผ่าน) =====
export const validateLoginForm = ({ email, password }) => {
  const errors = {}
  if (!email?.trim()) errors.email = 'กรุณากรอกอีเมล'
  else if (!isValidEmail(email)) errors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
  if (!password) errors.password = 'กรุณากรอกรหัสผ่าน'
  return errors
}

export const validateRegisterForm = ({ fullName, email, password, confirmPassword }) => {
  const errors = {}
  if (!fullName?.trim()) errors.fullName = 'กรุณากรอกชื่อ-นามสกุล'
  if (!email?.trim()) errors.email = 'กรุณากรอกอีเมล'
  else if (!isValidEmail(email)) errors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
  if (!password) errors.password = 'กรุณากรอกรหัสผ่าน'
  else if (password.length < PASSWORD_MIN) errors.password = `รหัสผ่านต้องมีอย่างน้อย ${PASSWORD_MIN} ตัวอักษร`
  if (!confirmPassword) errors.confirmPassword = 'กรุณายืนยันรหัสผ่าน'
  else if (confirmPassword !== password) errors.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
  return errors
}

// ===== สมัครบัญชีผ่าน Supabase Auth โดยตรง (Supabase เป็นผู้ hash รหัสผ่าน) =====
// บัญชีที่สมัครใหม่จะได้ role='user' (จาก trigger handle_new_user) — ยังไม่มีสิทธิ์ผู้ดูแลระบบ
// ต้องให้ผู้ดูแลระบบระดับสูงกำหนด role='admin'/'editor' ที่หน้า /admin/users ก่อนจึงจะเข้าใช้งานได้
export const signUpAdminAccount = async ({ fullName, email, password }) => {
  const { data, error } = await supabase.auth.signUp({
    email: String(email).trim(),
    password,
    options: {
      data: { full_name: String(fullName).trim() },
      emailRedirectTo: `${window.location.origin}/admin/login`,
    },
  })

  if (error) {
    return { ok: false, error: friendlyAuthError(error) }
  }

  // มี session ทันที = โปรเจกต์ปิดการยืนยันอีเมล / ไม่มี session = ต้องยืนยันอีเมลก่อน
  return { ok: true, needsEmailConfirm: !data.session }
}
