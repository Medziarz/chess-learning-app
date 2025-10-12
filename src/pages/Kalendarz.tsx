import { useState } from 'react'

export function Kalendarz() {
  const [selectedCity, setSelectedCity] = useState('')

  return (
    <div className="tab-content">
      <h2>📅 Kalendarz turniejów</h2>
      
      <div className="tournament-calendar">
        {/* Panel wyszukiwania turniejów */}
        <div className="tournament-panel">
          <h3>🔍 Znajdź turnieje w swoim mieście</h3>
          <div className="panel-content">
            <div className="city-search">
              <label htmlFor="city-select">Wybierz miasto:</label>
              <select 
                id="city-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="city-selector"
              >
                <option value="">-- Wybierz miasto --</option>
                <option value="Warszawa">Warszawa</option>
                <option value="Kraków">Kraków</option>
                <option value="Wrocław">Wrocław</option>
                <option value="Gdańsk">Gdańsk</option>
                <option value="Poznań">Poznań</option>
                <option value="Łódź">Łódź</option>
                <option value="Katowice">Katowice</option>
                <option value="Lublin">Lublin</option>
                <option value="Szczecin">Szczecin</option>
                <option value="Bydgoszcz">Bydgoszcz</option>
              </select>
            </div>
            
            <div className="tournament-links">
              <h4>🌐 Oficjalne strony z turniejami:</h4>
              <div className="links-container">
                <a 
                  href={selectedCity ? 
                    `https://www.chessmanager.com/pl-pl/tournaments/upcoming?city=${encodeURIComponent(selectedCity)}` : 
                    'https://www.chessmanager.com/pl-pl/tournaments/upcoming'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tournament-link chessmanager"
                >
                  🏆 ChessManager - {selectedCity || 'Wszystkie miasta'}
                  <span className="link-description">Turnieje klasyczne i rapid</span>
                </a>
                
                <a 
                  href="https://chessarbiter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tournament-link chessarbiter"
                >
                  ⚡ ChessArbiter - Wszystkie turnieje
                  <span className="link-description">Organizacja i zarządzanie turniejami</span>
                </a>
              </div>
            </div>
            
            <div className="info-note">
              💡 <strong>Wskazówka:</strong> Wybierz swoje miasto z listy, aby zobaczyć dedykowane linki do turniejów w ChessManager!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}