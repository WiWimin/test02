import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import SitterLayout from '../components/sitter/SitterLayout'
import OwnerLayout from '../components/owner/OwnerLayout'

const HomePage = React.lazy(() => import('../pages/Home'))
const ServiceDetail = React.lazy(() => import('../pages/ServiceDetail'))
const NewBooking = React.lazy(() => import('../pages/Booking'))
const OrderList = React.lazy(() => import('../pages/Orders'))
const AuthPage = React.lazy(() => import('../pages/Auth'))
const Chat = React.lazy(() => import('../pages/Chat'))
const AdminDashboard = React.lazy(() => import('../pages/Admin/Dashboard'))
const GuaranteePage = React.lazy(() => import('../pages/Guarantee'))
const SitterApplication = React.lazy(() => import('../components/sitter/SitterApplication'))
const Dashboard = React.lazy(() => import('../components/sitter/Dashboard'))
const SitterOrders = React.lazy(() => import('../components/sitter/SitterOrders'))
const SitterOrderDetail = React.lazy(() => import('../components/sitter/SitterOrderDetail'))
const MyServices = React.lazy(() => import('../components/sitter/MyServices'))
const Wallet = React.lazy(() => import('../components/sitter/Wallet'))
const Schedule = React.lazy(() => import('../components/sitter/Schedule'))
const Profile = React.lazy(() => import('../components/sitter/Profile'))
const Settings = React.lazy(() => import('../components/sitter/Settings'))
const OwnerHome = React.lazy(() => import('../components/owner/OwnerHome'))
const OwnerOrders = React.lazy(() => import('../components/owner/OwnerOrders'))
const OwnerPets = React.lazy(() => import('../components/owner/OwnerPets'))
const OwnerFavorites = React.lazy(() => import('../components/owner/OwnerFavorites'))
const OwnerProfile = React.lazy(() => import('../components/owner/OwnerProfile'))
const OwnerMarket = React.lazy(() => import('../components/owner/OwnerMarket'))
const OwnerOrderDetail = React.lazy(() => import('../components/owner/OwnerOrderDetail'))
const OwnerAddresses = React.lazy(() => import('../components/owner/OwnerAddresses'))
const RoleSelect = React.lazy(() => import('../pages/Auth/components/RoleSelect'))
const ForgotPassword = React.lazy(() => import('../pages/Auth/ForgotPassword'))

function Loading() {
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', color: '#666', fontSize: '16px'
    }}>
      加载中...
    </div>
  )
}

export default function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/booking/new" element={<ProtectedRoute><NewBooking /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute roles={['owner']}><OrderList /></ProtectedRoute>} />
        <Route path="/login" element={<RoleSelect mode="login" />} />
        <Route path="/register" element={<RoleSelect mode="register" />} />
        <Route path="/auth" element={<AuthPage mode="login" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
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
  )
}
