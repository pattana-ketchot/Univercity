/**
 * ตรวจการจับคู่ "ชนิดที่ลบ" กับตารางและ source_type ของ RAG
 *
 * เหตุที่ต้องมี: หน้าภาพรวมผู้ดูแลลบได้สองชนิดแล้ว (หลักสูตร กับข่าว) การลบไม่ได้ลบแค่
 * แถวในตารางของตัวเอง แต่ต้องล้าง chunk ใน rag_documents ด้วย ไม่งั้น AI ยังอ้างอิง
 * ข้อมูลที่ถูกลบไปแล้ว — และ source_type ของสองชนิดนี้ไม่เหมือนกัน
 *
 * ข้อกำหนดที่ห้ามหลุด
 *   - source_type ของข่าวต้องเป็น 'news' ตรงกับที่ NewsForm.jsx ใช้ตอน unpublish
 *   - source_type ของหลักสูตรต้องยังเป็น 'major' เหมือนก่อนเพิ่มข่าว
 *   - ชนิดที่ไม่รู้จักต้องไม่ลบอะไรเลย
 *
 *     node --test test/adminDeletable.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'

import { DELETE_TARGETS, matchesNewsQuery } from '../src/lib/adminDeletable.js'

test('ลบหลักสูตรล้าง chunk ของ source_type major', () => {
  assert.equal(DELETE_TARGETS.course.table, 'courses')
  assert.equal(DELETE_TARGETS.course.sourceType, 'major')
})

test('ลบข่าวล้าง chunk ของ source_type news', () => {
  assert.equal(DELETE_TARGETS.news.table, 'news')
  assert.equal(DELETE_TARGETS.news.sourceType, 'news')
})

test('สอง source_type ต่างกัน ไม่ล้างทับกัน', () => {
  assert.notEqual(DELETE_TARGETS.course.sourceType, DELETE_TARGETS.news.sourceType)
})

test('ชนิดที่ไม่รู้จักไม่มีปลายทางให้ลบ', () => {
  assert.equal(DELETE_TARGETS.unknown, undefined)
  assert.equal(DELETE_TARGETS[undefined], undefined)
})

test('ทุกชนิดมีตาราง source_type และป้ายชื่อครบ', () => {
  for (const [kind, t] of Object.entries(DELETE_TARGETS)) {
    assert.ok(t.table, `${kind} ไม่มี table`)
    assert.ok(t.sourceType, `${kind} ไม่มี sourceType`)
    assert.ok(t.label, `${kind} ไม่มี label`)
  }
})

test('ไม่พิมพ์คำค้น เห็นข่าวทุกรายการ', () => {
  const item = { title: 'ประกาศรับสมัคร', category: 'ข่าวรับสมัคร' }
  assert.equal(matchesNewsQuery(item, ''), true)
  assert.equal(matchesNewsQuery(item, '   '), true)
  assert.equal(matchesNewsQuery(item, undefined), true)
})

test('ค้นจากหัวข้อข่าวได้', () => {
  const item = { title: 'ประกาศรับสมัครนักศึกษา', category: 'ทั่วไป' }
  assert.equal(matchesNewsQuery(item, 'รับสมัคร'), true)
  assert.equal(matchesNewsQuery(item, 'ไม่มีคำนี้'), false)
})

test('ค้นจากหมวดข่าวได้', () => {
  const item = { title: 'หัวข้อหนึ่ง', category: 'ข่าวกิจกรรม' }
  assert.equal(matchesNewsQuery(item, 'กิจกรรม'), true)
})

test('ค้นแบบไม่สนตัวพิมพ์ใหญ่เล็ก', () => {
  const item = { title: 'SCI Connect ฉบับที่ 30', category: 'Newsletter' }
  assert.equal(matchesNewsQuery(item, 'sci connect'), true)
  assert.equal(matchesNewsQuery(item, 'NEWSLETTER'), true)
})

test('ค่าว่างหรือ null ไม่ทำให้พัง', () => {
  assert.equal(matchesNewsQuery({ title: null, category: null }, 'อะไรก็ได้'), false)
  assert.equal(matchesNewsQuery({}, 'อะไรก็ได้'), false)
  assert.equal(matchesNewsQuery(null, 'อะไรก็ได้'), false)
  assert.equal(matchesNewsQuery(null, ''), true)
})
