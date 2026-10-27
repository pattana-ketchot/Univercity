/**
 * ตรวจชั้นดึงข้อมูลหลักสูตรที่มาแทน supabase.from('courses') — Phase 4
 *
 * เหตุที่ต้องมี: เจ็ดจุดในเว็บใช้ชั้นนี้ร่วมกัน พลาดที่เดียวคือหน้าหลักสูตร รายละเอียด
 * เปรียบเทียบ แนะนำสาขา อาชีพหลังจบ และแถบหน้าแรก ดับพร้อมกัน
 *
 * ข้อกำหนดที่ห้ามหลุด
 *   - 503 (อ่านฐานข้อมูลไม่ได้) ต้องโยน error ไม่ใช่คืนรายการว่าง
 *     เพราะสองอย่างนี้คนละเรื่อง และคืนว่างทำให้ดูเหมือน "ไม่มีหลักสูตร"
 *   - logo_url ของหลังบ้านต้องกลายเป็น logo ที่หน้าเว็บใช้
 *   - เลือกหลายรหัสต้องคงลำดับที่ผู้ใช้เลือก ไม่ใช่ลำดับฐานข้อมูล
 *
 *     node --test test/siteCourses.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  byCreatedAt,
  fetchSiteCourse,
  fetchSiteCourses,
  fetchSiteCoursesByIds
} from '../src/lib/siteCourses.js'

const A = {
  id: 'aaaa', course_id: 'pg-a', title: 'วิทยาการคอมพิวเตอร์', title_en: 'Computer Science',
  description: 'ก', logo_url: 'https://example/a.png', careers: ['นักพัฒนาซอฟต์แวร์'],
  detail: null, created_at: '2026-01-02', updated_at: '2026-01-02'
}
const B = {
  id: 'bbbb', course_id: null, title: 'เทคโนโลยีสารสนเทศ', title_en: 'IT',
  description: 'ข', logo_url: null, careers: null,
  detail: null, created_at: '2026-01-01', updated_at: '2026-01-01'
}

const stub = (handler) => { globalThis.fetch = handler }
const json = (body, status = 200) => ({
  ok: status >= 200 && status < 300, status, json: async () => body
})

test('คืนรายการหลักสูตรพร้อมแปลงชื่อฟิลด์', async () => {
  stub(async () => json({ courses: [A, B] }))
  const out = await fetchSiteCourses()
  assert.equal(out.length, 2)
  assert.equal(out[0].logo, 'https://example/a.png')
})

test('logo_url ที่เป็น null กลายเป็น logo null ไม่ใช่ undefined', async () => {
  stub(async () => json({ courses: [B] }))
  const out = await fetchSiteCourses()
  assert.equal(out[0].logo, null)
})

test('careers ที่เป็น null กลายเป็นรายการว่าง', async () => {
  stub(async () => json({ courses: [B] }))
  assert.deepEqual((await fetchSiteCourses())[0].careers, [])
})

test('ฟิลด์อื่นถูกส่งต่อครบ', async () => {
  stub(async () => json({ courses: [A] }))
  const c = (await fetchSiteCourses())[0]
  assert.equal(c.title, 'วิทยาการคอมพิวเตอร์')
  assert.equal(c.course_id, 'pg-a')
})

test('ไม่มีหลักสูตรคืนรายการว่าง ไม่ throw', async () => {
  stub(async () => json({ courses: [] }))
  assert.deepEqual(await fetchSiteCourses(), [])
})

test('503 ต้อง throw ไม่ใช่คืนรายการว่าง', async () => {
  stub(async () => json({ detail: 'x' }, 503))
  await assert.rejects(() => fetchSiteCourses(), /อ่านข้อมูลหลักสูตรไม่ได้/)
})

test('สถานะผิดพลาดอื่นก็ throw', async () => {
  stub(async () => json({}, 500))
  await assert.rejects(() => fetchSiteCourses(), /ไม่สำเร็จ \(500\)/)
})

test('ดึงรายตัวได้', async () => {
  stub(async () => json(A))
  const c = await fetchSiteCourse('aaaa')
  assert.equal(c.title, 'วิทยาการคอมพิวเตอร์')
  assert.equal(c.logo, 'https://example/a.png')
})

test('ไม่พบคืน null ไม่ throw', async () => {
  stub(async () => json({ detail: 'ไม่พบ' }, 404))
  assert.equal(await fetchSiteCourse('zzzz'), null)
})

test('รหัสถูกเข้ารหัสใน URL', async () => {
  let seen = ''
  stub(async (url) => { seen = url; return json(A) })
  await fetchSiteCourse('a/b c')
  assert.ok(seen.endsWith('/a%2Fb%20c'), seen)
})

test('เลือกหลายรหัสคงลำดับที่ผู้ใช้เลือก', async () => {
  stub(async () => json({ courses: [A, B] }))
  const out = await fetchSiteCoursesByIds(['bbbb', 'aaaa'])
  assert.deepEqual(out.map((c) => c.id), ['bbbb', 'aaaa'])
})

test('รหัสที่ไม่มีจริงถูกตัดทิ้ง ไม่ทำให้พัง', async () => {
  stub(async () => json({ courses: [A, B] }))
  const out = await fetchSiteCoursesByIds(['aaaa', 'ไม่มี'])
  assert.deepEqual(out.map((c) => c.id), ['aaaa'])
})

test('ส่งรายการว่างไม่ยิงเครือข่ายเลย', async () => {
  let calls = 0
  stub(async () => { calls += 1; return json({ courses: [] }) })
  assert.deepEqual(await fetchSiteCoursesByIds([]), [])
  assert.deepEqual(await fetchSiteCoursesByIds(null), [])
  assert.equal(calls, 0)
})

test('เลือกหลายรหัสยิงคำขอครั้งเดียว', async () => {
  let calls = 0
  stub(async () => { calls += 1; return json({ courses: [A, B] }) })
  await fetchSiteCoursesByIds(['aaaa', 'bbbb'])
  assert.equal(calls, 1)
})

test('เรียงตาม created_at ได้ตามลำดับเดิม', async () => {
  const out = [A, B].sort(byCreatedAt)
  assert.deepEqual(out.map((c) => c.id), ['bbbb', 'aaaa'])
})

test('created_at ที่หายไปไม่ทำให้การเรียงพัง', () => {
  const out = [{ id: 'x' }, A].sort(byCreatedAt)
  assert.equal(out.length, 2)
})
