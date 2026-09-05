import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// ตรวจสอบว่ามีการตั้งค่า Supabase หรือไม่
const isSupabaseConfigured =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export flag เพื่อให้ components ตรวจสอบได้
export const isConfigured = isSupabaseConfigured

// แสดงคำเตือนใน console ถ้ายังไม่ได้ตั้งค่า
if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '⚠️ Supabase ยังไม่ได้ตั้งค่า!\n' +
    'กรุณาไปที่ https://supabase.com สร้าง Project และตั้งค่าใน .env\n' +
    'ดูวิธีการตั้งค่าได้ที่ไฟล์ ADMIN_SETUP.md'
  )
}

// ดึงชื่อ/อีเมลของผู้ใช้จาก user_id หลายคนพร้อมกัน (ใช้แสดงแทน UUID ของ created_by/updated_by)
export const fetchProfilesByUserIds = async (userIds) => {
  const ids = [...new Set((userIds || []).filter(Boolean))]
  if (ids.length === 0) return {}

  const { data } = await supabase
    .from('user_profiles')
    .select('user_id, full_name, email')
    .in('user_id', ids)

  const map = {}
  ;(data || []).forEach((profile) => {
    map[profile.user_id] = profile
  })
  return map
}
