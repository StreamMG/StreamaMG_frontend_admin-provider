// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Catalogue from './pages/Catalogue'
import ContentDetail from './pages/ContentDetail'
import History from './pages/History'
import Tutorials from './pages/Tutorials'
import Payments from './pages/Payments'
import ProviderDashboard from './pages/ProviderDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AccessGateModal from './components/AccessGateModal'
import { useAuthStore } from './stores/authStore'

function PrivateRoute({ children, role }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (role === 'admin' && user.role !== 'admin') return <Navigate to="/" replace />
  if (role === 'provider' && !['provider', 'admin'].includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <>
      <AccessGateModal />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalogue" element={<Catalogue />} />
          <Route path="content/:id" element={<ContentDetail />} />
          <Route path="history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="tutorials" element={<Tutorials />} />
          <Route path="payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
          <Route path="provider" element={<PrivateRoute role="provider"><ProviderDashboard /></PrivateRoute>} />
          <Route path="admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
        </Route>
      </Routes>
    </>
  )
}
