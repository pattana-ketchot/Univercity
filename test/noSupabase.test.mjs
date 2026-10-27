/**
 * ตรวจว่าไม่เหลือการพึ่ง Supabase ในหน้าเว็บ — Phase 4 ข้อ 8
 *
 * เหตุที่ต้องมี: เป้าหมายคือระบบทำงานครบเมื่อปิดการเชื่อมต่อ Supabase
 * การเหลือไว้แม้จุดเดียวแปลว่าหน้านั้นจะพังเงียบ ๆ ในวันที่ถอดออกจริง
 *
 * ตรวจสามชั้น — ซอร์ส · ไฟล์ที่ build แล้ว · dependency ใน package.json
 *
 *     node --test test/noSupabase.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

const walk = (dir, exts) => {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full, exts))
    else if (exts.some((e) => entry.name.endsWith(e))) out.push(full)
  }
  return out
}

// บรรทัดที่เป็นคำอธิบายไม่นับ — การเล่าว่า "เดิมเคยใช้ Supabase" คือสิ่งที่ควรมี
const isComment = (line) => /^\s*(\/\/|\*|\/\*)/.test(line)

const sourceHits = (pattern) => {
  const hits = []
  for (const file of walk(path.join(ROOT, 'src'), ['.js', '.jsx'])) {
    const lines = fs.readFileSync(file, 'utf8').split('\n')
    lines.forEach((line, i) => {
      if (!isComment(line) && pattern.test(line)) {
        hits.push(`${path.relative(ROOT, file)}:${i + 1}: ${line.trim().slice(0, 80)}`)
      }
    })
  }
  return hits
}

test('ไม่มีการ import ไลบรารีของ Supabase ในซอร์ส', () => {
  const hits = sourceHits(/@supabase\/supabase-js|from ['"].*lib\/supabase['"]/)
  assert.deepEqual(hits, [], hits.join('\n'))
})

test('ไม่มีการเรียกใช้ client ของ Supabase ในซอร์ส', () => {
  const hits = sourceHits(/\bsupabase\s*\.\s*(from|auth|storage|rpc|functions)\b/)
  assert.deepEqual(hits, [], hits.join('\n'))
})

test('ไม่มีการอ่านค่าตั้งค่าของ Supabase ในซอร์ส', () => {
  const hits = sourceHits(/VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE/)
  assert.deepEqual(hits, [], hits.join('\n'))
})

test('ไม่มี URL ของ Supabase ในซอร์ส', () => {
  const hits = sourceHits(/[a-z0-9-]+\.supabase\.(co|in)/)
  assert.deepEqual(hits, [], hits.join('\n'))
})

test('ไม่มีการเรียก Edge Function ในซอร์ส', () => {
  const hits = sourceHits(/functions\/v1\//)
  assert.deepEqual(hits, [], hits.join('\n'))
})

test('ไฟล์ client ของ Supabase ถูกลบออกแล้ว', () => {
  assert.equal(fs.existsSync(path.join(ROOT, 'src/lib/supabase.js')), false)
})

test('package.json ไม่มี dependency ของ Supabase', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  const all = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
  const found = Object.keys(all).filter((name) => name.includes('supabase'))
  assert.deepEqual(found, [], `ยังมี dependency: ${found.join(', ')}`)
})

test('ไฟล์ที่ build แล้วไม่มีร่องรอยของ Supabase', (t) => {
  const dist = path.join(ROOT, 'dist')
  if (!fs.existsSync(dist)) {
    t.skip('ยังไม่ได้ build — รัน npm run build ก่อน')
    return
  }
  const bad = []
  for (const file of walk(dist, ['.js', '.html', '.css'])) {
    const text = fs.readFileSync(file, 'utf8')
    for (const pattern of [/[a-z0-9-]+\.supabase\.co/, /supabase-js/, /VITE_SUPABASE/]) {
      if (pattern.test(text)) bad.push(`${path.relative(ROOT, file)} มี ${pattern}`)
    }
  }
  assert.deepEqual(bad, [], bad.join('\n'))
})

// เส้นทางของ webapi ที่ยังอ่าน Supabase อยู่ข้างหลัง
//
// การค้นคำว่า "supabase" ในซอร์สจับเรื่องนี้ไม่ได้เลย เพราะหน้าเว็บเรียก
// /api/sci-connect-news ซึ่งดูเหมือนเส้นทางของเราเอง แต่ Caddy ส่งต่อไปที่ webapi
// แล้ว webapi อ่าน Supabase ด้วย anon key
//
// พบตอนตรวจ Network ของหน้าเว็บจริงหลัง deploy — ไม่ใช่จากชุดทดสอบ
const WEBAPI_SUPABASE_ROUTES = [
  '/api/sci-connect-news',
  '/api/sci-connect-news-detail',
  '/api/admin/',
]

test('หน้าเว็บไม่เรียกเส้นทางของ webapi ที่อ่าน Supabase', () => {
  const hits = []
  for (const file of walk(path.join(ROOT, 'src'), ['.js', '.jsx'])) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
    lines.forEach((line, i) => {
      if (isComment(line)) return
      for (const route of WEBAPI_SUPABASE_ROUTES) {
        if (line.includes(route)) {
          hits.push(`${path.relative(ROOT, file)}:${i + 1} -> ${route}`)
        }
      }
    })
  }
  assert.deepEqual(hits, [], hits.join(' · '))
})
