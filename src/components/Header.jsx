import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // เปิดเมนูมือถืออยู่ ห้ามให้หน้าข้างหลังเลื่อนตาม ไม่งั้นปัดแล้วหลุดไปโดนเนื้อหาข้างหลัง
  useEffect(() => {
    document.body.classList.toggle('nav-open', mobileMenuOpen)
    return () => document.body.classList.remove('nav-open')
  }, [mobileMenuOpen])

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleAboutClick = (e) => {
    e.preventDefault()
    setMobileMenuOpen(false)

    // ถ้าอยู่หน้าแรกอยู่แล้ว scroll ลงไปเลย
    if (location.pathname === '/') {
      scrollToAbout()
    } else {
      // ถ้าอยู่หน้าอื่น ไปหน้าแรกก่อน แล้วค่อย scroll
      navigate('/')
      // Sections above #about (เช่น SCI Connect) โหลดข่าวแบบ async แล้วขยายความสูง
      // ทีหลัง เลย scroll ซ้ำสัก 2 วิ ให้ตำแหน่งอัปเดตตามจนกว่า layout จะนิ่ง
      let attempts = 0
      const interval = setInterval(() => {
        scrollToAbout()
        attempts += 1
        if (attempts >= 10) clearInterval(interval)
      }, 200)
    }
  }

  const navItems = [
    { path: '/', label: 'หน้าแรก' },
    { path: '/find-major', label: 'ค้นหาสาขาที่เหมาะกับฉัน' },
    { path: '/courses', label: 'หลักสูตรทั้งหมด' },
    { path: '/compare', label: 'เปรียบเทียบสาขา' },
    { path: '/chat', label: 'แชทกับ Sci Advisor' },
    { path: '/#about', label: 'เกี่ยวกับเรา' }
  ]

  return (
    <header className="bg-white shadow-sm w-full overflow-visible relative z-10">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 h-20 flex items-center relative overflow-visible">
        {/* Logo and University Name */}
        <Link to="/" className="flex items-center gap-1.5 xl:gap-2 flex-shrink-0">
          {/* Logo */}
          <div className="flex items-center -mb-6 sm:-mb-7 md:-mb-9 lg:-mb-11 xl:-mb-11 2xl:-mb-16">
            <img
              src="/assets/logo.png"
              alt="University Logo"
              className="h-14 sm:h-16 md:h-20 lg:h-24 xl:h-24 2xl:h-36 w-auto"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 2xl:w-32 2xl:h-32 bg-primary rounded-full hidden items-center justify-center">
              <span className="text-white font-bold text-xl">LOGO</span>
            </div>
          </div>

          {/* University Name - Stay in Header */}
          <div className="flex flex-col mt-2 min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-pnru leading-tight truncate">STPNRU</h1>
            <p className="text-xs sm:text-sm text-gray-600 truncate">คณะวิทยาศาสตร์และเทคโนโลยี</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden xl:flex flex-1 items-center justify-center gap-x-4 2xl:gap-x-8 px-4 text-sm 2xl:text-base">
          {navItems.slice(0, -1).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-medium relative pb-1 whitespace-nowrap ${
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
            className="font-medium relative pb-1 whitespace-nowrap text-gray-600 hover:text-gray-800"
          >
            เกี่ยวกับเรา
          </a>
        </nav>

        {/* Apply Now Button */}
        <Link
          to="https://admission.pnru.ac.th/info/announce"
          className="hidden xl:inline-block ml-auto font-medium border-2 border-green-800 bg-green-800 text-white rounded-full px-4 2xl:px-5 py-1.5 2xl:py-2 text-sm 2xl:text-base whitespace-nowrap hover:bg-green-900 hover:border-green-900 transition-colors"
        >
          สมัครเรียน
        </Link>

        {/* Hamburger — shows whenever the full nav doesn't (below xl, where it doesn't fit) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="xl:hidden ml-auto p-2.5 -mr-2.5 text-gray-700 hover:text-pnru transition-colors"
          aria-label={mobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown — slides down from under the header, same nav items + apply link as desktop */}
      <div
        className={`xl:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-4 flex flex-col gap-1 border-t border-gray-100">
          {navItems.slice(0, -1).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`font-medium py-2.5 px-2 rounded-lg ${
                location.pathname === item.path
                  ? 'text-gray-800 bg-gray-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="#about"
            onClick={handleAboutClick}
            className="font-medium py-2.5 px-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            เกี่ยวกับเรา
          </a>
          <Link
            to="https://admission.pnru.ac.th/info/announce"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-2 font-medium border-2 border-green-800 bg-green-800 text-white rounded-full px-5 py-2.5 text-center hover:bg-green-900 hover:border-green-900 transition-colors"
          >
            สมัครเรียน
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
