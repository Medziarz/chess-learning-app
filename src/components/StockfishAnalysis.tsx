import { useStockfish } from '../hooks/useStockfish'
import { useEffect } from 'react'

interface StockfishAnalysisProps {
  currentFen: string
}

export const StockfishAnalysis: React.FC<StockfishAnalysisProps> = ({ currentFen }) => {
  const { 
    isReady, 
    isAnalyzing, 
    analysis,
    analyzePosition, 
    stopAnalysis
  } = useStockfish()

  // Automatyczna ocena przy zmianie pozycji
  useEffect(() => {
    console.log('StockfishAnalysis: isReady=', isReady, 'currentFen=', currentFen)
    if (isReady && currentFen) {
      console.log('StockfishAnalysis: Wywołuję analyzePosition dla FEN:', currentFen)
      // Małe opóźnienie żeby nie spamować silnika
      const timer = setTimeout(() => {
        analyzePosition(currentFen, 10)  // Głębokość 10 dla szybkiej analizy
      }, 150)
      
      return () => clearTimeout(timer)
    }
  }, [currentFen, isReady, analyzePosition])

  const handleAnalyze = () => {
    analyzePosition(currentFen, 15) // Głębsza analiza na żądanie
  }

  const getEvaluationText = () => {
    if (!analysis?.score) return 'Brak oceny'
    const score = typeof analysis.score === 'number' ? analysis.score : 0
    if (score > 5) return `Białe wygrywają (+${score.toFixed(1)})`
    if (score < -5) return `Czarne wygrywają (${score.toFixed(1)})`
    if (score > 0) return `Białe lepiej (+${score.toFixed(1)})`
    if (score < 0) return `Czarne lepiej (${score.toFixed(1)})`
    return 'Pozycja równa (0.0)'
  }

  const getEvaluationColor = () => {
    if (!analysis?.score) return '#666'
    const score = typeof analysis.score === 'number' ? analysis.score : 0
    if (score > 1) return '#4caf50'
    if (score < -1) return '#f44336'
    return '#ff9800'
  }

  return (
    <div className="stockfish-analysis">
      <div className="engine-status">
        <h3>🤖 Stockfish Live</h3>
        <div className="status-compact">
          <span className={`status-indicator ${isReady ? 'ready' : 'loading'}`}>
            {isReady ? '✅ Gotowy' : '⏳ Ładuje...'}
          </span>
          {isAnalyzing && <span className="thinking-indicator">🧠 Analizuje...</span>}
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          Debug: FEN = {currentFen.substring(0, 20)}...
          <br />
          Evaluation: {analysis?.score !== undefined ? analysis.score : 'null'}
          <br />
          BestMove: {analysis?.bestMove || 'none'}
          <br />
          Depth: {analysis?.depth || 0}
        </div>
      </div>

      <div className="evaluation-display">
        <h4>� Live Ocena</h4>
        <div className="evaluation-bar">
          <div 
            className="evaluation-value"
            style={{ color: getEvaluationColor() }}
          >
            {getEvaluationText()}
          </div>
          <div className="evaluation-meter">
            <div 
              className="evaluation-fill"
              style={{ 
                width: `${Math.min(Math.max(50 + ((typeof analysis?.score === 'number' ? analysis.score : 0)) * 10, 0), 100)}%`,
                backgroundColor: getEvaluationColor()
              }}
            />
          </div>
        </div>
      </div>

      <div className="best-move-display">
        <h4>🎯 Sugerowany ruch</h4>
        <div className="move-suggestion">
          {analysis?.bestMove ? (
            <span className="best-move">{analysis.bestMove}</span>
          ) : (
            <span className="no-move">Analizuję...</span>
          )}
        </div>
        <button 
          className="analyze-deeper"
          onClick={handleAnalyze}
          disabled={!isReady || isAnalyzing}
        >
          🔍 Głębsza analiza
        </button>
      </div>

      <div className="position-info">
        <h4>� Pozycja FEN</h4>
        <code className="fen-compact">{currentFen.split(' ')[0]}</code>
      </div>

      <div className="manual-controls">
        <button 
          className="analyze-button" 
          onClick={() => analyzePosition(currentFen, 12)}
          disabled={!isReady || isAnalyzing}
        >
          🔍 Analizuj pozycję
        </button>
        <button 
          className="best-move-button" 
          onClick={handleAnalyze}
          disabled={!isReady || isAnalyzing}
        >
          🎯 Znajdź najlepszy ruch
        </button>
      </div>

      {isAnalyzing && (
        <div className="thinking-controls">
          <button className="stop-button" onClick={stopAnalysis}>
            ⏹️ Zatrzymaj
          </button>
        </div>
      )}
    </div>
  )
}