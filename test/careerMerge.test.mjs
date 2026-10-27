/**
 * ตรวจการรวมรายการอาชีพของหน้า "อาชีพหลังจบ"
 *
 * เหตุที่ต้องมี: หน้านี้ขึ้นว่า "ยังไม่มีข้อมูลหลักสูตร" มาตลอด เพราะคอลัมน์ careers ของ
 * ฐานข้อมูลหน้าเว็บว่างทุกแถว ทั้งที่รายการอาชีพที่ตรวจกับเอกสาร มคอ.2 แล้วมีอยู่ที่หลังบ้าน
 * การจับคู่สองฝั่งต้องผ่านตารางชื่อหลักสูตร เพราะชื่อคนละรูปแบบกันโดยสิ้นเชิง
 *
 * ข้อกำหนดที่ห้ามหลุด
 *   - ไม่ซ่อนหลักสูตรใดทิ้ง แม้ยังไม่มีรายการอาชีพ
 *   - ชื่อที่จับคู่ไม่ได้ ต้องไม่ทำให้หลักสูตรอื่นเพี้ยน และต้องไม่เดาว่าเป็นหลักสูตรไหน
 *   - source ต้องมาคู่กับรายการที่ตรวจแล้วเท่านั้น
 *
 *     node --test test/careerMerge.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'

import { mergeCareers, byCareersThenTitle } from '../src/lib/careerMerge.js'
import { PROGRAMMES } from '../src/data/programmeLinks.js'

const CS = PROGRAMMES.find((p) => p.courseTitle === 'วิทยาการคอมพิวเตอร์')
const IT = PROGRAMMES.find((p) => p.courseTitle === 'เทคโนโลยีสารสนเทศ')

// ชื่อเต็มฝั่งหลังบ้าน เอามาจากตารางเดียวกับที่หน้าเว็บใช้จับคู่ ไม่ได้พิมพ์เอง
const CS_SOURCE_TITLE = CS.sourceTitles.find((t) => t.includes('2566'))
const IT_SOURCE_TITLE = IT.sourceTitles.find((t) => t.includes('2566'))

const rows = () => [
  { id: CS.courseId, title: 'วิทยาการคอมพิวเตอร์', careers: [] },
  { id: IT.courseId, title: 'เทคโนโลยีสารสนเทศ', careers: [] },
  { id: 'ไม่มีข้อมูลเผยแพร่', title: 'ชีววิทยา', careers: [] },
]

const published = () => [
  {
    course_title: CS_SOURCE_TITLE,
    careers: ['นักพัฒนาซอฟต์แวร์', 'นักวิเคราะห์และออกแบบระบบ'],
    source: { file: 'cs66.pdf', page_start: 3, page_end: 3, document_id: 'doc-cs' },
  },
  {
    course_title: IT_SOURCE_TITLE,
    careers: ['นักเทคโนโลยีสารสนเทศ'],
    source: { file: 'it66.pdf', page_start: 6, page_end: 7 },
  },
]

test('จับคู่ชื่อเต็มฝั่งหลังบ้านกับสาขาฝั่งหน้าเว็บได้', () => {
  const out = mergeCareers(rows(), published())
  const cs = out.find((c) => c.id === CS.courseId)
  assert.deepEqual(cs.careers, ['นักพัฒนาซอฟต์แวร์', 'นักวิเคราะห์และออกแบบระบบ'])
})

test('ไม่ซ่อนหลักสูตรที่ยังไม่มีรายการอาชีพ', () => {
  const out = mergeCareers(rows(), published())
  assert.equal(out.length, 3)
  const bio = out.find((c) => c.title === 'ชีววิทยา')
  assert.deepEqual(bio.careers, [])
})

test('หลักสูตรที่ยังไม่มีรายการ ไม่มี source ติดมา', () => {
  const out = mergeCareers(rows(), published())
  assert.equal(out.find((c) => c.title === 'ชีววิทยา').source, null)
})

test('source ของรายการที่ตรวจแล้วมาครบ', () => {
  const cs = mergeCareers(rows(), published()).find((c) => c.id === CS.courseId)
  assert.equal(cs.source.file, 'cs66.pdf')
  assert.equal(cs.source.page_start, 3)
  assert.equal(cs.source.document_id, 'doc-cs')
})

test('ไม่มี document_id ก็ยังรับรายการอาชีพมาแสดง', () => {
  const it = mergeCareers(rows(), published()).find((c) => c.id === IT.courseId)
  assert.deepEqual(it.careers, ['นักเทคโนโลยีสารสนเทศ'])
  assert.equal(it.source.document_id, undefined)
})

test('ชื่อหลักสูตรที่จับคู่ไม่ได้ ถูกข้ามไปโดยไม่กระทบหลักสูตรอื่น', () => {
  const out = mergeCareers(rows(), [
    { course_title: 'หลักสูตรที่ไม่มีในตารางจับคู่', careers: ['อาชีพปลอม'], source: null },
    ...published(),
  ])
  assert.equal(out.length, 3)
  assert.ok(!out.some((c) => c.careers.includes('อาชีพปลอม')))
  assert.deepEqual(out.find((c) => c.id === IT.courseId).careers, ['นักเทคโนโลยีสารสนเทศ'])
})

test('หลักสูตรเดียวกันหลายฉบับปี เลือกฉบับที่มีรายการมากกว่า', () => {
  const older = CS.sourceTitles.find((t) => t.includes('2561'))
  const out = mergeCareers(rows(), [
    { course_title: older, careers: ['อาชีพเดียว'], source: { file: 'cs61.pdf', page_start: 1, page_end: 1 } },
    ...published(),
  ])
  const cs = out.find((c) => c.id === CS.courseId)
  assert.equal(cs.careers.length, 2)
  assert.equal(cs.source.file, 'cs66.pdf')
})

test('ไม่มีข้อมูลจากหลังบ้านเลย ยังคืนหลักสูตรครบ', () => {
  const out = mergeCareers(rows(), [])
  assert.equal(out.length, 3)
  assert.ok(out.every((c) => c.careers.length === 0))
})

test('หลังบ้านล้มจนได้ค่าว่าง ไม่ทำให้พัง', () => {
  assert.equal(mergeCareers(rows(), null).length, 3)
  assert.deepEqual(mergeCareers(null, published()), [])
})

test('ค่าที่คนกรอกไว้ในฐานข้อมูลหน้าเว็บเองยังถูกใช้', () => {
  const manual = [{ id: 'กรอกเอง', title: 'สาขาที่กรอกมือ', careers: ['อาชีพที่กรอกไว้'] }]
  const out = mergeCareers(manual, [])
  assert.deepEqual(out[0].careers, ['อาชีพที่กรอกไว้'])
})

test('ข้อมูลที่ตรวจแล้วชนะค่าที่กรอกมือ', () => {
  const manual = [{ id: CS.courseId, title: 'วิทยาการคอมพิวเตอร์', careers: ['ค่าที่กรอกมือ'] }]
  const out = mergeCareers(manual, published())
  assert.ok(!out[0].careers.includes('ค่าที่กรอกมือ'))
  assert.equal(out[0].source.file, 'cs66.pdf')
})

test('เรียงหลักสูตรที่มีรายการขึ้นก่อน', () => {
  const out = mergeCareers(rows(), published()).sort(byCareersThenTitle)
  assert.ok(out[0].careers.length > 0)
  assert.ok(out[1].careers.length > 0)
  assert.equal(out[2].careers.length, 0)
})

test('ที่มีรายการเท่ากัน เรียงตามชื่อภาษาไทย', () => {
  const out = [
    { title: 'เทคโนโลยีสารสนเทศ', careers: ['ก'] },
    { title: 'การจัดการสิ่งแวดล้อม', careers: ['ข'] },
  ].sort(byCareersThenTitle)
  assert.equal(out[0].title, 'การจัดการสิ่งแวดล้อม')
})
