import { useState, useEffect } from 'react'

interface PlayerStats {
  gamesPlayed: number
  wins: number
  draws: number
  losses: number
  rating: number
  ratingHistory: { date: string, rating: number }[]
  favoriteOpening: string
  averageGameTime: number
  longestWinStreak: number
  currentStreak: number
  tacticalRating: number
  puzzlesSolved: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedDate?: string
}

export function Profil() {
  const [playerName, setPlayerName] = useState('Gracz')
  const [isEditing, setIsEditing] = useState(false)
  const [stats] = useState<PlayerStats>({
    gamesPlayed: 127,
    wins: 68,
    draws: 23,
    losses: 36,
    rating: 1456,
    ratingHistory: [
      { date: '2024-09-01', rating: 1200 },
      { date: '2024-09-15', rating: 1284 },
      { date: '2024-10-01', rating: 1398 },
      { date: '2024-10-10', rating: 1456 }
    ],
    favoriteOpening: 'Obrona Sycylijska',
    averageGameTime: 12,
    longestWinStreak: 8,
    currentStreak: 3,
    tacticalRating: 1623,
    puzzlesSolved: 234
  })

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Pierwsze kroki',
      description: 'Rozegraj pierwszą partię',
      icon: '👶',
      unlocked: true,
      unlockedDate: '2024-09-01'
    },
    {
      id: '2',
      title: 'Taktyczny mistrz',
      description: 'Rozwiąż 100 zadań taktycznych',
      icon: '🧩',
      unlocked: true,
      unlockedDate: '2024-09-25'
    },
    {
      id: '3',
      title: 'Seria zwycięstw',
      description: 'Wygraj 5 partii z rzędu',
      icon: '🔥',
      unlocked: true,
      unlockedDate: '2024-10-02'
    },
    {
      id: '4',
      title: 'Analityk',
      description: 'Przeanalizuj 50 pozycji',
      icon: '🔍',
      unlocked: false
    },
    {
      id: '5',
      title: 'Maraton',
      description: 'Rozegraj 200 partii',
      icon: '🏃',
      unlocked: false
    },
    {
      id: '6',
      title: 'Mistrz końcówek',
      description: 'Wygraj 10 końcówek',
      icon: '👑',
      unlocked: false
    }
  ])

  useEffect(() => {
    const savedName = localStorage.getItem('chess-player-name')
    if (savedName) {
      setPlayerName(savedName)
    }
  }, [])

  const savePlayerName = () => {
    localStorage.setItem('chess-player-name', playerName)
    setIsEditing(false)
  }

  const getWinRate = () => {
    return Math.round((stats.wins / stats.gamesPlayed) * 100)
  }

  const getRatingTrend = () => {
    const history = stats.ratingHistory
    if (history.length < 2) return 'stable'
    
    const lastRating = history[history.length - 1].rating
    const prevRating = history[history.length - 2].rating
    
    if (lastRating > prevRating) return 'up'
    if (lastRating < prevRating) return 'down'
    return 'stable'
  }

  const getRatingTrendIcon = () => {
    const trend = getRatingTrend()
    switch (trend) {
      case 'up': return '📈'
      case 'down': return '📉'
      default: return '➡️'
    }
  }

  const exportStats = () => {
    const exportData = {
      playerName,
      stats,
      achievements: achievements.filter(a => a.unlocked),
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chess-profile-${playerName}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="tab-content">
      <h2>👤 Profil gracza</h2>
      
      <div className="profile-container">
        {/* Panel informacji o graczu */}
        <div className="profile-panel">
          <h3>🎮 Informacje o graczu</h3>
          <div className="panel-content">
            <div className="player-info">
              {isEditing ? (
                <div className="edit-name">
                  <input 
                    type="text" 
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && savePlayerName()}
                  />
                  <button onClick={savePlayerName}>✅</button>
                  <button onClick={() => setIsEditing(false)}>❌</button>
                </div>
              ) : (
                <div className="player-name">
                  <h3>{playerName}</h3>
                  <button onClick={() => setIsEditing(true)}>✏️</button>
                </div>
              )}
              
              <div className="current-rating">
                <span className="rating-label">Rating:</span>
                <span className="rating-value">{stats.rating}</span>
                <span className="rating-trend">{getRatingTrendIcon()}</span>
              </div>
            </div>
            
            <div className="profile-actions">
              <button onClick={exportStats} className="export-btn">
                📊 Eksportuj statystyki
              </button>
            </div>
          </div>
        </div>

        {/* Panel statystyk */}
        <div className="profile-panel">
          <h3>📊 Statystyki</h3>
          <div className="panel-content">
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Partie</h4>
                <div className="stat-main">{stats.gamesPlayed}</div>
                <div className="stat-breakdown">
                  <span className="wins">Wygrane: {stats.wins}</span>
                  <span className="draws">Remisy: {stats.draws}</span>
                  <span className="losses">Przegrane: {stats.losses}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <h4>Procent wygranych</h4>
                <div className="stat-main">{getWinRate()}%</div>
                <div className="win-rate-bar">
                  <div 
                    className="win-rate-fill" 
                    style={{ width: `${getWinRate()}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="stat-card">
                <h4>Taktyka</h4>
                <div className="stat-main">{stats.tacticalRating}</div>
                <div className="stat-breakdown">
                  <span>Zadań: {stats.puzzlesSolved}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <h4>Serie</h4>
                <div className="stat-main">{stats.currentStreak}</div>
                <div className="stat-breakdown">
                  <span>Rekord: {stats.longestWinStreak}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel historii ratingu */}
        <div className="profile-panel">
          <h3>📈 Historia ratingu</h3>
          <div className="panel-content">
            <div className="rating-chart">
              {stats.ratingHistory.map((point, index) => (
                <div key={index} className="rating-point">
                  <div className="rating-date">{point.date}</div>
                  <div className="rating-value">{point.rating}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel stylu gry */}
        <div className="profile-panel">
          <h3>♟️ Styl gry</h3>
          <div className="panel-content">
            <div className="style-stats">
              <div className="style-item">
                <span className="style-label">Ulubione otwarcie:</span>
                <span className="style-value">{stats.favoriteOpening}</span>
              </div>
              <div className="style-item">
                <span className="style-label">Średni czas partii:</span>
                <span className="style-value">{stats.averageGameTime} min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel osiągnięć */}
        <div className="profile-panel">
          <h3>🏆 Osiągnięcia ({achievements.filter(a => a.unlocked).length}/{achievements.length})</h3>
          <div className="panel-content">
            <div className="achievements-grid">
              {achievements.map(achievement => (
                <div 
                  key={achievement.id}
                  className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-info">
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                    {achievement.unlocked && achievement.unlockedDate && (
                      <small>Odblokowane: {achievement.unlockedDate}</small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}