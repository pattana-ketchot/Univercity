// ชั้นเข้าสู่ระบบของหน้าเว็บ — Phase 4 (มาแทน supabase.auth)
//
// ที่เดียวที่เก็บ token และต่ออายุ ทุกหน้าเรียกผ่าน apiFetch() ไม่ยุ่งกับ token เอง
//
// ทำไมเก็บใน localStorage
// ----------------------
// ของเดิม supabase-js ก็เก็บที่นี่ พฤติกรรมเรื่องการค้างล็อกอินข้ามแท็บจึงเหมือนเดิม
// ทางที่ปลอดภัยกว่าคือ httpOnly cookie ซึ่งต้องแก้ทั้ง CORS และ CSRF — เป็นงานแยก
// ที่ควรทำหลังพรี ไม่ใช่เปลี่ยนสองเรื่องพร้อมกันในรอบเดียว

const ACCESS_KEY = 'sci_access_token'
const REFRESH_KEY = 'sci_refresh_token'
const USER_KEY = 'sci_user'

const listeners = new Set()

const read = (key) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const write = (key, value) => {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* โหมดส่วนตัวหรือปิดที่เก็บข้อมูล — ยังใช้งานได้ในแท็บนี้ */
  }
}

export const getAccessToken = () => read(ACCESS_KEY)
export const getRefreshToken = () => read(REFRESH_KEY)

export const getStoredUser = () => {
  try {
    return JSON.parse(read(USER_KEY) || 'null')
  } catch {
    return null
  }
}

const store = (session) => {
  write(ACCESS_KEY, session?.access_token ?? null)
  write(REFRESH_KEY, session?.refresh_token ?? null)
  write(USER_KEY, session?.user ? JSON.stringify(session.user) : null)
  listeners.forEach((fn) => fn(session?.user ?? null))
}

export const clearSession = () => store(null)

// แจ้งทุกหน้าเมื่อสถานะเข้าสู่ระบบเปลี่ยน — แทน supabase.auth.onAuthStateChange
export const onAuthChange = (handler) => {
  listeners.add(handler)
  const onStorage = (e) => {
    // ออกจากระบบจากแท็บอื่น
    if (e.key === ACCESS_KEY) handler(getStoredUser())
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(handler)
    window.removeEventListener('storage', onStorage)
  }
}

const post = async (path, body) => {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  return { res, data }
}

export const login = async (email, password) => {
  const { res, data } = await post('/api/auth/login', { email, password })
  if (!res.ok) {
    // 429 คือถูกล็อกชั่วคราวหรือลองถี่เกินไป — ข้อความจากหลังบ้านบอกเวลาที่ต้องรอไว้แล้ว
    throw new Error(data?.detail || 'เข้าสู่ระบบไม่สำเร็จ')
  }
  store(data)
  return data.user
}

export const register = async ({ email, password, full_name }) => {
  const { res, data } = await post('/api/auth/register', { email, password, full_name })
  if (!res.ok) {
    throw new Error(res.status === 409 ? 'อีเมลนี้ถูกใช้สมัครแล้ว'
      : data?.detail || 'สมัครไม่สำเร็จ')
  }
  return data
}

export const logout = async () => {
  const refresh = getRefreshToken()
  // ล้างฝั่งเบราว์เซอร์ก่อนเสมอ ผู้ใช้ต้องออกจากระบบได้แม้เครือข่ายล่ม
  clearSession()
  if (!refresh) return
  try {
    await post('/api/auth/logout', { refresh_token: refresh })
  } catch {
    /* ออกจากระบบฝั่งนี้แล้ว ถือว่าสำเร็จ */
  }
}

// ต่ออายุหนึ่งครั้งต่อหนึ่งช่วง — หลายคำขอที่หมดอายุพร้อมกันต้องไม่ยิงต่ออายุพร้อมกัน
// เพราะหลังบ้านหมุน token ทุกครั้ง ใบที่สองจะใช้ไม่ได้แล้วและทำให้หลุดจากระบบ
let refreshing = null

const refreshSession = async () => {
  const refresh = getRefreshToken()
  if (!refresh) return false
  if (!refreshing) {
    refreshing = post('/api/auth/refresh', { refresh_token: refresh })
      .then(({ res, data }) => {
        if (!res.ok) {
          clearSession()
          return false
        }
        store(data)
        return true
      })
      .catch(() => false)
      .finally(() => { refreshing = null })
  }
  return refreshing
}

/**
 * ยิง API พร้อมแนบ token และต่ออายุให้อัตโนมัติเมื่อหมดอายุ
 *
 * 401 ครั้งแรก -> ต่ออายุแล้วลองใหม่หนึ่งครั้ง · ยังไม่ผ่าน -> ล้างเซสชัน
 */
export const apiFetch = async (path, options = {}) => {
  const send = () => {
    const token = getAccessToken()
    const headers = { ...(options.headers || {}) }
    if (token) headers.Authorization = `Bearer ${token}`
    // ไม่ตั้ง Content-Type ให้ FormData เพราะเบราว์เซอร์ต้องใส่ boundary เอง
    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }
    return fetch(path, { ...options, headers })
  }

  let res = await send()
  if (res.status === 401 && getRefreshToken()) {
    if (await refreshSession()) res = await send()
    else clearSession()
  }
  return res
}

/** ยิง API แล้วคืน JSON — โยน Error พร้อมข้อความจากหลังบ้านถ้าไม่สำเร็จ */
export const apiJson = async (path, options = {}) => {
  const res = await apiFetch(path, options)
  if (res.status === 204) return null
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) throw new Error(data?.detail || `คำขอไม่สำเร็จ (${res.status})`)
  return data
}

/** ข้อมูลผู้ใช้ปัจจุบันจากหลังบ้าน — ใช้ตรวจซ้ำว่าสิทธิ์ยังเป็นปัจจุบัน */
export const fetchMe = async () => {
  if (!getAccessToken()) return null
  try {
    const user = await apiJson('/api/auth/me')
    write(USER_KEY, JSON.stringify(user))
    return user
  } catch {
    return null
  }
}
