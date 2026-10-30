import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const Hero = () => {
  return (
    <section className="hero-section relative bg-white overflow-visible pb-10 sm:pb-12 md:pb-14 lg:pb-16 min-h-[480px] sm:min-h-[520px] md:min-h-[560px] lg:h-[600px]">
      {/* Background Layer - Cream Color */}
      <div className="hero-background absolute inset-0 bg-white"></div>

      {/* Image Layer - Right Side */}
      <div
        className="hero-image-wrapper hero-anim-image absolute right-0 top-0 h-full"
        style={{ width: '100%' }}
      >
        {/* Sharp base image — always fully visible underneath */}
        <img
          src="/assets/hero-building3.webp"
          alt="University Campus"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '50% 80%' }}
          onError={(e) => {
            e.target.src = "data:image/svg+xml,%3Csvg width='1200' height='600' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1200' height='600' fill='%23C5D3E8'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%235A7BA6' font-size='24' font-family='Arial'%3Eวางภาพอาคารมหาวิทยาลัย%3C/text%3E%3C/svg%3E"
          }}
        />

        {/* Blurred duplicate — only shows through where the mask is opaque (black),
            so you can control exactly which part of the image stays sharp:
            - filter blur(Npx): blur strength
            - maskImage stops: 0%-40% = fully blurred, 40%-65% = fades out, 65%-100% = fully sharp (mask fully transparent)
            - "to right" = blur fades left→right; use "to left" / "to bottom" / "to top" to blur a different side */}
        <img
          src="/assets/hero-building3.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition: '50% 80%',
            filter: 'blur(6px)',
            maskImage: 'linear-gradient(to right, black 0%, black 30%, transparent 65%)',
            WebkitMaskImage: 'linear-gradient(to right, black 0%, black 40%, transparent 65%)',
          }}
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
      </div>

      {/* Content Layer - Text and Buttons */}
      <div className="hero-content relative mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-10 sm:pt-12 md:pt-16 lg:pt-20 max-w-[1920px]">
        <div className="hero-content-inner max-w-2xl relative">
          <div className="relative p-4 sm:p-6 md:p-8 lg:p-10">
            {/* Subtitle */}
            <p className="hero-subtitle hero-anim-subtitle text-primary font-semibold uppercase tracking-[0.18em] text-[11px] sm:text-xs md:text-sm mb-3 sm:mb-4 lg:mb-5">
              Phranakhon Rajabhat University
            </p>

            {/* Main Heading */}
            <div className="hero-heading hero-anim-heading mb-4 sm:mb-5 lg:mb-6">
              <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-[3.25rem] font-semibold text-pnru mb-1">
                ค้นหาสาขาที่ใช่
              </h1>
              <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-[3.25rem] font-semibold text-black">
                ในคณะวิทย์ PNRU
              </h1>
            </div>

            {/* Description */}
            <p className="hero-description hero-anim-description text-gray-800 text-base md:text-lg mb-6 sm:mb-8 lg:mb-10 leading-relaxed">
              ตอบแบบสอบถามสั้น ๆ เพื่อค้นหาสาขาที่เหมาะกับความถนัด<br className="hidden md:inline" />
              และความสนใจของคุณ
            </p>

            {/* CTA Buttons */}
            <div className="hero-buttons hero-anim-buttons flex space-x-2 sm:space-x-3 lg:space-x-4">
              <Link
                to="/find-major"
                className="group hero-button-pnru inline-flex items-center justify-center gap-2 sm:gap-2.5 lg:gap-3 h-[44px] sm:h-[46px] lg:h-[50px] px-4 sm:px-5 lg:px-6 rounded-full bg-pnru text-white font-semibold text-sm sm:text-base lg:text-lg whitespace-nowrap shadow-[0_4px_12px_-4px_rgba(1,106,43,0.45)] hover:bg-[#015522]"
              >
                ค้นหาสาขาที่ใช่
                <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 text-white transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
