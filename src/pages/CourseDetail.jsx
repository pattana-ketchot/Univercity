import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, isConfigured } from '../lib/supabase'
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
  UserCheck
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const hasText = (v) => v != null && String(v).trim() !== ''
const firstText = (...vals) => {
  for (const v of vals) if (hasText(v)) return String(v)
  return 'ไม่ระบุ'
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
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true)
      setNotFound(false)

      if (!isConfigured) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase.from('courses').select('*').eq('id', id).single()

      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setCourse(data)
      setActiveTab('details')
      setLoading(false)
    }

    fetchCourse()
  }, [id])

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

  const detail = course.detail || {}
  const highlights = Array.isArray(detail.highlights) ? detail.highlights : []
  const careers = Array.isArray(course.careers) ? course.careers : []
  const faculty = Array.isArray(detail.faculty) ? detail.faculty : []
  const documents = Array.isArray(detail.documents) ? detail.documents : []
  const infoList = Array.isArray(detail.important_info) ? detail.important_info : []
  const qualifications = Array.isArray(detail.qualifications) ? detail.qualifications : []

  const hasDetailsContent = hasText(detail.about) || qualifications.length > 0 || highlights.length > 0 || careers.length > 0

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
            <div className="lg:sticky lg:top-6">{ImportantInfoBox}</div>
          </aside>

          {/* Main content */}
          <div className="order-2 min-w-0 lg:order-1 lg:col-span-7">

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="-mb-px flex gap-1 overflow-x-auto">
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

                    {qualifications.length > 0 && (
                      <SectionCard icon={UserCheck} title="คุณสมบัติผู้สมัคร" bare>
                        <div className="max-w-2xl space-y-2">
                          {qualifications.map((item, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm text-gray-700 lg:text-base">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-pnru" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
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
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {faculty.map((teacher, index) => {
                        const nameTh = firstText(teacher.nameTh, teacher.name)
                        const positionTh = firstText(teacher.positionTh, teacher.expertise)
                        return (
                          <div
                            key={index}
                            className="flex h-full flex-col items-center rounded-[20px] border border-pnru/20 bg-cream p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
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

                            <h3 className="text-base font-bold leading-snug text-gray-900">{nameTh}</h3>

                            {hasText(teacher.nameEn) && (
                              <p className="mt-1 text-sm italic text-gray-500">{teacher.nameEn}</p>
                            )}

                            {hasText(positionTh) && positionTh !== 'ไม่ระบุ' && (
                              <p className="mt-3 text-sm font-bold text-pnru">{positionTh}</p>
                            )}

                            {hasText(teacher.positionEn) && (
                              <p className="mt-0.5 text-xs italic text-pnru">{teacher.positionEn}</p>
                            )}

                            {hasText(teacher.email) && (
                              <p className="mt-3 text-xs font-bold text-pnru">{teacher.email}</p>
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
