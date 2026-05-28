import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import ServiceCategories from './components/ServiceCategories'
import PopularSitters from './components/PopularSitters'
import Guarantees from './components/Guarantees'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import ServiceDetail from './components/ServiceDetail'
import NewBooking from './components/NewBooking'
import OrderList from './components/OrderList'
import AuthPage from './components/AuthPage'
import SitterDashboard from './components/SitterDashboard'
import Chat from './components/Chat'
import AdminDashboard from './components/AdminDashboard'
import GuaranteePage from './components/GuaranteePage'

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ServiceCategories />
        <PopularSitters />
        <Guarantees />
        <Testimonials />
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/booking/new" element={<NewBooking />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/sitter/dashboard" element={<SitterDashboard />} />
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/guarantee/:id" element={<GuaranteePage />} />
      </Routes>
    </div>
  )
}

export default App
