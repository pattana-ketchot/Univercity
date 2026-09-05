import Hero from '../components/Hero'
import HomeQuickLinks from '../components/HomeQuickLinks'
import CourseCarousel from '../components/CourseCarousel'
import SciConnectNews from '../components/SciConnectNews'
import AboutSection from '../components/AboutSection'

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <HomeQuickLinks />
      <CourseCarousel />
      <SciConnectNews />
      <AboutSection />
    </div>
  )
}

export default Home
