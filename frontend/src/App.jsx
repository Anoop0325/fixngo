import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import PrivateRoute from './routes/PrivateRoute'
import RoleRoute from './routes/RoleRoute'
import AppLayout from './components/layout/AppLayout'


import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserDashboard from './pages/UserDashboard'
import ProviderDashboard from './pages/ProviderDashboard'
import ProviderRequestsPage from './pages/ProviderRequestsPage'
import RequestTrackingPage from './pages/RequestTrackingPage'
import AdminDashboard from './pages/AdminDashboard'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import UserHistoryPage from './pages/UserHistoryPage'

export default function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          {}
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {}
          <Route path="dashboard" element={
            <RoleRoute roles={['user']}><UserDashboard /></RoleRoute>
          } />
          <Route path="history" element={
            <RoleRoute roles={['user']}><UserHistoryPage /></RoleRoute>
          } />
          
          {}
          <Route path="provider/dashboard" element={
            <RoleRoute roles={['provider']}><ProviderDashboard /></RoleRoute>
          } />
          <Route path="provider/requests" element={
            <RoleRoute roles={['provider']}><ProviderRequestsPage /></RoleRoute>
          } />
          
          {}
          <Route path="requests/:id" element={
            <PrivateRoute><RequestTrackingPage /></PrivateRoute>
          } />

          {}
          <Route path="notifications" element={
            <PrivateRoute><NotificationsPage /></PrivateRoute>
          } />
          
          {}
          <Route path="profile" element={
            <PrivateRoute><ProfilePage /></PrivateRoute>
          } />

          {}
          <Route path="admin" element={
            <RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute>
          } />
        </Route>
      </Routes>
    </>
  )
}
