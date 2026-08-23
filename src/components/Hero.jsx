import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section className="hero-section relative bg-white overflow-visible pb-16" style={{height: '600px'}}>
      {/* Background Layer - Cream Color */}
      <div className="hero-background absolute inset-0 bg-cream"></div>

      {/* Image Layer - Right Side with Organic Curve */}
      <div
        className="hero-image-wrapper absolute right-0 top-0 h-full"
        style={{
          width: '70%',
          clipPath: 'path("M 186 2 Q -25 116 137 313 Q 240 422 0 600 L 1920 600 L 1920 0 Z")'
        }}
      >
        <img
          src="/assets/hero-building.jpg"
          alt="University Campus"
          className="hero-image w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "data:image/svg+xml,%3Csvg width='1200' height='600' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1200' height='600' fill='%23C5D3E8'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%235A7BA6' font-size='24' font-family='Arial'%3Eวางภาพอาคารมหาวิทยาลัย%3C/text%3E%3C/svg%3E"
          }}
        />
      </div>

      {/* Content Layer - Text and Buttons */}
      <div className="hero-content relative mx-auto px-12 pt-20 max-w-[1920px]">
        <div className="hero-content-inner max-w-2xl">
          {/* Subtitle */}
          <p className="hero-subtitle text-primary font-medium text-xl mb-6">
            Phranakhon Rajabhat University
          </p>

          {/* Main Heading */}
          <div className="hero-heading mb-6">
            <h1 className="text-6xl font-bold text-pnru leading-tight mb-2">
              ค้นหาสาขาที่ใช่
            </h1>
            <h1 className="text-6xl font-bold text-black leading-tight">
              ในคณะวิทย์ PNRU
            </h1>
          </div>

          {/* Description */}
          <p className="hero-description text-gray-600 text-xl mb-10 leading-relaxed">
            ตอบแบบสอบถามสั้น ๆ เพื่อค้นหาสาขาที่เหมาะกับความถนัด<br />
            และความสนใจของคุณ
          </p>

          {/* CTA Buttons */}
          <div className="hero-buttons flex space-x-4">
            <Link
              to="/find-major"
              className="hero-button-pnru bg-pnru text-white px-10 py-4 rounded-lg font-medium text-lg hover:bg-opacity-90 transition inline-block text-center"
            >
              ค้นหาสาขาที่เหมาะกับฉัน
            </Link>
            <Link
              to="/chat"
              className="hero-button-secondary bg-white text-pnru border-2 border-pnru px-10 py-4 rounded-lg font-medium text-lg hover:bg-gray-50 transition inline-block text-center"
            >
              ถาม Sci Advisor
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
