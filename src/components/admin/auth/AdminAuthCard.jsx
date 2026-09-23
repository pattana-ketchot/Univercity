import { ShieldCheck } from 'lucide-react'

// การ์ด auth: โลโก้มหาวิทยาลัย + ป้าย "Admin Portal" + หัวข้อ + subtitle + เนื้อหา (ฟอร์ม) + ส่วนท้าย
// กว้าง ~400px, responsive: calc(100% - 32px), มุมโค้ง 18px, เส้นขอบบาง + เงานุ่ม
const AdminAuthCard = ({ title, subtitle, children, footer }) => (
  <div
    className="bg-white border border-gray-200/80 rounded-[18px] shadow-[0_4px_24px_-8px_rgba(1,106,43,0.12),0_2px_8px_rgba(0,0,0,0.04)] p-5 sm:p-8"
    style={{ width: 'min(400px, calc(100% - 32px))' }}
  >
    <div className="flex flex-col items-center text-center">
      <img
        src="/assets/logo.png"
        alt="โลโก้มหาวิทยาลัย"
        className="h-16 w-auto object-contain"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.nextElementSibling.style.display = 'flex'
        }}
      />
      <div className="w-16 h-16 rounded-full bg-pnru hidden items-center justify-center">
        <span className="text-white font-bold">LOGO</span>
      </div>

      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase bg-[#E8F5F1] text-pnru px-2.5 py-1 rounded-full">
        <ShieldCheck className="w-3.5 h-3.5" />
        Administration System
      </span>

      <h1 className="mt-3 text-xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>

    <div className="mt-6">{children}</div>

    {footer && <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>}
  </div>
)

export default AdminAuthCard
