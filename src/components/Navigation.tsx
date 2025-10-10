import { Link, useLocation } from 'react-router-dom'

interface NavItem {
  path: string
  name: string
  icon: string
}

export function Navigation() {
  const location = useLocation()
  
  const navItems: NavItem[] = [
    { path: '/rozgrywka', name: 'Rozgrywka', icon: '♟️' },
    { path: '/kalendarz', name: 'Kalendarz', icon: '📅' },
    { path: '/profil', name: 'Profil', icon: '👤' },
    { path: '/analiza', name: 'Analiza', icon: '🔍' },
    { path: '/treningi', name: 'Treningi', icon: '💪' },
    { path: '/aktualnosci', name: 'Aktualności', icon: '📰' }
  ]

  return (
    <nav className="main-navigation">
      {navItems.map(item => (
        <Link 
          key={item.path}
          to={item.path}
          className={`nav-tab ${location.pathname === item.path ? 'active' : ''}`}
        >
          <span className="tab-icon">{item.icon}</span>
          <span className="tab-name">{item.name}</span>
        </Link>
      ))}
    </nav>
  )
}