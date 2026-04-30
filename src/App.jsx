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

// Protection : utilisateur connecté requis
function PrivateRoute({ children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Protection par rôle spécifique
function RoleRoute({ children, allowedRoles }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <>
      <AccessGateModal />
      <Routes>
        {/* Pages publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes avec layout */}
        <Route path="/" element={<Layout />}>
          {/* Accessibles à tous (connectés ou non) */}
          <Route index element={<Home />} />
          <Route path="catalogue" element={<Catalogue />} />
          <Route path="content/:id" element={<ContentDetail />} />
          <Route path="tutorials" element={<Tutorials />} />

          {/* Nécessite juste d'être connecté */}
          <Route path="history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="payments" element={<PrivateRoute><Payments /></PrivateRoute>} />

          {/* Provider : accessible à provider ET admin */}
          <Route 
            path="provider" 
            element={
              <RoleRoute allowedRoles={['provider', 'admin']}>
                <ProviderDashboard />
              </RoleRoute>
            } 
          />

          {/* Admin : accessible SEULEMENT à admin */}
          <Route 
            path="admin" 
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleRoute>
            } 
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}