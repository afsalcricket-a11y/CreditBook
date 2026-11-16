import { NavLink, Outlet } from 'react-router-dom'
import { Home, Settings } from 'lucide-react'

// Part 3 and 4 will add: Customers, Credit, Payment, Reports to this list
const NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
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
