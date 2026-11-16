import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/Home'
import Settings from './pages/Settings'

function Private({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="center">Loading…</div>
  return session ? children : <Navigate to="/login" replace />
}

function Public({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="center">Loading…</div>
  return session ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Public><Login /></Public>} />
      <Route path="/register" element={<Public><Register /></Public>} />
      <Route path="/forgot" element={<Public><ForgotPassword /></Public>} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route element={<Private><Layout /></Private>}>
        <Route index element={<Home />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
