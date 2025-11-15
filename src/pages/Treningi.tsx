import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Inicjalizacja Supabase — UŻYWAMY ZMIENNYCH ŚRODOWISKOWYCH
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

interface Puzzle {
  PuzzleId: string
  FEN: string
  Moves: string
  Rating?: number
  RatingDeviation?: number
  Popularity?: number
  NbPlays?: number
  Themes?: string | string[]
  GameUrl?: string
  OpeningTags?: string | string[]
}

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
  const [viewMode, setViewMode] = useState<'training' | 'puzzles'>('training')
  const [puzzles, setPuzzles] = useState<Puzzle[]>([])
  const [loadingPuzzles, setLoadingPuzzles] = useState(false)
  
  useEffect(() => {
    if (viewMode === 'puzzles') {
      loadPuzzles()
    }
  }, [viewMode])

  const loadPuzzles = async () => {
    setLoadingPuzzles(true)
    try {
      console.log('Fetching puzzles from Supabase...')
      
      const { data, error } = await supabase
        .from('puzzles')
        .select()
      
      console.log('Response:', { data, error })

      if (error) {
        console.error('Error:', error)
        setPuzzles([])
      } else {
        setPuzzles(data || [])
      }
    } catch (err) {
      console.error('Exception:', err)
      setPuzzles([])
    }
    setLoadingPuzzles(false)
  }
  
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
      
      {/* Tab buttons for switching between training and puzzles */}
      <div className="training-mode-tabs" style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '1px solid #ddd',
        paddingBottom: '10px'
      }}>
        <button
          onClick={() => setViewMode('training')}
          style={{
            padding: '8px 16px',
            backgroundColor: viewMode === 'training' ? '#4CAF50' : '#f0f0f0',
            color: viewMode === 'training' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: viewMode === 'training' ? 'bold' : 'normal'
          }}
        >
          📚 Standardowe treningi
        </button>
        <button
          onClick={() => setViewMode('puzzles')}
          style={{
            padding: '8px 16px',
            backgroundColor: viewMode === 'puzzles' ? '#2196F3' : '#f0f0f0',
            color: viewMode === 'puzzles' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: viewMode === 'puzzles' ? 'bold' : 'normal'
          }}
        >
          🧩 Puzzles z bazy
        </button>
      </div>

      {/* Puzzles view */}
      {viewMode === 'puzzles' && (
        <div className="puzzles-container" style={{ marginBottom: '20px' }}>
          <div className="training-panel">
            <h3>🧩 Puzzles z Supabase</h3>
            <div className="panel-content">
              {loadingPuzzles ? (
                <p>Ładowanie puzzles...</p>
              ) : puzzles.length === 0 ? (
                <p style={{ color: '#666' }}>
                  Brak puzzles w bazie. Upewnij się, że:
                  <br />1. Dodałeś dane do tabeli "puzzles" w Supabase
                  <br />2. Zmienne VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY są ustawione w .env.local
                  <br />3. Permissje (RLS) są prawidłowo skonfigurowane
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12px'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                        {puzzles.length > 0 && Object.keys(puzzles[0]).map(key => (
                          <th key={key} style={{ padding: '8px', textAlign: 'left', borderRight: '1px solid #ddd' }}>
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {puzzles.map((puzzle, idx) => (
                        <tr key={idx} style={{
                          borderBottom: '1px solid #eee',
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                        }}>
                          {Object.values(puzzle).map((value, colIdx) => (
                            <td key={colIdx} style={{ 
                              padding: '8px',
                              borderRight: '1px solid #eee',
                              maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '11px'
                            }}>
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="training-container" style={{ display: viewMode === 'puzzles' ? 'none' : 'block' }}>
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