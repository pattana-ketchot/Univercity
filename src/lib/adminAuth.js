// ใส่นามสกุล .js ให้ชัด เพื่อให้ `node --test` นำเข้าไฟล์นี้ได้ตรง ๆ
// Vite เติมให้เองก็จริง แต่ Node ESM ไม่เติม ชุดทดสอบจึงนำเข้าไม่ได้ถ้าไม่ใส่
import { fetchMe, getStoredUser, register } from './apiAuth.js'

// ===== Validation helpers (ใช้ร่วมกันทั้งหน้า login และ register) =====
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isValidEmail = (email) => EMAIL_RE.test(String(email || '').trim())

export const PASSWORD_MIN = 8

// ===== แปลง error ให้เป็นข้อความภาษาไทยที่เข้าใจง่าย =====
//
// หลังบ้านของเราตอบเป็นภาษาไทยอยู่แล้ว (ดู backend/app/api/routes/auth.py)
// ที่เหลือคือกรณีเครือข่ายล่มซึ่งเบราว์เซอร์เป็นคนโยนมาเอง
export const friendlyAuthError = (error) => {
  if (!error) return ''
  const msg = error.message || String(error)
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต'
  }
  return msg || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
}

// ===== ดึง session + role + status ของผู้ใช้ปัจจุบัน =====
//
// ถาม /api/auth/me ทุกครั้ง **ไม่ตัดสินสิทธิ์จากค่าที่เก็บในเบราว์เซอร์**
// เพราะค่านั้นแก้ได้จาก devtools และอาจค้างสิทธิ์เดิมหลังถูกลดสิทธิ์
//
// ค่าที่เก็บไว้ใช้ได้อย่างเดียวคือเรนเดอร์ชั่วคราวระหว่างรอคำตอบ ซึ่งผู้เรียกจัดการเอง
export const fetchAdminSession = async () => {
  const me = await fetchMe()
  if (!me) return { user: null, role: null, status: null }
  return { user: me, role: me.role || 'user', status: me.status || 'pending' }
}

// ค่าที่เก็บไว้ — ใช้เรนเดอร์ระหว่างรอผลตรวจเท่านั้น ห้ามใช้ตัดสินสิทธิ์
export const cachedAdminSession = () => {
  const me = getStoredUser()
  return me ? { user: me, role: me.role, status: me.status } : null
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

// ฟอร์มตั้งรหัสผ่านใหม่จากลิงก์ที่ผู้ดูแลออกให้ (หน้า /admin/reset-password)
//
// ตรวจ token ที่นี่ด้วย เพราะผู้ใช้มักคัดลอกลิงก์มาไม่ครบ ถ้าไม่ตรวจก่อนยิง
// จะได้ข้อความ "ลิงก์หมดอายุ" ซึ่งทำให้เข้าใจผิดว่าลิงก์เสียทั้งที่แค่คัดลอกขาด
export const validateResetPasswordForm = ({ token, password, confirmPassword }) => {
  const errors = {}
  if (!token?.trim()) errors.token = 'ลิงก์ไม่มีรหัสยืนยัน กรุณาคัดลอกลิงก์ทั้งบรรทัดอีกครั้ง'
  if (!password) errors.password = 'กรุณากรอกรหัสผ่านใหม่'
  else if (password.length < PASSWORD_MIN) errors.password = `รหัสผ่านต้องมีอย่างน้อย ${PASSWORD_MIN} ตัวอักษร`
  if (!confirmPassword) errors.confirmPassword = 'กรุณายืนยันรหัสผ่านใหม่'
  else if (confirmPassword !== password) errors.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
  return errors
}

// อ่าน token จาก query string — รับทั้ง ?token= และกรณีที่ผู้ใช้วางลิงก์ทั้งอัน
export const readResetToken = (search) => {
  const raw = String(search || '')
  const query = raw.includes('?') ? raw.slice(raw.indexOf('?') + 1) : raw.replace(/^[?]/, '')
  const value = new URLSearchParams(query).get('token') || ''
  return value.trim()
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

// ===== สมัครบัญชี =====
//
// บัญชีใหม่ได้ role='user' และ status='pending' เสมอ (บังคับที่หลังบ้าน ไม่ใช่ที่นี่)
// ต้องให้ผู้ดูแลระดับสูงเลื่อนสิทธิ์ที่หน้า /admin/users ก่อนจึงเข้าใช้งานได้
export const signUpAdminAccount = async ({ fullName, email, password }) => {
  try {
    await register({ email: String(email).trim(), password, full_name: String(fullName).trim() })
  } catch (error) {
    return { ok: false, error: friendlyAuthError(error) }
  }
  // สมัครแล้วต้องรออนุมัติเสมอ — ไม่ได้ session ทันทีเหมือนของเดิม
  return { ok: true, needsApproval: true }
}
