import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Rozgrywka } from './pages/Rozgrywka'
import { Kalendarz } from './pages/Kalendarz'
import { Profil } from './pages/Profil'
import { Analiza } from './pages/Analiza'
import { Treningi } from './pages/Treningi'
import { Aktualnosci } from './pages/Aktualnosci'
import { Ustawienia } from './pages/Ustawienia'
import { TestLocal } from './pages/TestLocal'
import TestChessboardArrows from './pages/TestChessboardArrows'
import './App-simple.css'

function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="tab-navigation">
      <button 
        className={`tab-button ${isActive('/') || isActive('/rozgrywka') ? 'active' : ''}`}
        onClick={() => navigate('/rozgrywka')}
      >
        ♟️ Rozgrywka
      </button>
      <button 
        className={`tab-button ${isActive('/kalendarz') ? 'active' : ''}`}
        onClick={() => navigate('/kalendarz')}
      >
        📅 Kalendarz
      </button>
      <button 
        className={`tab-button ${isActive('/profil') ? 'active' : ''}`}
        onClick={() => navigate('/profil')}
      >
        👤 Profil
      </button>
      <button 
        className={`tab-button ${isActive('/analiza') ? 'active' : ''}`}
        onClick={() => navigate('/analiza')}
      >
        🔍 Analiza
      </button>
      <button 
        className={`tab-button ${isActive('/treningi') ? 'active' : ''}`}
        onClick={() => navigate('/treningi')}
      >
        💪 Treningi
      </button>
      <button 
        className={`tab-button ${isActive('/aktualnosci') ? 'active' : ''}`}
        onClick={() => navigate('/aktualnosci')}
      >
        📰 Aktualności
      </button>
      <button 
        className={`tab-button ${isActive('/ustawienia') ? 'active' : ''}`}
        onClick={() => navigate('/ustawienia')}
      >
        ⚙️ Ustawienia
      </button>
    </nav>
  )
}

function AppContent() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Chess Learning App</h1>
        <p>Aplikacja do nauki szachów</p>
      </header>

      <Navigation />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/rozgrywka" replace />} />
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
      
      <footer className="app-footer">
        <p>Wykorzystuje chess.js i react-chessboard</p>
      </footer>
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