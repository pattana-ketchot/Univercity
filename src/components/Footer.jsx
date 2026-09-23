import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleAboutClick = (e) => {
    e.preventDefault()

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

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* pb เยอะขึ้นบนมือถือ เผื่อที่ให้ปุ่มแชทลอยมุมขวาล่าง ไม่ให้ทับบรรทัดสุดท้ายตอนเลื่อนสุดหน้า */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-6 pb-24 sm:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 sm:gap-6">
          {/* About Section */}
          <div>
            <h3 className="text-white text-sm sm:text-base font-bold mb-2">เกี่ยวกับเรา</h3>
            <p className="text-xs mb-2">
              คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยราชภัฏพระนคร
            </p>
            <div className="flex items-center gap-2">
              <img
                src="/assets/logo.png"
                alt="STPNRU Logo"
                className="h-12 sm:h-14 md:h-16 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm sm:text-base font-bold mb-2">ลิงก์ด่วน</h3>
            <ul className="text-xs">
              <li>
                <Link to="/" className="inline-block py-3 hover:text-white transition">
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link to="/find-major" className="inline-block py-3 hover:text-white transition">
                  ค้นหาสาขาที่เหมาะกับฉัน
                </Link>
              </li>
              <li>
                <Link to="/courses" className="inline-block py-3 hover:text-white transition">
                  หลักสูตรทั้งหมด
                </Link>
              </li>
              <li>
                <Link to="/compare" className="inline-block py-3 hover:text-white transition">
                  เปรียบเทียบสาขา
                </Link>
              </li>
              <li>
                <Link to="/careers" className="inline-block py-3 hover:text-white transition">
                  อาชีพหลังจบ
                </Link>
              </li>
              <li>
                <a href="#about" onClick={handleAboutClick} className="inline-block py-3 hover:text-white transition">
                  เกี่ยวกับเรา
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-sm sm:text-base font-bold mb-2">ติดต่อเรา</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  เลขที่ 9 ถนนแจ้งวัฒนะ แขวงอนุสาวรีย์ เขตบางเขน จังหวัดกรุงเทพ 10220
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>02-544-8456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>saraban@pnru.ac.th</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-white text-sm sm:text-base font-bold mb-2">ติดตามเรา</h3>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/ScienceTechnologyPNRU"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pnru transition"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="mailto:sci@psru.ac.th"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pnru transition"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-4 pt-4 text-center text-xs">
          <p>
            &copy; {new Date().getFullYear()} คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยราชภัฏพระนคร
          </p>
          <p className="mt-1 text-gray-500">
            All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
