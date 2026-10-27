import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchSiteCourse } from '../lib/siteCourses'
import { applyUrlFor } from '../lib/applyUrl'
import {
  Clock,
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Info,
  UserCheck,
  ExternalLink,
  CalendarClock
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const hasText = (v) => v != null && String(v).trim() !== ''
const firstText = (...vals) => {
  for (const v of vals) if (hasText(v)) return String(v)
  return 'ไม่ระบุ'
}

/**
 * รวมข้อมูลจากเอกสารหลักสูตรเข้ากับข้อมูลที่ผู้ดูแลระบบกรอกไว้
 *
 * ของที่คนกรอกเองมาก่อนเสมอ เพราะเป็นข้อมูลที่ตั้งใจใส่และแก้ได้จากหน้าแอดมิน
 * ส่วนช่องที่ยังว่าง (ยังไม่มีใครกรอก) จึงเติมด้วยค่าที่สกัดจากเอกสาร
 * ไม่เขียนทับของเดิมในทุกกรณี
 */
const withFacts = (detail, facts) => {
  const merged = { ...detail }
  for (const [key, value] of Object.entries(facts || {})) {
    const current = merged[key]
    const isEmpty = Array.isArray(current) ? current.length === 0 : !hasText(current)
    if (isEmpty) merged[key] = value
  }
  return merged
}

const SectionCard = ({ icon: Icon, title, children, bare = false }) => (
  <section className={bare ? '' : 'rounded-lg border border-gray-200 bg-white p-5 lg:p-6'}>
    <div className="mb-4 flex items-center gap-2.5">
      <Icon className="h-5 w-5 flex-shrink-0 text-pnru" />
      <h2 className="text-lg font-bold text-gray-900 lg:text-xl">{title}</h2>
    </div>
    {children}
  </section>
)

const EmptyState = ({ icon: Icon, text }) => (
  <div className="rounded-lg border border-dashed border-gray-200 bg-white p-10 text-center">
    <Icon className="mx-auto mb-3 h-8 w-8 text-gray-300" />
    <p className="text-sm text-gray-500">{text}</p>
  </div>
)

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

const CourseDetail = () => {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('details')
  const [course, setCourse] = useState(null)
  const [facts, setFacts] = useState({})
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true)
      setNotFound(false)
      setFacts({})

      let data = null
      try {
        data = await fetchSiteCourse(id)
      } catch {
        // อ่านไม่ได้กับไม่มีหลักสูตรนี้ คนละเรื่องกัน แต่หน้านี้แสดงได้แบบเดียว
        data = null
      }

      if (!data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setCourse(data)
      setActiveTab('details')
      setLoading(false)

      // เติมช่องที่ฐานข้อมูลของหน้าเว็บยังไม่มีคนกรอก ด้วยข้อมูลจากเอกสารหลักสูตร
      //
      // ช่องอย่างหน่วยกิต ภาษาที่ใช้สอน ค่าเทอม และรายชื่ออาจารย์ ถูกสกัดจากเอกสาร
      // มคอ.2 และประกาศของคณะไว้แล้วฝั่งหลังบ้าน ถ้าไม่ดึงมาหน้านี้จะขึ้นว่า
      // "ไม่ระบุ" ทุกช่องทั้งที่มีข้อมูลอยู่
      //
      // จับคู่ด้วยชื่อหลักสูตร ไม่ใช่รหัส เพราะฐานข้อมูลสองฝั่งใช้รหัสคนละชุดกัน
      // ล้มเหลวเมื่อไรก็แค่ไม่ได้ข้อมูลเสริม หน้ายังแสดงค่าจากฐานข้อมูลเดิมตามปกติ
      try {
        const res = await fetch(`/api/course-facts?title=${encodeURIComponent(data.title)}`)
        if (res.ok) setFacts(await res.json())
      } catch {
        /* ไม่มีข้อมูลเสริมก็แสดงเท่าที่มี */
      }
    }

    fetchCourse()
  }, [id])

  /* บนจอแคบแถบแท็บกว้างเกินที่มี แท็บท้าย ๆ เลยถูกตัดหายโดยไม่มีอะไรบอก
     จับสถานะการเลื่อนไว้ เพื่อโชว์เงาจาง ๆ ที่ขอบด้านที่ยังมีแท็บเหลืออยู่
     ต้องประกาศ hook ไว้เหนือ early return ทุกอัน ไม่งั้นลำดับ hook จะไม่เท่ากันทุกรอบ render */
  const tabsRef = useRef(null)
  const [tabsOverflow, setTabsOverflow] = useState({ left: false, right: false })

  const syncTabsOverflow = useCallback(() => {
    const el = tabsRef.current
    if (!el) return
    setTabsOverflow({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4
    })
  }, [])

  useEffect(() => {
    syncTabsOverflow()
    window.addEventListener('resize', syncTabsOverflow)
    return () => window.removeEventListener('resize', syncTabsOverflow)
  }, [syncTabsOverflow, course])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-gray-500">กำลังโหลด...</div>
  }

  if (notFound || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
        <GraduationCap className="mb-4 h-16 w-16 text-gray-300" />
        <h1 className="mb-2 text-xl font-semibold text-gray-700">ไม่พบหลักสูตรนี้</h1>
        <Link to="/courses" className="font-medium text-pnru hover:underline">
          กลับไปหน้าหลักสูตรทั้งหมด
        </Link>
      </div>
    )
  }

  // ค่าที่ผู้ดูแลระบบกรอกไว้มาก่อนเสมอ ส่วนช่องที่ยังว่างจึงเติมด้วยข้อมูลจากเอกสารหลักสูตร
  const detail = withFacts(course.detail || {}, facts)
  const highlights = Array.isArray(detail.highlights) ? detail.highlights : []
  const careers = Array.isArray(course.careers) && course.careers.length > 0
    ? course.careers
    : (Array.isArray(facts.careers) ? facts.careers : [])
  const faculty = Array.isArray(detail.faculty) ? detail.faculty : []
  const documents = Array.isArray(detail.documents) ? detail.documents : []
  const infoList = Array.isArray(detail.important_info) ? detail.important_info : []
  const qualifications = Array.isArray(detail.qualifications) ? detail.qualifications : []
  const admissionConditions = Array.isArray(detail.admission_conditions)
    ? detail.admission_conditions
    : []

  const hasDetailsContent = hasText(detail.about) || qualifications.length > 0
    || admissionConditions.length > 0 || highlights.length > 0 || careers.length > 0

  /* --- tabs (always 3, ตามสเปค) --- */
  const tabs = [
    { id: 'details', label: 'รายละเอียดหลักสูตร', icon: BookOpen },
    { id: 'documents', label: 'เอกสารหลักสูตร', icon: FileText },
    { id: 'faculty', label: 'คณาจารย์', icon: Users }
  ]

  /* --- sidebar "ข้อมูลสำคัญ" : resolve จากข้อมูลจริงเท่านั้น --- */
  const findInfo = (includes, excludes = []) => {
    const hit = infoList.find(
      (i) =>
        i &&
        typeof i.label === 'string' &&
        includes.some((k) => i.label.includes(k)) &&
        !excludes.some((k) => i.label.includes(k))
    )
    return hit && hasText(hit.value) ? String(hit.value) : null
  }

  const standardKeywords = [
    'ระดับ',
    'ระยะเวลา',
    'ค่าเล่าเรียน',
    'ค่าเทอม',
    'ค่าธรรมเนียม',
    'ตลอดหลักสูตร',
    'หน่วยกิต',
    'ภาษา',
    'ปริญญา',
    'รูปแบบการเรียน'
  ]

  const sidebarRows = [
    { label: 'ระดับการศึกษา', value: firstText(detail.level, findInfo(['ระดับการศึกษา', 'ระดับ'])) },
    { label: 'ระยะเวลาศึกษา', value: firstText(detail.duration, findInfo(['ระยะเวลา'])) },
    {
      label: 'ค่าเล่าเรียนต่อภาคการศึกษา',
      value: firstText(
        detail.tuition_per_semester,
        detail.tuition_per_term,
        detail.tuition,
        findInfo(['ค่าเล่าเรียน', 'ค่าเทอม', 'ค่าธรรมเนียม'], ['ตลอด'])
      ),
      strong: true
    },
    {
      label: 'ค่าใช้จ่ายตลอดหลักสูตร',
      value: firstText(
        detail.tuition_total,
        detail.total_tuition,
        detail.total_cost,
        findInfo(['ตลอดหลักสูตร', 'ตลอดหลัก'])
      ),
      strong: true
    }
  ]

  // เก็บ important_info รายการอื่นที่ไม่เข้าเกณฑ์มาตรฐาน ไม่ให้ข้อมูลเดิมหาย
  const extraRows = infoList
    .filter(
      (i) =>
        i &&
        typeof i.label === 'string' &&
        hasText(i.value) &&
        !standardKeywords.some((k) => i.label.includes(k))
    )
    .map((i) => ({ label: i.label, value: String(i.value) }))

  const allSidebarRows = [...sidebarRows, ...extraRows]

  /* --- header meta chips --- */
  const headerMeta = [
    detail.duration && { icon: Clock, text: detail.duration },
    detail.type && { icon: GraduationCap, text: detail.type }
  ].filter(Boolean)

  const ImportantInfoBox = (
    <div className="rounded-[10px] border border-gray-200 bg-white p-6 lg:p-7">
      <div className="mb-5 flex items-center gap-2.5">
        <Info className="h-5 w-5 flex-shrink-0 text-pnru" />
        <h3 className="text-lg font-bold text-gray-900">ข้อมูลสำคัญ</h3>
      </div>
      <dl className="divide-y divide-gray-100">
        {allSidebarRows.map((row, index) => (
          <div key={index} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <dt className="text-sm text-gray-500">{row.label}</dt>
            <dd
              className={`text-right text-sm ${
                row.strong ? 'font-bold text-gray-900' : 'font-medium text-gray-800'
              }`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )

  /* --- ที่มาของคุณสมบัติผู้สมัคร ---
     คุณสมบัติที่รับสมัครเปลี่ยนได้ทุกปีการศึกษา คนอ่านต้องเห็นว่าข้อความชุดนี้
     มาจากไหนและตรวจไว้เมื่อไร ไม่งั้นอ่านปีถัดไปก็ไม่รู้ว่ายังใช้ได้อยู่หรือเปล่า
     แสดงเฉพาะเมื่อผู้ดูแลบันทึกที่มาไว้ — ไม่เติมข้อความที่มาให้เองถ้าไม่มีข้อมูล */
  const sourceUrl = hasText(detail.source_url) ? String(detail.source_url).trim() : ''
  const sourceCheckedAt = hasText(detail.source_checked_at)
    ? String(detail.source_checked_at).trim()
    : ''
  // ลิงก์เงื่อนไขฉบับเต็ม — ใช้กับหลักสูตรที่หน้าเว็บคณะสรุปสั้นกว่าเล่ม มคอ.2
  const fullConditionsUrl = hasText(detail.full_conditions_url)
    ? String(detail.full_conditions_url).trim()
    : ''
  const qualificationsNote = hasText(detail.qualifications_note)
    ? String(detail.qualifications_note).trim()
    : ''

  const noteLinks = [
    fullConditionsUrl && { href: fullConditionsUrl, label: 'ดูเงื่อนไขฉบับเต็ม' },
    { href: applyUrlFor(detail), label: 'ประกาศรับสมัคร' },
    sourceUrl && { href: sourceUrl, label: 'ดูข้อมูลต้นทาง' }
  ].filter(Boolean)

  const SourceNote = (
    <div className="mt-4 max-w-2xl border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-500">
      {qualificationsNote && (
        <p className="mb-2 flex items-start gap-1.5 text-gray-600">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>{qualificationsNote}</span>
        </p>
      )}
      <p>
        {noteLinks.map((link, index) => (
          <span key={link.label}>
            {index > 0 && ' · '}
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-pnru"
            >
              {link.label}
            </a>
          </span>
        ))}
        {sourceCheckedAt && ` · ตรวจข้อมูลเมื่อ ${sourceCheckedAt}`}
      </p>
      <p className="mt-1">
        เงื่อนไขการรับสมัครอาจเปลี่ยนตามประกาศของมหาวิทยาลัยในแต่ละปีการศึกษา
      </p>
    </div>
  )

  /* --- ปุ่มสมัครเรียน ---
     ส่งต่อไปที่ระบบรับสมัครของมหาวิทยาลัย ระบบนี้ไม่รับสมัครเองและไม่เก็บข้อมูลผู้สมัคร
     เปิดแท็บใหม่เพราะเป็นเว็บคนละที่ คนอ่านยังต้องกลับมาดูหน้าหลักสูตรต่อได้ */
  const ApplyBox = (
    <div className="mt-4 rounded-[10px] border border-gray-200 bg-white p-6 lg:p-7">
      <h3 className="text-base font-bold text-gray-900">สนใจสมัครเรียน</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
        สมัครผ่านระบบรับสมัครนักศึกษาของมหาวิทยาลัยราชภัฏพระนคร
      </p>
      <a
        href={applyUrlFor(detail)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-full border-2 border-green-800 bg-green-800 px-5 py-2.5 font-medium text-white transition-colors hover:border-green-900 hover:bg-green-900"
      >
        สมัครเรียน
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* ---------- Breadcrumb ---------- */}
        <nav className="mb-5 text-sm text-gray-500 lg:mb-7">
          <Link to="/courses" className="hover:text-pnru">หลักสูตรทั้งหมด</Link>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-gray-700">{course.title}</span>
        </nav>

        {/* ---------- Course Header ---------- */}
        <div className="pb-6 lg:pb-8">
          <div className="flex flex-col gap-5 sm:flex-row lg:gap-10">
            <div className="mx-auto flex-shrink-0 sm:mx-0">
              <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-gray-200 bg-white p-2 lg:h-64 lg:w-64">
                {course.logo ? (
                  <img
                    src={course.logo}
                    alt={course.title}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'block'
                    }}
                  />
                ) : null}
                <GraduationCap
                  className="h-24 w-24 text-gray-300"
                  style={{ display: course.logo ? 'none' : 'block' }}
                />
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              {detail.level && (
                <span className="self-start mb-2 inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-pnru">
                  {detail.level}
                </span>
              )}

              <h1 className="text-xl font-bold leading-snug text-gray-900 sm:text-2xl lg:text-3xl">
                {course.title}
              </h1>

              {course.title_en && (
                <p className="mt-1 text-sm font-medium text-gray-500 lg:text-base">{course.title_en}</p>
              )}

              {course.description && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-700 lg:text-base">
                  {course.description}
                </p>
              )}

              {headerMeta.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-4">
                  {headerMeta.map((meta, index) => {
                    const MetaIcon = meta.icon
                    return (
                      <div key={index} className="flex items-center gap-2 text-gray-600">
                        <MetaIcon className="h-4 w-4 flex-shrink-0 text-pnru" />
                        <span className="text-sm font-medium">{meta.text}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---------- Body: content + sidebar ---------- */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-10 lg:gap-8">

          {/* Sidebar — mobile: ใต้ header ก่อนรายละเอียด / desktop: คอลัมน์ขวา sticky */}
          <aside className="order-1 lg:order-2 lg:col-span-3 lg:-mt-20">
            <div className="lg:sticky lg:top-6">
              {ImportantInfoBox}
              {ApplyBox}
            </div>
          </aside>

          {/* Main content */}
          <div className="order-2 min-w-0 lg:order-1 lg:col-span-7">

            {/* Tabs */}
            <div className="relative border-b border-gray-200">
              <div
                ref={tabsRef}
                onScroll={syncTabsOverflow}
                className="tab-scroll -mb-px flex gap-1 overflow-x-auto"
              >
                {tabs.map((tab) => {
                  const TabIcon = tab.icon
                  const active = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                        active
                          ? 'border-pnru text-pnru'
                          : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <TabIcon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* เงาบอกว่ายังมีแท็บเลยขอบไปอีก */}
              {tabsOverflow.left && (
                <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" />
              )}
              {tabsOverflow.right && (
                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />
              )}
            </div>

            <div className="mt-6 space-y-6">

              {/* --- Tab: details --- */}
              {activeTab === 'details' && (
                hasDetailsContent ? (
                  <>
                    {hasText(detail.about) && (
                      <SectionCard icon={BookOpen} title="เกี่ยวกับสาขา" bare>
                        <p className="max-w-2xl text-sm leading-relaxed text-gray-700 lg:text-base">
                          {detail.about}
                        </p>
                      </SectionCard>
                    )}

                    {(qualifications.length > 0 || admissionConditions.length > 0) && (
                      <SectionCard icon={UserCheck} title="คุณสมบัติผู้สมัคร" bare>
                        <div className="max-w-2xl space-y-2">
                          {qualifications.map((item, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm text-gray-700 lg:text-base">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-pnru" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>

                        {/* เงื่อนไขที่ผูกกับรอบรับสมัคร แยกหัวข้อจากคุณสมบัติทั่วไป
                            เพราะส่วนนี้เปลี่ยนทุกรอบ ส่วนบนไม่เปลี่ยน */}
                        {admissionConditions.length > 0 && (
                          <div className="mt-4 max-w-2xl">
                            <h4 className="mb-2 text-sm font-semibold text-gray-800">
                              เงื่อนไขตามรอบรับสมัคร
                            </h4>
                            <div className="space-y-2">
                              {admissionConditions.map((item, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm text-gray-700 lg:text-base">
                                  <CalendarClock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {SourceNote}
                      </SectionCard>
                    )}

                    {highlights.length > 0 && (
                      <SectionCard icon={Sparkles} title="รายละเอียดหลักสูตร" bare>
                        <div className="max-w-2xl space-y-3">
                          {highlights.map((item, index) => {
                            const title = typeof item === 'string' ? item : item?.title
                            const desc = typeof item === 'string' ? null : item?.description
                            return (
                              <div key={index}>
                                <p className="text-sm leading-relaxed text-gray-700 lg:text-base">{title}</p>
                                {hasText(desc) && (
                                  <p className="mt-0.5 text-xs leading-relaxed text-gray-500 lg:text-sm">{desc}</p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </SectionCard>
                    )}

                    {careers.length > 0 && (
                      <SectionCard icon={Briefcase} title="อาชีพหลังจบ" bare>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {careers.map((career, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-pnru" />
                              <span>{career}</span>
                            </div>
                          ))}
                        </div>
                      </SectionCard>
                    )}
                  </>
                ) : (
                  <EmptyState icon={BookOpen} text="ยังไม่มีรายละเอียดหลักสูตรสำหรับสาขานี้" />
                )
              )}

              {/* --- Tab: documents --- */}
              {activeTab === 'documents' && (
                documents.length > 0 ? (
                  <SectionCard icon={FileText} title="เอกสารหลักสูตร">
                    <div className="space-y-3">
                      {documents.map((doc, index) => {
                        const content = (
                          <>
                            <FileText className="h-5 w-5 flex-shrink-0 text-pnru" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900">{doc.name}</p>
                              {(hasText(doc.type) || hasText(doc.size)) && (
                                <p className="text-xs text-gray-500">
                                  {[doc.type, doc.size].filter(hasText).join(' • ')}
                                </p>
                              )}
                            </div>
                          </>
                        )

                        return doc.url ? (
                          <a
                            key={index}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-pnru hover:bg-[#E8F5F1]"
                          >
                            {content}
                          </a>
                        ) : (
                          <div key={index} className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
                            {content}
                          </div>
                        )
                      })}
                    </div>
                  </SectionCard>
                ) : (
                  <EmptyState icon={FileText} text="ยังไม่มีเอกสารหลักสูตรสำหรับสาขานี้" />
                )
              )}

              {/* --- Tab: faculty --- */}
              {activeTab === 'faculty' && (
                faculty.length > 0 ? (
                  <SectionCard icon={Users} title="คณาจารย์">
                    <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {faculty.map((teacher, index) => {
                        const nameTh = firstText(teacher.nameTh, teacher.name)
                        const positionTh = firstText(teacher.positionTh, teacher.expertise)
                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center rounded-[20px] border border-pnru/20 bg-cream p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                          >
                            <div className="mb-4 flex h-[150px] w-[150px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-pnru bg-white">
                              {teacher.image ? (
                                <img
                                  src={teacher.image}
                                  alt={nameTh}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Users className="h-12 w-12 text-gray-300" />
                              )}
                            </div>

                            {/* ชื่อไทยไม่มีช่องว่างระหว่างคำ เบราว์เซอร์จึงตัดกลางชื่อหรือกลางนามสกุลได้
                                แยกเป็นคำ ๆ ตามช่องว่างที่ผู้กรอกใส่มา แล้วให้แต่ละคำเป็นก้อนเดียว
                                บรรทัดจึงขึ้นใหม่ "ระหว่างชื่อกับนามสกุล" ก่อนเสมอ และตัดในคำเฉพาะ
                                เมื่อคำเดียวยาวเกินความกว้างการ์ดจริง ๆ (กันข้อความล้น) */}
                            <h3 className="flex w-full flex-wrap justify-center gap-x-1 text-base font-bold leading-snug text-gray-900">
                              {nameTh.split(/\s+/).filter(Boolean).map((part, partIndex) => (
                                <span key={partIndex} className="inline-block max-w-full break-words">
                                  {part}
                                </span>
                              ))}
                            </h3>

                            {hasText(teacher.nameEn) && (
                              <p className="mt-1 w-full break-words text-sm italic text-gray-500">
                                {teacher.nameEn}
                              </p>
                            )}

                            {/* แสดงตามที่กรอกมา ขึ้นบรรทัดใหม่ตามที่ผู้กรอกเคาะ (whitespace-pre-line)
                                ไม่แยกข้อความเองด้วยการเดาว่าท่อนไหนเป็นตำแหน่งวิชาการหรือหน้าที่บริหาร
                                ข้อมูลเดิมที่เป็นบรรทัดเดียวจึงแสดงเหมือนเดิมทุกประการ */}
                            {hasText(positionTh) && positionTh !== 'ไม่ระบุ' && (
                              <p className="mt-3 w-full whitespace-pre-line break-words text-sm font-bold leading-relaxed text-pnru">
                                {positionTh}
                              </p>
                            )}

                            {/* ตำแหน่งบริหาร เช่น ประธานสาขาวิชา มาจากช่องของตัวเองในหน้าแอดมิน
                                ไม่ได้แยกมาจากข้อความตำแหน่งทางวิชาการด้วยการเดา อาจารย์ที่ไม่มี
                                ตำแหน่งนี้การ์ดจะไม่มีบรรทัดนี้เลย ไม่ใช่เว้นที่ว่างไว้ */}
                            {hasText(teacher.roleTh) && (
                              <p className="mt-1 w-full whitespace-pre-line break-words text-sm font-bold leading-relaxed text-pnru">
                                {teacher.roleTh}
                              </p>
                            )}

                            {hasText(teacher.positionEn) && (
                              <p className="mt-1 w-full whitespace-pre-line break-words text-xs italic leading-relaxed text-pnru">
                                {teacher.positionEn}
                              </p>
                            )}

                            {/* อีเมลต่อจากตำแหน่งด้วยระยะเท่ากับช่องอื่น ไม่ดันไปติดขอบล่าง
                                เดิมใช้ mt-auto ให้อีเมลทุกใบอยู่แนวเดียวกัน แต่ใบที่ข้อความสั้น
                                จะเหลือช่องว่างกลางการ์ดถึง 61px ซึ่งดูห่างเกินไป
                                การ์ดยังสูงเท่ากันทั้งแถวเหมือนเดิม (h-full) ที่ว่างไปอยู่ใต้อีเมลแทน
                                break-all เพราะอีเมลยาวไม่มีช่องว่างให้ตัด */}
                            {hasText(teacher.email) && (
                              <a
                                href={`mailto:${teacher.email}`}
                                className="mt-3 block w-full break-all text-xs font-bold text-pnru underline-offset-2 hover:underline"
                              >
                                {teacher.email}
                              </a>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </SectionCard>
                ) : (
                  <EmptyState icon={Users} text="ยังไม่มีข้อมูลคณาจารย์สำหรับสาขานี้" />
                )
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetail
