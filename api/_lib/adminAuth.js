import { createClient } from '@supabase/supabase-js';

const ADMIN_ROLES = ['admin', 'editor'];

// ตรวจสิทธิ์ผู้เรียกใช้ร่วมกันทุก endpoint ใน api/admin/* — ต้อง login และมี role
// admin/editor สถานะ approved เท่านั้น ใช้ supabase client ที่ scope ด้วย token ของ
// ผู้เรียกเอง (ไม่ใช่ shared key) เพื่อให้ RLS บังคับด้วยตัวตนจริงของผู้เรียกด้วย
export async function requireAdminUser(request) {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { ok: false, response: Response.json({ error: 'Supabase env vars are missing' }, { status: 500 }) };
  }

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) {
    return { ok: false, response: Response.json({ error: 'Missing Authorization token' }, { status: 401 }) };
  }

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return { ok: false, response: Response.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single();

  if (!ADMIN_ROLES.includes(profile?.role) || profile?.status !== 'approved') {
    return { ok: false, response: Response.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { ok: true, supabase, user, url, anonKey };
}
