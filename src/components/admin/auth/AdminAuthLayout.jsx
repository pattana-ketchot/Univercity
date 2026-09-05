// เลย์เอาต์กลางจอสำหรับหน้า Login / Register ของผู้ดูแลระบบ
// พื้นหลังสีขาว/เทาอ่อน — การ์ดอยู่กึ่งกลางจอเสมอ
const AdminAuthLayout = ({ children }) => (
  <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center p-4 py-10">
    <div className="w-full flex flex-col items-center">
      {children}
      <p className="mt-6 text-xs text-gray-400 text-center">
        © {new Date().getFullYear()} คณะวิทยาศาสตร์และเทคโนโลยี · ระบบสำหรับผู้ดูแลระบบ
      </p>
    </div>
  </div>
)

export default AdminAuthLayout
