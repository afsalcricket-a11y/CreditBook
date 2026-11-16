import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerForm from './pages/CustomerForm'
import CustomerDetail from './pages/CustomerDetail'
import Credit from './pages/Credit'
import Payment from './pages/Payment'
import Settings from './pages/Settings'
import './part3.css'

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
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/new" element={<CustomerForm />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="customers/:id/edit" element={<CustomerForm />} />
        <Route path="credit" element={<Credit />} />
        <Route path="payment" element={<Payment />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
