import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'

export function Ustawienia() {
  const { theme, setTheme } = useTheme()
  const [autoPromotion, setAutoPromotion] = useState('queen')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [showCoordinates, setShowCoordinates] = useState(true)
  const [highlightMoves, setHighlightMoves] = useState(true)

  // Load settings from localStorage
  useEffect(() => {
    const savedAutoPromotion = localStorage.getItem('chess-auto-promotion')
    const savedSound = localStorage.getItem('chess-sound-enabled')
    const savedAnimations = localStorage.getItem('chess-animations-enabled')
    const savedCoordinates = localStorage.getItem('chess-show-coordinates')
    const savedHighlights = localStorage.getItem('chess-highlight-moves')

    if (savedAutoPromotion) setAutoPromotion(savedAutoPromotion)
    if (savedSound !== null) setSoundEnabled(savedSound === 'true')
    if (savedAnimations !== null) setAnimationsEnabled(savedAnimations === 'true')
    if (savedCoordinates !== null) setShowCoordinates(savedCoordinates === 'true')
    if (savedHighlights !== null) setHighlightMoves(savedHighlights === 'true')
  }, [])

  const handleAutoPromotionChange = (value: string) => {
    setAutoPromotion(value)
    localStorage.setItem('chess-auto-promotion', value)
  }

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled)
    localStorage.setItem('chess-sound-enabled', enabled.toString())
  }

  const handleAnimationsToggle = (enabled: boolean) => {
    setAnimationsEnabled(enabled)
    localStorage.setItem('chess-animations-enabled', enabled.toString())
  }

  const handleCoordinatesToggle = (enabled: boolean) => {
    setShowCoordinates(enabled)
    localStorage.setItem('chess-show-coordinates', enabled.toString())
  }

  const handleHighlightToggle = (enabled: boolean) => {
    setHighlightMoves(enabled)
    localStorage.setItem('chess-highlight-moves', enabled.toString())
  }

  const resetSettings = () => {
    if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia do domyślnych?')) {
      setTheme('light')
      setAutoPromotion('queen')
      setSoundEnabled(true)
      setAnimationsEnabled(true)
      setShowCoordinates(true)
      setHighlightMoves(true)
      
      // Clear localStorage (theme will be handled by ThemeContext)
      localStorage.removeItem('chess-auto-promotion')
      localStorage.removeItem('chess-sound-enabled')
      localStorage.removeItem('chess-animations-enabled')
      localStorage.removeItem('chess-show-coordinates')
      localStorage.removeItem('chess-highlight-moves')
    }
  }

  const exportSettings = () => {
    const settings = {
      theme,
      autoPromotion,
      soundEnabled,
      animationsEnabled,
      showCoordinates,
      highlightMoves,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chess-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string)
        
        if (settings.theme) setTheme(settings.theme)
        if (settings.autoPromotion) setAutoPromotion(settings.autoPromotion)
        if (settings.soundEnabled !== undefined) setSoundEnabled(settings.soundEnabled)
        if (settings.animationsEnabled !== undefined) setAnimationsEnabled(settings.animationsEnabled)
        if (settings.showCoordinates !== undefined) setShowCoordinates(settings.showCoordinates)
        if (settings.highlightMoves !== undefined) setHighlightMoves(settings.highlightMoves)
        
        alert('Ustawienia zostały zaimportowane!')
      } catch (error) {
        alert('Błąd podczas importowania ustawień!')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="tab-content">
      <h2>⚙️ Ustawienia</h2>
      
      <div className="settings-container">
        {/* Panel wyglądu */}
        <div className="settings-panel">
          <h3>🎨 Wygląd aplikacji</h3>
          <div className="panel-content">
            <div className="setting-item">
              <label>Motyw aplikacji:</label>
              <div className="theme-selector">
                <button 
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  ☀️ Jasny
                </button>
                <button 
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  🌙 Ciemny
                </button>
              </div>
            </div>

            <div className="setting-item">
              <label>Animacje:</label>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="animations"
                  checked={animationsEnabled}
                  onChange={(e) => handleAnimationsToggle(e.target.checked)}
                />
                <label htmlFor="animations" className="switch-label">
                  {animationsEnabled ? 'Włączone' : 'Wyłączone'}
                </label>
              </div>
            </div>

            <div className="setting-item">
              <label>Pokaż współrzędne szachownicy:</label>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="coordinates"
                  checked={showCoordinates}
                  onChange={(e) => handleCoordinatesToggle(e.target.checked)}
                />
                <label htmlFor="coordinates" className="switch-label">
                  {showCoordinates ? 'Tak' : 'Nie'}
                </label>
              </div>
            </div>

            <div className="setting-item">
              <label>Podświetl możliwe ruchy:</label>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="highlights"
                  checked={highlightMoves}
                  onChange={(e) => handleHighlightToggle(e.target.checked)}
                />
                <label htmlFor="highlights" className="switch-label">
                  {highlightMoves ? 'Tak' : 'Nie'}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Panel rozgrywki */}
        <div className="settings-panel">
          <h3>♟️ Ustawienia rozgrywki</h3>
          <div className="panel-content">
            <div className="setting-item">
              <label>Automatyczne promowanie pionka:</label>
              <select 
                className="setting-select"
                value={autoPromotion}
                onChange={(e) => handleAutoPromotionChange(e.target.value)}
              >
                <option value="queen">🤴 Hetman (zawsze)</option>
                <option value="ask">❓ Pytaj za każdym razem</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Dźwięki:</label>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="sounds"
                  checked={soundEnabled}
                  onChange={(e) => handleSoundToggle(e.target.checked)}
                />
                <label htmlFor="sounds" className="switch-label">
                  {soundEnabled ? '🔊 Włączone' : '🔇 Wyłączone'}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Panel analizy */}
        <div className="settings-panel">
          <h3>🔍 Ustawienia analizy</h3>
          <div className="panel-content">
            <div className="setting-item">
              <label>Głębokość analizy:</label>
              <select className="setting-select">
                <option value="15">15 półruchów (szybka)</option>
                <option value="20">20 półruchów (domyślna)</option>
                <option value="25">25 półruchów (dokładna)</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Auto-analiza podczas gry:</label>
              <div className="toggle-switch">
                <input type="checkbox" id="auto-analysis" defaultChecked />
                <label htmlFor="auto-analysis" className="switch-label">Tak</label>
              </div>
            </div>
          </div>
        </div>

        {/* Panel o aplikacji */}
        <div className="settings-panel">
          <h3>ℹ️ O aplikacji</h3>
          <div className="panel-content">
            <div className="app-info">
              <p><strong>Chess Learning App</strong></p>
              <p>Wersja: 2.0.0</p>
              <p>Ostatnia aktualizacja: 10.10.2024</p>
              <p>Wykorzystuje: React, TypeScript, Chess.js, React-Chessboard</p>
              <p>Analiza: Lichess API, Stockfish Engine</p>
            </div>
          </div>
        </div>

        {/* Panel zarządzania danymi */}
        <div className="settings-panel">
          <h3>💾 Zarządzanie danymi</h3>
          <div className="panel-content">
            <div className="data-management">
              <button onClick={exportSettings} className="data-btn export-btn">
                📤 Eksportuj ustawienia
              </button>
              
              <label className="data-btn import-btn">
                📥 Importuj ustawienia
                <input 
                  type="file" 
                  accept=".json"
                  onChange={importSettings}
                  style={{ display: 'none' }}
                />
              </label>
              
              <button onClick={resetSettings} className="data-btn reset-btn">
                🔄 Resetuj do domyślnych
              </button>
            </div>
          </div>
        </div>

        {/* Panel podsumowania */}
        <div className="settings-panel">
          <h3>📋 Podsumowanie ustawień</h3>
          <div className="panel-content">
            <div className="settings-summary">
              <div className="summary-item">
                <span className="setting-name">Motyw:</span>
                <span className="setting-value">{theme === 'light' ? '☀️ Jasny' : '🌙 Ciemny'}</span>
              </div>
              <div className="summary-item">
                <span className="setting-name">Promocja pionka:</span>
                <span className="setting-value">
                  {autoPromotion === 'queen' ? '🤴 Automatyczna' : '❓ Pytaj'}
                </span>
              </div>
              <div className="summary-item">
                <span className="setting-name">Dźwięki:</span>
                <span className="setting-value">{soundEnabled ? '🔊 Tak' : '🔇 Nie'}</span>
              </div>
              <div className="summary-item">
                <span className="setting-name">Animacje:</span>
                <span className="setting-value">{animationsEnabled ? '✨ Tak' : '❌ Nie'}</span>
              </div>
              <div className="summary-item">
                <span className="setting-name">Współrzędne:</span>
                <span className="setting-value">{showCoordinates ? '📍 Tak' : '❌ Nie'}</span>
              </div>
              <div className="summary-item">
                <span className="setting-name">Podświetlenia:</span>
                <span className="setting-value">{highlightMoves ? '🟡 Tak' : '❌ Nie'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}