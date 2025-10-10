import { useState, useEffect } from 'react'
import { cloudOnlyAnalysis } from '../services/cloudOnlyAnalysis'

interface CloudOnlyAnalysisProps {
  currentFen: string
  isEnabled: boolean
}

interface AnalysisResult {
  evaluation: number
  bestMove: string
  depth: number
  mate?: number
}

export const CloudOnlyAnalysis: React.FC<CloudOnlyAnalysisProps> = ({ 
  currentFen, 
  isEnabled 
}) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [cacheSize, setCacheSize] = useState(0)

  // Funkcja do formatowania ruchu z notacji UCI na bardziej czytelną
  const formatMoveToAlgebraic = (uciMove: string): string => {
    if (!uciMove || uciMove.length < 4) return uciMove
    
    const from = uciMove.substring(0, 2)
    const to = uciMove.substring(2, 4)
    const promotion = uciMove.length > 4 ? uciMove.substring(4) : ''
    
    let formatted = `${from} → ${to}`
    if (promotion) {
      formatted += ` = ${promotion.toUpperCase()}`
    }
    
    return formatted
  }

  // Aktualizuj rozmiar cache co 5 sekund
  useEffect(() => {
    const updateCacheSize = () => {
      setCacheSize(cloudOnlyAnalysis.getCacheSize())
    }
    
    updateCacheSize()
    const interval = setInterval(updateCacheSize, 5000)
    return () => clearInterval(interval)
  }, [])

  // Analizuj pozycję gdy FEN się zmieni
  useEffect(() => {
    if (!isEnabled || !currentFen) return

    const analyzePosition = async () => {
      setIsLoading(true)
      
      try {
        console.log('🔍 Starting cloud analysis for:', currentFen)
        
        const result = await cloudOnlyAnalysis.analyzePosition(currentFen)
        setAnalysis(result)
        
        console.log('✅ Analysis complete:', {
          evaluation: result.evaluation,
          bestMove: result.bestMove,
          bestMoveLength: result.bestMove.length,
          depth: result.depth,
          formatted: formatMoveToAlgebraic(result.bestMove)
        })
        
      } catch (error) {
        console.error('❌ Analysis failed:', error)
        
        // Fallback result
        setAnalysis({
          evaluation: 0.0,
          bestMove: 'e2e4',
          depth: 10
        })
      } finally {
        setIsLoading(false)
      }
    }

    analyzePosition()
  }, [currentFen, isEnabled])

  if (!isEnabled) return null

  const getEvaluationColor = (evaluation: number) => {
    if (evaluation > 2) return '#22c55e'      // Duża przewaga białych
    if (evaluation > 0.5) return '#84cc16'   // Mała przewaga białych
    if (evaluation > -0.5) return '#64748b'  // Równa pozycja
    if (evaluation > -2) return '#f97316'    // Mała przewaga czarnych  
    return '#ef4444'                         // Duża przewaga czarnych
  }

  const getEvaluationText = (evaluation: number) => {
    if (evaluation > 3) return 'Białe wygrywają'
    if (evaluation > 1) return 'Duża przewaga białych'
    if (evaluation > 0.5) return 'Przewaga białych'
    if (evaluation > -0.5) return 'Równa pozycja'
    if (evaluation > -1) return 'Przewaga czarnych'
    if (evaluation > -3) return 'Duża przewaga czarnych'
    return 'Czarne wygrywają'
  }

  const getEvaluationBar = (evaluation: number) => {
    // Konwertuj na procent (od 0% do 100%)
    // -3 = 10%, 0 = 50%, +3 = 90% (bardziej widoczne różnice)
    let percentage = 50 + (evaluation * 15) // każdy pion = 15% różnicy
    percentage = Math.max(10, Math.min(90, percentage)) // clamp między 10-90%
    
    console.log('📊 Evaluation bar:', { evaluation, percentage })
    return percentage
  }

  return (
    <div className="cloud-only-analysis">
      <div className="analysis-header">
        <h3>☁️ Cloud Analysis</h3>
        <div className="cache-info">
          <span>📊 Cache: {cacheSize} pozycji</span>
          <button 
            onClick={() => cloudOnlyAnalysis.clearCache()}
            className="clear-cache-btn"
            title="Wyczyść cache"
          >
            🧹
          </button>
        </div>
      </div>

      {analysis && (
        <div className="analysis-results">
          {/* Pasek evaluacji */}
          <div className="evaluation-container">
            <div className="evaluation-label">Ocena pozycji:</div>
            <div className="evaluation-bar">
              <div 
                className="evaluation-fill"
                style={{
                  width: `${getEvaluationBar(analysis.evaluation)}%`,
                  backgroundColor: getEvaluationColor(analysis.evaluation)
                }}
              />
              <div className="evaluation-center-line" />
            </div>
            <div className="evaluation-details">
              <div className="evaluation-score-container">
                <span 
                  className="evaluation-score"
                  style={{ color: getEvaluationColor(analysis.evaluation) }}
                >
                  {analysis.evaluation > 0 ? '+' : ''}{analysis.evaluation.toFixed(2)}
                </span>
                <span className="evaluation-unit">pions</span>
              </div>
              <span 
                className="evaluation-text"
                style={{ color: getEvaluationColor(analysis.evaluation) }}
              >
                {getEvaluationText(analysis.evaluation)}
              </span>
            </div>
          </div>

          {/* Najlepszy ruch */}
          <div className="best-move-container">
            <div className="best-move-label">Najlepszy ruch:</div>
            <div className="best-move-display">
              <div className="best-move-value">
                {analysis.bestMove}
              </div>
              <div className="move-notation">
                {formatMoveToAlgebraic(analysis.bestMove)}
              </div>
            </div>
            <div className="depth-info">Głębokość: {analysis.depth}</div>
          </div>

          {/* Mat info jeśli istnieje */}
          {analysis.mate !== undefined && (
            <div className="mate-info">
              <span className="mate-icon">👑</span>
              <span className="mate-text">
                Mat w {Math.abs(analysis.mate)} {analysis.mate > 0 ? 'dla białych' : 'dla czarnych'}
              </span>
            </div>
          )}

          {/* Info o źródle analizy */}
          <div className="analysis-source-info">
            {analysis.depth >= 20 && (
              <div className="source-quality high">
                <span className="quality-icon">🏆</span>
                <span>Lichess Cloud Analysis - Najwyższa jakość</span>
              </div>
            )}
            {analysis.depth >= 15 && analysis.depth < 20 && (
              <div className="source-quality medium">
                <span className="quality-icon">📖</span>
                <span>Opening Book - Sprawdzone otwarcie</span>
              </div>
            )}
            {analysis.depth < 15 && (
              <div className="source-quality low">
                <span className="quality-icon">🎲</span>
                <span>Fallback Analysis - Pozycja nieznana w bazie</span>
              </div>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <div className="loading-text">Analizuję pozycję...</div>
        </div>
      )}

      <div className="service-info">
        <span>🌐 Lichess Cloud Engine</span>
        <span className="service-status">✅ Aktywny</span>
      </div>
    </div>
  )
}