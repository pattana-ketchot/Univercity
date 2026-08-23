import { Link, useLocation, useNavigate } from 'react-router-dom'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleAboutClick = (e) => {
    e.preventDefault()

    // ถ้าอยู่หน้าแรกอยู่แล้ว scroll ลงไปเลย
    if (location.pathname === '/') {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      // ถ้าอยู่หน้าอื่น ไปหน้าแรกก่อน แล้วค่อย scroll
      navigate('/')
      setTimeout(() => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  const navItems = [
    { path: '/', label: 'หน้าแรก' },
    { path: '/find-major', label: 'ค้นหาสาขาที่เหมาะกับฉัน' },
    { path: '/courses', label: 'หลักสูตรทั้งหมด' },
    { path: '/compare', label: 'เปรียบเทียบสาขา' },
    { path: '/careers', label: 'อาชีพหลังจบ' },
    { path: '/chat', label: 'แชทกับ Sci Advisor' },
    { path: '/#about', label: 'เกี่ยวกับเรา' }
  ]

  return (
    <header className="bg-white shadow-sm w-full overflow-visible relative z-10">
      <div className="max-w-[1920px] mx-auto px-12 h-20 flex items-center justify-between overflow-visible">
        {/* Logo and University Name */}
        <Link to="/" className="flex items-center gap-2">
          {/* Logo */}
          <div className="flex items-center -mb-16">
            <img
              src="/assets/logo.png"
              alt="University Logo"
              className="h-36 w-auto"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div className="w-32 h-32 bg-primary rounded-full hidden items-center justify-center">
              <span className="text-white font-bold text-xl">LOGO</span>
            </div>
          </div>

          {/* University Name - Stay in Header */}
          <div className="flex flex-col mt-2">
            <h1 className="text-2xl font-bold text-pnru leading-tight">STPNRU</h1>
            <p className="text-sm text-gray-600">คณะวิทยาศาสตร์และเทคโนโลยี</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.slice(0, -1).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-medium relative pb-1 ${
                location.pathname === item.path
                  ? 'text-gray-800 border-b-2 border-pnru'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {/* About link using anchor */}
          <a
            href="#about"
            onClick={handleAboutClick}
            className="font-medium relative pb-1 text-gray-600 hover:text-gray-800"
          >
            เกี่ยวกับเรา
          </a>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/register"
            className="text-pnru font-medium hover:text-opacity-80 transition"
          >
            สมัครสมาชิก
          </Link>
          <Link
            to="/login"
            className="bg-pnru text-white px-6 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
