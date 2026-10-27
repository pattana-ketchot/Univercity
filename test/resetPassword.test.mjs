/**
 * ตรวจฟอร์มตั้งรหัสผ่านใหม่ และการอ่าน token จากลิงก์
 *
 * เหตุที่ต้องมี: `/auth/admin/reset-link` คืนลิงก์มาที่ `/admin/reset-password`
 * ก่อนรอบนี้ **ไม่มีหน้านี้อยู่เลย** ลิงก์ที่ผู้ดูแลส่งให้จึงตกไปที่ index.html
 * แล้ว token ก็ไม่เคยถูกใช้ — การกู้บัญชีตอนที่ยังไม่ได้ตั้ง SMTP จึงใช้ไม่ได้จริง
 *
 * ข้อกำหนดที่ห้ามหลุด
 *   - ลิงก์ที่ไม่มี token ต้องบอกว่าคัดลอกไม่ครบ ไม่ใช่ปล่อยให้ยิงแล้วได้ "ลิงก์หมดอายุ"
 *   - รหัสผ่านสั้นกว่า 8 ต้องไม่ผ่าน (หลังบ้านบังคับ min_length=8 เช่นกัน)
 *   - รหัสยืนยันไม่ตรงต้องไม่ผ่าน
 *
 *     node --test test/resetPassword.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  PASSWORD_MIN,
  readResetToken,
  validateResetPasswordForm,
} from '../src/lib/adminAuth.js'

const ok = { token: 'abc123', password: 'รหัสผ่านยาวพอ', confirmPassword: 'รหัสผ่านยาวพอ' }

test('ฟอร์มที่กรอกครบและถูกต้องผ่าน', () => {
  assert.deepEqual(validateResetPasswordForm(ok), {})
})

test('ลิงก์ไม่มี token ต้องฟ้องเรื่องคัดลอกไม่ครบ ไม่ใช่เรื่องหมดอายุ', () => {
  const errors = validateResetPasswordForm({ ...ok, token: '' })
  assert.ok(errors.token)
  assert.match(errors.token, /คัดลอก/)
  assert.doesNotMatch(errors.token, /หมดอายุ/)
})

test('token ที่เป็นช่องว่างล้วนถือว่าไม่มี', () => {
  assert.ok(validateResetPasswordForm({ ...ok, token: '   ' }).token)
})

test('รหัสผ่านสั้นกว่าเกณฑ์ไม่ผ่าน และบอกจำนวนที่ต้องการ', () => {
  const short = 'a'.repeat(PASSWORD_MIN - 1)
  const errors = validateResetPasswordForm({ ...ok, password: short, confirmPassword: short })
  assert.ok(errors.password)
  assert.match(errors.password, new RegExp(String(PASSWORD_MIN)))
})

test('รหัสผ่านยาวเท่าเกณฑ์พอดีผ่าน', () => {
  const exact = 'a'.repeat(PASSWORD_MIN)
  assert.deepEqual(
    validateResetPasswordForm({ ...ok, password: exact, confirmPassword: exact }),
    {},
  )
})

test('รหัสผ่านภาษาไทยนับเป็นตัวอักษร ไม่ใช่ไบต์', () => {
  // 8 ตัวอักษรไทย = 24 ไบต์ใน UTF-8 — ต้องผ่าน เพราะหลังบ้าน prehash ก่อน bcrypt
  const thai = 'กขคงจฉชญ'
  assert.equal(thai.length, PASSWORD_MIN)
  assert.deepEqual(validateResetPasswordForm({ ...ok, password: thai, confirmPassword: thai }), {})
})

test('ยืนยันไม่ตรงกันไม่ผ่าน', () => {
  const errors = validateResetPasswordForm({ ...ok, confirmPassword: 'คนละอัน' })
  assert.ok(errors.confirmPassword)
  assert.equal(errors.password, undefined)
})

test('ไม่กรอกยืนยันไม่ผ่าน', () => {
  assert.ok(validateResetPasswordForm({ ...ok, confirmPassword: '' }).confirmPassword)
})

test('อ่าน token จาก query string ปกติ', () => {
  assert.equal(readResetToken('?token=xyz789'), 'xyz789')
})

test('อ่าน token ได้แม้มีพารามิเตอร์อื่นปนมา', () => {
  assert.equal(readResetToken('?from=mail&token=xyz789&x=1'), 'xyz789')
})

test('อ่าน token ได้แม้ผู้ใช้วางลิงก์มาทั้งอัน', () => {
  assert.equal(
    readResetToken('https://example.ac.th/admin/reset-password?token=xyz789'),
    'xyz789',
  )
})

test('token ที่มี URL-encoding ถูกถอดรหัสกลับ', () => {
  assert.equal(readResetToken('?token=ab%2Dcd%5Fef'), 'ab-cd_ef')
})

test('ไม่มี query เลยได้ค่าว่าง ไม่ throw', () => {
  assert.equal(readResetToken(''), '')
  assert.equal(readResetToken(undefined), '')
  assert.equal(readResetToken('?'), '')
})

test('token ที่มีช่องว่างหัวท้ายถูกตัดให้สะอาด', () => {
  assert.equal(readResetToken('?token=%20xyz789%20'), 'xyz789')
})
