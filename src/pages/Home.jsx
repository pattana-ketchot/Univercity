import Hero from '../components/Hero'
import StatsPanel from '../components/StatsPanel'
import CourseCarousel from '../components/CourseCarousel'
import Banner from '../components/Banner'
import AboutSection from '../components/AboutSection'

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <StatsPanel />
      <CourseCarousel />
      <Banner />
      <AboutSection />
    </div>
  )
}

export default Home
