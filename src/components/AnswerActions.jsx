import { Link } from 'react-router-dom'
import { FileText, GraduationCap, Globe, Building2 } from 'lucide-react'
import { FACULTY_URL, resolveProgramme } from '../data/programmeLinks'

// ปุ่ม "ข้อมูลเพิ่มเติม" ใต้คำตอบ AI — พาไปดูเอกสารต้นฉบับและข้อมูลสาขาต่อ
//
// กติกาที่ห้ามหลุด
// ---------------
// แสดงเฉพาะปุ่มที่มีข้อมูลจริงเท่านั้น
//   - ปุ่มเอกสาร ขึ้นเมื่อหลังบ้านส่ง document id ที่ยืนยันแล้วมาเท่านั้น
//   - ปุ่มสาขาและเว็บไซต์สาขา ขึ้นเมื่อ resolve ชื่อหลักสูตรเป็นสาขาใน Supabase ได้เท่านั้น
//   - resolve ไม่ได้ = ไม่แสดง ไม่เดา ไม่เอาชื่อจากข้อความที่ AI ตอบมาใช้
// ถามเรื่องทั่วไปที่ไม่มีที่มา จะไม่มีปุ่มไหนขึ้นเลย และไม่แสดงกล่องนี้

const BASE =
  'inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors'

const AnswerActions = ({ source }) => {
  const documentId = source?.documentId || ''
  const page = source?.page
  const documentTitle = source?.title || ''
  const programme = resolveProgramme(source?.programme)

  // ไม่มีอะไรยืนยันได้เลยก็ไม่ต้องขึ้นกล่อง — เว็บไซต์คณะอย่างเดียวไม่คุ้มที่จะรบกวนสายตา
  if (!documentId && !programme) return null

  // เปิดที่หน้าที่อ้างถึงเลยถ้ารู้เลขหน้า ตัวอ่าน PDF ของเบราว์เซอร์รองรับ #page=
  const pdfUrl = documentId
    ? `/api/documents/${documentId}/pdf${page ? `#page=${page}` : ''}`
    : ''

  return (
    <div className="mt-3 border-t border-gray-200 pt-3">
      <p className="mb-2 text-xs font-semibold text-gray-500">ข้อมูลเพิ่มเติม</p>

      {/* มือถือเรียงลงมาทีละปุ่ม พอมีที่ค่อยแบ่งคอลัมน์ ปุ่มยืดเต็มช่องเพื่อให้ขอบตรงกัน */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BASE} border-pnru/30 bg-[#E8F5F1] text-pnru hover:bg-[#d9ece5]`}
          >
            <FileText className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {/* min-w-0 + break-words กันชื่อไฟล์ยาวดันกล่องจนจอเลื่อนซ้ายขวา */}
            <span className="min-w-0 break-words text-left">
              ดูเอกสารหลักสูตร
              {documentTitle && (
                <span className="block text-xs font-normal text-pnru/70">
                  {documentTitle}
                  {page ? ` · หน้า ${page}` : ''}
                </span>
              )}
            </span>
          </a>
        )}

        {programme && (
          <Link
            to={`/courses/${programme.courseId}`}
            className={`${BASE} border-gray-200 bg-white text-gray-700 hover:border-pnru hover:text-pnru`}
          >
            <GraduationCap className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words text-left">
              ดูรายละเอียดสาขา
              <span className="block text-xs font-normal text-gray-500">{programme.courseTitle}</span>
            </span>
          </Link>
        )}

        {programme && (
          <a
            href={programme.pnruUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BASE} border-gray-200 bg-white text-gray-700 hover:border-pnru hover:text-pnru`}
          >
            <Globe className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words text-left">เว็บไซต์สาขา PNRU</span>
          </a>
        )}

        <a
          href={FACULTY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${BASE} border-gray-200 bg-white text-gray-700 hover:border-pnru hover:text-pnru`}
        >
          <Building2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words text-left">เว็บไซต์คณะ</span>
        </a>
      </div>
    </div>
  )
}

export default AnswerActions
