import { useState } from 'react'

interface TrainingExercise {
  id: string
  title: string
  type: 'tactics' | 'endgame' | 'opening' | 'middlegame'
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  description: string
  completed: boolean
  rating?: number
}

interface TrainingStats {
  totalCompleted: number
  correctPercentage: number
  averageRating: number
  streakCurrent: number
  streakBest: number
}

export function Treningi() {
  const [activeCategory, setActiveCategory] = useState<'tactics' | 'endgame' | 'opening' | 'middlegame'>('tactics')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  
  const [exercises] = useState<TrainingExercise[]>([
    {
      id: '1',
      title: 'Mat w 2 ruchach #1',
      type: 'tactics',
      difficulty: 'easy',
      description: 'Znajdź mat w dwóch ruchach dla białych',
      completed: true,
      rating: 1200
    },
    {
      id: '2',
      title: 'Widelec królewski',
      type: 'tactics',
      difficulty: 'medium',
      description: 'Wykorzystaj widelec do wygrania materiału',
      completed: true,
      rating: 1450
    },
    {
      id: '3',
      title: 'Końcówka wieża + pionek',
      type: 'endgame',
      difficulty: 'medium',
      description: 'Technika Lucena - promocja pionka',
      completed: false,
      rating: 1600
    },
    {
      id: '4',
      title: 'Obrona Sycylijska - Wariant Najdorfa',
      type: 'opening',
      difficulty: 'hard',
      description: 'Poznaj podstawy wariantu Najdorfa',
      completed: false,
      rating: 1800
    },
    {
      id: '5',
      title: 'Atak na króla w środkowej grze',
      type: 'middlegame',
      difficulty: 'medium',
      description: 'Koordynacja figur w ataku',
      completed: true,
      rating: 1500
    },
    {
      id: '6',
      title: 'Mat w 3 ruchach #5',
      type: 'tactics',
      difficulty: 'hard',
      description: 'Złożona kombinacja taktyczna',
      completed: false,
      rating: 1750
    },
    {
      id: '7',
      title: 'Końcówka hetman vs pionki',
      type: 'endgame',
      difficulty: 'expert',
      description: 'Precyzja w końcówce hetmańskiej',
      completed: false,
      rating: 2000
    },
    {
      id: '8',
      title: 'Gambit królewski',
      type: 'opening',
      difficulty: 'medium',
      description: 'Agresywne otwarcie za białe',
      completed: true,
      rating: 1400
    }
  ])

  const [stats] = useState<TrainingStats>({
    totalCompleted: 4,
    correctPercentage: 87,
    averageRating: 1387,
    streakCurrent: 3,
    streakBest: 7
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tactics': return '⚡'
      case 'endgame': return '🏁'
      case 'opening': return '🎯'
      case 'middlegame': return '⚔️'
      default: return '📚'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'tactics': return 'Taktyka'
      case 'endgame': return 'Końcówki'
      case 'opening': return 'Otwarcia'
      case 'middlegame': return 'Środkowa gra'
      default: return 'Inne'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50'
      case 'medium': return '#FF9800'
      case 'hard': return '#F44336'
      case 'expert': return '#9C27B0'
      default: return '#666'
    }
  }

  const getDifficultyName = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Łatwy'
      case 'medium': return 'Średni'
      case 'hard': return 'Trudny'
      case 'expert': return 'Ekspert'
      default: return 'Nieznany'
    }
  }

  const filteredExercises = exercises.filter(exercise => {
    const categoryMatch = exercise.type === activeCategory
    const difficultyMatch = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter
    return categoryMatch && difficultyMatch
  })

  const startExercise = (exercise: TrainingExercise) => {
    alert(`Rozpoczynam ćwiczenie: ${exercise.title}\n\n${exercise.description}\n\nRating: ${exercise.rating || 'Brak'}`)
  }

  const getCategoryStats = (category: TrainingExercise['type']) => {
    const categoryExercises = exercises.filter(ex => ex.type === category)
    const completed = categoryExercises.filter(ex => ex.completed).length
    return {
      total: categoryExercises.length,
      completed,
      percentage: Math.round((completed / categoryExercises.length) * 100) || 0
    }
  }

  return (
    <div className="tab-content">
      <h2>💪 Treningi szachowe</h2>
      
      <div className="training-container">
        {/* Panel statystyk */}
        <div className="training-panel">
          <h3>📊 Twoje statystyki</h3>
          <div className="panel-content">
            <div className="stats-overview">
              <div className="stat-box">
                <div className="stat-number">{stats.totalCompleted}</div>
                <div className="stat-label">Ukończone</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{stats.correctPercentage}%</div>
                <div className="stat-label">Poprawność</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{stats.averageRating}</div>
                <div className="stat-label">Śr. rating</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{stats.streakCurrent}</div>
                <div className="stat-label">Seria</div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel kategorii treningowych */}
        <div className="training-panel">
          <h3>🎯 Kategorie treningowe</h3>
          <div className="panel-content">
            <div className="categories-grid">
              {(['tactics', 'endgame', 'opening', 'middlegame'] as const).map(category => {
                const categoryStats = getCategoryStats(category)
                return (
                  <div 
                    key={category}
                    className={`category-card ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category)}
                  >
                    <div className="category-icon">{getCategoryIcon(category)}</div>
                    <div className="category-name">{getCategoryName(category)}</div>
                    <div className="category-progress">
                      {categoryStats.completed}/{categoryStats.total} ({categoryStats.percentage}%)
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${categoryStats.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Filtry w tym samym panelu */}
            <div className="training-filters">
              <div className="filter-group">
                <label>Poziom trudności:</label>
                <select 
                  value={difficultyFilter} 
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                  <option value="all">Wszystkie</option>
                  <option value="easy">Łatwy</option>
                  <option value="medium">Średni</option>
                  <option value="hard">Trudny</option>
                  <option value="expert">Ekspert</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Panel ćwiczeń */}
        <div className="training-panel">
          <h3>
            {getCategoryIcon(activeCategory)} {getCategoryName(activeCategory)}
            <span className="exercise-count">({filteredExercises.length})</span>
          </h3>
          <div className="panel-content">
            {filteredExercises.length === 0 ? (
              <p className="no-exercises">Brak ćwiczeń dla wybranych filtrów</p>
            ) : (
              <div className="exercises-list">
                {filteredExercises.map(exercise => (
                  <div 
                    key={exercise.id}
                    className={`exercise-card ${exercise.completed ? 'completed' : ''}`}
                  >
                    <div className="exercise-header">
                      <h4>{exercise.title}</h4>
                      <div className="exercise-badges">
                        <span 
                          className="difficulty-badge"
                          style={{ backgroundColor: getDifficultyColor(exercise.difficulty) }}
                        >
                          {getDifficultyName(exercise.difficulty)}
                        </span>
                        {exercise.rating && (
                          <span className="rating-badge">
                            {exercise.rating}
                          </span>
                        )}
                        {exercise.completed && (
                          <span className="completed-badge">✅</span>
                        )}
                      </div>
                    </div>
                    
                    <p className="exercise-description">{exercise.description}</p>
                    
                    <div className="exercise-actions">
                      <button 
                        onClick={() => startExercise(exercise)}
                        className={exercise.completed ? 'retry-btn' : 'start-btn'}
                      >
                        {exercise.completed ? '🔄 Ponów' : '▶️ Rozpocznij'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel rekomendacji */}
        <div className="training-panel">
          <h3>💡 Rekomendacje</h3>
          <div className="panel-content">
            <div className="recommendations-list">
              <div className="recommendation-item">
                <strong>Codzienne zadania taktyczne:</strong>
                <p>Rozwiązuj 5-10 zadań dziennie aby utrzymać ostrość taktyczną</p>
              </div>
              <div className="recommendation-item">
                <strong>Studiuj końcówki:</strong>
                <p>Podstawowe końcówki są fundamentem dobrej gry</p>
              </div>
              <div className="recommendation-item">
                <strong>Analizuj swoje partie:</strong>
                <p>Każda przegrana partia to lekcja na przyszłość</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}