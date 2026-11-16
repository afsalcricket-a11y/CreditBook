import { NavLink, Outlet } from 'react-router-dom'
import { Home, Users, ArrowUpCircle, ArrowDownCircle, BarChart3, Settings } from 'lucide-react'

const NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/credit', label: 'Credit', icon: ArrowUpCircle },
  { to: '/payment', label: 'Payment', icon: ArrowDownCircle },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">CreditBook</header>
      <main className="content"><Outlet /></main>
      <nav className="bottom-nav">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
