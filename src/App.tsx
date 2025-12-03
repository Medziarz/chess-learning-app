import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Rozgrywka } from './pages/Rozgrywka'
import { Kalendarz } from './pages/Kalendarz'
import { Profil } from './pages/Profil'
import { Analiza } from './pages/Analiza'
import { Treningi } from './pages/Treningi'
import { Aktualnosci } from './pages/Aktualnosci'
import { Ustawienia } from './pages/Ustawienia'
import { Register } from './pages/Register'
import { Login } from './pages/Login'
import { TestLocal } from './pages/TestLocal'
import TestChessboardArrows from './pages/TestChessboardArrows'
import './App-simple.css'

function Navigation() {
  const location = useLocation()
  
  const navigateTo = (path: string) => {
    window.location.href = path
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="nav">
      <button 
        className={`tab-button ${isActive('/') || isActive('/rozgrywka') ? 'active' : ''}`}
        onClick={() => navigateTo('/rozgrywka')}
      >
        ♟️ Rozgrywka
      </button>
      <button 
        className={`tab-button ${isActive('/kalendarz') ? 'active' : ''}`}
        onClick={() => navigateTo('/kalendarz')}
      >
        📅 Kalendarz
      </button>
      <button 
        className={`tab-button ${isActive('/profil') ? 'active' : ''}`}
        onClick={() => navigateTo('/profil')}
      >
        👤 Profil
      </button>
      <button 
        className={`tab-button ${isActive('/analiza') ? 'active' : ''}`}
        onClick={() => navigateTo('/analiza')}
      >
        🔍 Analiza
      </button>
      <button 
        className={`tab-button ${isActive('/treningi') ? 'active' : ''}`}
        onClick={() => navigateTo('/treningi')}
      >
        💪 Treningi
      </button>
      <button 
        className={`tab-button ${isActive('/aktualnosci') ? 'active' : ''}`}
        onClick={() => navigateTo('/aktualnosci')}
      >
        📰 Aktualności
      </button>
      <button 
        className={`tab-button ${isActive('/ustawienia') ? 'active' : ''}`}
        onClick={() => navigateTo('/ustawienia')}
      >
        ⚙️ Ustawienia
      </button>
      <button 
        className={`tab-button ${isActive('/register') ? 'active' : ''}`}
        onClick={() => navigateTo('/register')}
      >
        📝 Rejestracja
      </button>
      <button 
        className={`tab-button ${isActive('/login') ? 'active' : ''}`}
        onClick={() => navigateTo('/login')}
      >
        🔓 Logowanie
      </button>
    </nav>
  )
}

function AppContent() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/register' || location.pathname === '/login'

  return (
    <div className="app">
      {!isAuthPage && (
        <>
          <header className="app-header">
            <h1>Chess Learning App</h1>
            <p>Aplikacja do nauki szachów</p>
          </header>
          <Navigation />
        </>
      )}
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/rozgrywka" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/rozgrywka" element={<Rozgrywka />} />
          <Route path="/kalendarz" element={<Kalendarz />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/analiza" element={<Analiza />} />
          <Route path="/treningi" element={<Treningi />} />
          <Route path="/aktualnosci" element={<Aktualnosci />} />
          <Route path="/ustawienia" element={<Ustawienia />} />
          <Route path="/test-local" element={<TestLocal />} />
          <Route path="/test-arrows" element={<TestChessboardArrows />} />
        </Routes>
      </main>
      
      {!isAuthPage && (
        <footer className="app-footer">
          <p>Wykorzystuje chess.js i react-chessboard</p>
        </footer>
      )}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App