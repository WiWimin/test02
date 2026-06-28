import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

const Header = lazy(() => import('./components/Header'))
const HeroSection = lazy(() => import('./components/HeroSection'))
const ServiceCategories = lazy(() => import('./components/ServiceCategories'))
const PopularSitters = lazy(() => import('./components/PopularSitters'))
const Guarantees = lazy(() => import('./components/Guarantees'))
const Testimonials = lazy(() => import('./components/Testimonials'))
const Footer = lazy(() => import('./components/Footer'))
const ServiceDetail = lazy(() => import('./components/ServiceDetail'))
const NewBooking = lazy(() => import('./components/NewBooking'))
const OrderList = lazy(() => import('./components/OrderList'))
const AuthPage = lazy(() => import('./components/AuthPage'))
const Chat = lazy(() => import('./components/Chat'))
const AdminDashboard = lazy(() => import('./components/AdminDashboard'))
const GuaranteePage = lazy(() => import('./components/GuaranteePage'))
const SitterLayout = lazy(() => import('./components/sitter/SitterLayout'))
const SitterApplication = lazy(() => import('./components/sitter/SitterApplication'))
const Dashboard = lazy(() => import('./components/sitter/Dashboard'))
const SitterOrders = lazy(() => import('./components/sitter/SitterOrders'))
const SitterOrderDetail = lazy(() => import('./components/sitter/SitterOrderDetail'))
const MyServices = lazy(() => import('./components/sitter/MyServices'))
const Wallet = lazy(() => import('./components/sitter/Wallet'))
const Schedule = lazy(() => import('./components/sitter/Schedule'))
const Profile = lazy(() => import('./components/sitter/Profile'))
const Settings = lazy(() => import('./components/sitter/Settings'))
const OwnerLayout = lazy(() => import('./components/owner/OwnerLayout'))
const OwnerHome = lazy(() => import('./components/owner/OwnerHome'))
const OwnerOrders = lazy(() => import('./components/owner/OwnerOrders'))
const OwnerPets = lazy(() => import('./components/owner/OwnerPets'))
const OwnerFavorites = lazy(() => import('./components/owner/OwnerFavorites'))
const OwnerProfile = lazy(() => import('./components/owner/OwnerProfile'))
const OwnerMarket = lazy(() => import('./components/owner/OwnerMarket'))
const OwnerOrderDetail = lazy(() => import('./components/owner/OwnerOrderDetail'))
const OwnerAddresses = lazy(() => import('./components/owner/OwnerAddresses'))
const RoleSelect = lazy(() => import('./components/RoleSelect'))
const RegisterPrompt = lazy(() => import('./components/RegisterPrompt'))

function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const token = localStorage.getItem('petcare_token')
  if (!token) return <Navigate to="/login" replace />
  if (roles) {
    const cached = (() => { try { return JSON.parse(localStorage.getItem('petcare_user') || 'null') } catch { return null } })()
    if (!cached || !roles.includes(cached.role)) return <Navigate to="/" replace />
  }
  return children
}

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
      <Suspense fallback={<div className="loading">加载中...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/booking/new" element={<ProtectedRoute><NewBooking /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute roles={['owner']}><OrderList /></ProtectedRoute>} />
        <Route path="/login" element={<RoleSelect mode="login" />} />
        <Route path="/register" element={<RoleSelect mode="register" />} />
        <Route path="/auth" element={<AuthPage mode="login" />} />
        <Route path="/sitter/apply" element={<ProtectedRoute roles={['owner']}><SitterApplication /></ProtectedRoute>} />
        <Route path="/sitter" element={<ProtectedRoute roles={['sitter']}><SitterLayout /></ProtectedRoute>}>
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
        <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/guarantee/:id" element={<GuaranteePage />} />
        <Route path="/home/owner" element={<ProtectedRoute roles={['owner']}><OwnerLayout /></ProtectedRoute>}>
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
      </Suspense>
    </div>
  )
}

export default App
