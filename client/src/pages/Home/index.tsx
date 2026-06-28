import Header from '../../components/Header'
import HeroSection from '../../components/HeroSection'
import ServiceCategories from '../../components/ServiceCategories'
import PopularSitters from '../../components/PopularSitters'
import Guarantees from '../../components/Guarantees'
import Testimonials from '../../components/Testimonials'
import RegisterPrompt from '../../components/RegisterPrompt'
import Footer from '../../components/Footer'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ServiceCategories />
        <PopularSitters />
        <Guarantees />
        <Testimonials />
        <RegisterPrompt />
      </main>
      <Footer />
    </>
  )
}
