import { useStockfish } from '../hooks/useStockfish'
import { useEffect } from 'react'

interface StockfishAnalysisProps {
  currentFen: string
}

export const StockfishAnalysis: React.FC<StockfishAnalysisProps> = ({ currentFen }) => {
  const { 
    isReady, 
    isThinking, 
    bestMove, 
    evaluation, 
    getBestMove, 
    getEvaluation,
    stopThinking 
  } = useStockfish()

  // Automatyczna ocena przy zmianie pozycji
  useEffect(() => {
    console.log('StockfishAnalysis: isReady=', isReady, 'currentFen=', currentFen)
    if (isReady && currentFen) {
      console.log('StockfishAnalysis: Wywołuję getEvaluation dla FEN:', currentFen)
      // Małe opóźnienie żeby nie spamować silnika
      const timer = setTimeout(() => {
        getEvaluation(currentFen, 6)  // Zmniejszona głębokość dla szybszej analizy
      }, 150)
      
      return () => clearTimeout(timer)
    }
  }, [currentFen, isReady, getEvaluation])

  const handleAnalyze = () => {
    getBestMove(currentFen, 12)
  }

  const getEvaluationText = () => {
    if (evaluation === null) return 'Brak oceny'
    if (evaluation > 5) return `Białe wygrywają (+${evaluation.toFixed(1)})`
    if (evaluation < -5) return `Czarne wygrywają (${evaluation.toFixed(1)})`
    if (evaluation > 0) return `Białe lepiej (+${evaluation.toFixed(1)})`
    if (evaluation < 0) return `Czarne lepiej (${evaluation.toFixed(1)})`
    return 'Pozycja równa (0.0)'
  }

  const getEvaluationColor = () => {
    if (evaluation === null) return '#666'
    if (evaluation > 1) return '#4caf50'
    if (evaluation < -1) return '#f44336'
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
          {isThinking && <span className="thinking-indicator">🧠 Analizuje...</span>}
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          Debug: FEN = {currentFen.substring(0, 20)}...
          <br />
          Evaluation: {evaluation !== null ? evaluation : 'null'}
          <br />
          BestMove: {bestMove || 'none'}
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
                width: `${Math.min(Math.max(50 + (evaluation || 0) * 10, 0), 100)}%`,
                backgroundColor: getEvaluationColor()
              }}
            />
          </div>
        </div>
      </div>

      <div className="best-move-display">
        <h4>🎯 Sugerowany ruch</h4>
        <div className="move-suggestion">
          {bestMove ? (
            <span className="best-move">{bestMove}</span>
          ) : (
            <span className="no-move">Analizuję...</span>
          )}
        </div>
        <button 
          className="analyze-deeper"
          onClick={handleAnalyze}
          disabled={!isReady || isThinking}
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
          onClick={() => getEvaluation(currentFen, 8)}
          disabled={!isReady || isThinking}
        >
          🔍 Analizuj pozycję
        </button>
        <button 
          className="best-move-button" 
          onClick={handleAnalyze}
          disabled={!isReady || isThinking}
        >
          🎯 Znajdź najlepszy ruch
        </button>
      </div>

      {isThinking && (
        <div className="thinking-controls">
          <button className="stop-button" onClick={stopThinking}>
            ⏹️ Zatrzymaj
          </button>
        </div>
      )}
    </div>
  )
}