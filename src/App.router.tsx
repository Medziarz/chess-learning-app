import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { Rozgrywka } from './pages/Rozgrywka'
import { Kalendarz } from './pages/Kalendarz'
import { Profil } from './pages/Profil'
import { Analiza } from './pages/Analiza'
import { Treningi } from './pages/Treningi'
import { Aktualnosci } from './pages/Aktualnosci'
import { Ustawienia } from './pages/Ustawienia'
import { useTheme } from './contexts/ThemeContext'
import './components/CloudOnlyAnalysis.css'
import './App.css'

function App() {
  const { theme } = useTheme()
  return (
    <Router>
      <div className={`app ${theme}`}>
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">
              <span className="chess-icon">♛</span>
              Chess Learning App
              <span className="chess-icon">♛</span>
            </h1>
            <p className="app-subtitle">Twoja szachowa podróż zaczyna się tutaj</p>
          </div>
        </header>

        <Navigation />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/rozgrywka" replace />} />
            <Route path="/rozgrywka" element={<Rozgrywka />} />
            <Route path="/kalendarz" element={<Kalendarz />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/analiza" element={<Analiza />} />
            <Route path="/treningi" element={<Treningi />} />
            <Route path="/aktualnosci" element={<Aktualnosci />} />
            <Route path="/ustawienia" element={<Ustawienia />} />
            {/* Cache demo route removed */}
            <Route path="*" element={<Navigate to="/rozgrywka" replace />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>Wykorzystuje chess.js, react-chessboard i chmurową analizę Lichess</p>
        </footer>
      </div>
    </Router>
  )
}

export default App