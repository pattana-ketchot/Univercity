/**
 * ตรวจชั้นเข้าสู่ระบบของหน้าเว็บที่มาแทน supabase.auth — Phase 4
 *
 * เหตุที่ต้องมี: ทุกหน้าของผู้ดูแลยิง API ผ่านชั้นนี้ ถ้าพลาดคือหลุดจากระบบกลางคัน
 * หรือแย่กว่านั้นคือยังคิดว่าล็อกอินอยู่ทั้งที่ token ใช้ไม่ได้แล้ว
 *
 * ข้อกำหนดที่ห้ามหลุด
 *   - 401 ต้องต่ออายุแล้วลองใหม่ **หนึ่งครั้ง** ไม่ใช่วนไม่สิ้นสุด
 *   - หลายคำขอที่เจอ 401 พร้อมกันต้องต่ออายุ **ครั้งเดียว**
 *     เพราะหลังบ้านหมุน token ทุกครั้ง ใบที่สองจะใช้ไม่ได้และทำให้หลุดจากระบบ
 *   - ต่ออายุไม่สำเร็จต้องล้างเซสชัน ไม่ใช่ปล่อยให้ค้าง
 *   - ออกจากระบบต้องล้างฝั่งเบราว์เซอร์ได้แม้เครือข่ายล่ม
 *
 *     node --test test/apiAuth.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'

// ของปลอมของ localStorage และ window — ต้องมีก่อน import โมดูล
const store = new Map()
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k)
}
globalThis.window = { addEventListener() {}, removeEventListener() {} }

const auth = await import('../src/lib/apiAuth.js')

const json = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body
})

const SESSION = {
  access_token: 'access-1',
  refresh_token: 'refresh-1',
  user: { id: 'u1', email: 'a@b.c', role: 'admin', status: 'approved' }
}

const reset = () => {
  store.clear()
  globalThis.fetch = async () => json({}, 500)
}

test('เข้าสู่ระบบสำเร็จเก็บ token และผู้ใช้', async () => {
  reset()
  globalThis.fetch = async () => json(SESSION)
  const user = await auth.login('a@b.c', 'รหัสผ่าน')
  assert.equal(user.role, 'admin')
  assert.equal(auth.getAccessToken(), 'access-1')
  assert.equal(auth.getRefreshToken(), 'refresh-1')
  assert.equal(auth.getStoredUser().email, 'a@b.c')
})

test('เข้าสู่ระบบไม่สำเร็จโยนข้อความจากหลังบ้าน', async () => {
  reset()
  globalThis.fetch = async () => json({ detail: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, 401)
  await assert.rejects(() => auth.login('a@b.c', 'ผิด'), /ไม่ถูกต้อง/)
  assert.equal(auth.getAccessToken(), null)
})

test('ถูกล็อกชั่วคราวได้ข้อความบอกเวลาที่ต้องรอ', async () => {
  reset()
  globalThis.fetch = async () => json({ detail: 'บัญชีถูกล็อกชั่วคราว ลองใหม่ในอีก 15 นาที' }, 429)
  await assert.rejects(() => auth.login('a@b.c', 'ผิด'), /15 นาที/)
})

test('แนบ Authorization ให้คำขอที่ล็อกอินแล้ว', async () => {
  reset()
  store.set('sci_access_token', 'access-1')
  let seen = null
  globalThis.fetch = async (_p, opts) => { seen = opts.headers; return json({}) }
  await auth.apiFetch('/api/site-admin/courses')
  assert.equal(seen.Authorization, 'Bearer access-1')
})

test('ไม่แนบ Authorization เมื่อยังไม่ล็อกอิน', async () => {
  reset()
  let seen = null
  globalThis.fetch = async (_p, opts) => { seen = opts.headers; return json({}) }
  await auth.apiFetch('/api/site/courses')
  assert.equal(seen.Authorization, undefined)
})

test('ไม่ตั้ง Content-Type ให้ FormData', async () => {
  reset()
  store.set('sci_access_token', 'access-1')
  let seen = null
  globalThis.fetch = async (_p, opts) => { seen = opts.headers; return json({}) }
  class FD {}
  globalThis.FormData = FD
  await auth.apiFetch('/api/uploads/logo', { method: 'POST', body: new FD() })
  assert.equal(seen['Content-Type'], undefined)
})

test('401 แล้วต่ออายุสำเร็จ ลองใหม่หนึ่งครั้ง', async () => {
  reset()
  store.set('sci_access_token', 'เก่า')
  store.set('sci_refresh_token', 'refresh-1')
  const calls = []
  globalThis.fetch = async (path, opts) => {
    calls.push(path)
    if (path === '/api/auth/refresh') return json({ ...SESSION, access_token: 'ใหม่' })
    return opts.headers.Authorization === 'Bearer ใหม่' ? json({ ok: true }) : json({}, 401)
  }
  const res = await auth.apiFetch('/api/site-admin/courses')
  assert.equal(res.status, 200)
  assert.equal(calls.filter((c) => c === '/api/auth/refresh').length, 1)
  assert.equal(auth.getAccessToken(), 'ใหม่')
})

test('401 แล้วต่ออายุไม่สำเร็จ ต้องล้างเซสชัน', async () => {
  reset()
  store.set('sci_access_token', 'เก่า')
  store.set('sci_refresh_token', 'หมดอายุ')
  globalThis.fetch = async (path) =>
    path === '/api/auth/refresh' ? json({}, 401) : json({}, 401)
  const res = await auth.apiFetch('/api/site-admin/courses')
  assert.equal(res.status, 401)
  assert.equal(auth.getAccessToken(), null)
  assert.equal(auth.getRefreshToken(), null)
})

test('401 ซ้ำหลังต่ออายุแล้ว ต้องไม่วนไม่สิ้นสุด', async () => {
  reset()
  store.set('sci_access_token', 'เก่า')
  store.set('sci_refresh_token', 'refresh-1')
  let refreshes = 0
  globalThis.fetch = async (path) => {
    if (path === '/api/auth/refresh') { refreshes += 1; return json(SESSION) }
    return json({}, 401)
  }
  const res = await auth.apiFetch('/api/site-admin/courses')
  assert.equal(res.status, 401)
  assert.equal(refreshes, 1, 'ต้องต่ออายุครั้งเดียว')
})

test('หลายคำขอเจอ 401 พร้อมกัน ต่ออายุครั้งเดียว', async () => {
  reset()
  store.set('sci_access_token', 'เก่า')
  store.set('sci_refresh_token', 'refresh-1')
  let refreshes = 0
  globalThis.fetch = async (path, opts) => {
    if (path === '/api/auth/refresh') {
      refreshes += 1
      await new Promise((r) => setTimeout(r, 5))
      return json({ ...SESSION, access_token: 'ใหม่' })
    }
    return opts.headers.Authorization === 'Bearer ใหม่' ? json({ ok: true }) : json({}, 401)
  }
  await Promise.all([
    auth.apiFetch('/api/a'), auth.apiFetch('/api/b'), auth.apiFetch('/api/c')
  ])
  assert.equal(refreshes, 1, 'หมุน token หลายครั้งพร้อมกันทำให้หลุดจากระบบ')
})

test('ไม่มี refresh token ไม่พยายามต่ออายุ', async () => {
  reset()
  store.set('sci_access_token', 'เก่า')
  let refreshes = 0
  globalThis.fetch = async (path) => {
    if (path === '/api/auth/refresh') refreshes += 1
    return json({}, 401)
  }
  await auth.apiFetch('/api/x')
  assert.equal(refreshes, 0)
})

test('ออกจากระบบล้างทุกค่า', async () => {
  reset()
  store.set('sci_access_token', 'a')
  store.set('sci_refresh_token', 'r')
  store.set('sci_user', '{"id":"u1"}')
  globalThis.fetch = async () => json({}, 204)
  await auth.logout()
  assert.equal(auth.getAccessToken(), null)
  assert.equal(auth.getStoredUser(), null)
})

test('ออกจากระบบสำเร็จแม้เครือข่ายล่ม', async () => {
  reset()
  store.set('sci_access_token', 'a')
  store.set('sci_refresh_token', 'r')
  globalThis.fetch = async () => { throw new Error('offline') }
  await auth.logout()
  assert.equal(auth.getAccessToken(), null)
})

test('apiJson โยนข้อความจากหลังบ้านเมื่อไม่สำเร็จ', async () => {
  reset()
  globalThis.fetch = async () => json({ detail: 'ต้องเป็นผู้ดูแลที่ได้รับอนุมัติแล้ว' }, 403)
  await assert.rejects(() => auth.apiJson('/api/site-admin/users'), /ผู้ดูแลที่ได้รับอนุมัติ/)
})

test('apiJson คืน null เมื่อได้ 204', async () => {
  reset()
  globalThis.fetch = async () => ({ ok: true, status: 204, json: async () => { throw new Error('ว่าง') } })
  assert.equal(await auth.apiJson('/api/x', { method: 'DELETE' }), null)
})

test('ผู้ใช้ที่เก็บไว้เสียรูปไม่ทำให้พัง', () => {
  reset()
  store.set('sci_user', 'ไม่ใช่ json')
  assert.equal(auth.getStoredUser(), null)
})

test('fetchMe คืน null เมื่อยังไม่ล็อกอิน', async () => {
  reset()
  let called = false
  globalThis.fetch = async () => { called = true; return json({}) }
  assert.equal(await auth.fetchMe(), null)
  assert.equal(called, false)
})

test('fetchMe อัปเดตผู้ใช้ที่เก็บไว้', async () => {
  reset()
  store.set('sci_access_token', 'a')
  globalThis.fetch = async () => json({ id: 'u1', role: 'editor', status: 'approved' })
  const me = await auth.fetchMe()
  assert.equal(me.role, 'editor')
  assert.equal(auth.getStoredUser().role, 'editor')
})
