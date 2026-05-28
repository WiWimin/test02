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
import Chat from './components/Chat'
import AdminDashboard from './components/AdminDashboard'
import GuaranteePage from './components/GuaranteePage'
import SitterLayout from './components/sitter/SitterLayout'
import SitterApplication from './components/sitter/SitterApplication'
import Dashboard from './components/sitter/Dashboard'
import SitterOrders from './components/sitter/SitterOrders'
import SitterOrderDetail from './components/sitter/SitterOrderDetail'
import MyServices from './components/sitter/MyServices'
import Wallet from './components/sitter/Wallet'
import Schedule from './components/sitter/Schedule'
import Profile from './components/sitter/Profile'
import Settings from './components/sitter/Settings'
import OwnerLayout from './components/owner/OwnerLayout'
import OwnerHome from './components/owner/OwnerHome'
import OwnerOrders from './components/owner/OwnerOrders'
import OwnerPets from './components/owner/OwnerPets'
import OwnerFavorites from './components/owner/OwnerFavorites'
import OwnerProfile from './components/owner/OwnerProfile'
import OwnerMarket from './components/owner/OwnerMarket'
import OwnerOrderDetail from './components/owner/OwnerOrderDetail'
import OwnerAddresses from './components/owner/OwnerAddresses'
import RoleSelect from './components/RoleSelect'
import RegisterPrompt from './components/RegisterPrompt'

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
        <RegisterPrompt />
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
        <Route path="/login" element={<RoleSelect mode="login" />} />
        <Route path="/register" element={<RoleSelect mode="register" />} />
        <Route path="/auth" element={<AuthPage mode="login" />} />
        <Route path="/sitter/apply" element={<SitterApplication />} />
        <Route path="/sitter" element={<SitterLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<SitterOrders />} />
          <Route path="orders/:id" element={<SitterOrderDetail />} />
          <Route path="services" element={<MyServices />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/guarantee/:id" element={<GuaranteePage />} />
        <Route path="/home/owner" element={<OwnerLayout />}>
          <Route index element={<OwnerHome />} />
          <Route path="market" element={<OwnerMarket />} />
          <Route path="orders" element={<OwnerOrders />} />
          <Route path="orders/:id" element={<OwnerOrderDetail />} />
          <Route path="pets" element={<OwnerPets />} />
          <Route path="favorites" element={<OwnerFavorites />} />
          <Route path="profile" element={<OwnerProfile />} />
          <Route path="addresses" element={<OwnerAddresses />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
