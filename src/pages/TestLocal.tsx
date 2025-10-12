import { useState } from 'react'
import { useLocalStockfish } from '../hooks/useLocalStockfish'

export function TestLocal() {
  const [testFen, setTestFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  const { currentAnalysis, isInitialized, analyzePosition } = useLocalStockfish()

  const handleAnalyze = () => {
    console.log('🧪 Testing local Stockfish with FEN:', testFen)
    analyzePosition(testFen, 16)
  }

  return (
    <div className="main-content">
      <h2>🧪 Test Lokalnego Stockfish</h2>
      
      <div className="test-section">
        <h3>Status:</h3>
        <p>Initialized: {isInitialized ? '✅ Tak' : '❌ Nie'}</p>
        <p>Analysis: {currentAnalysis ? `${currentAnalysis.score} (${currentAnalysis.source})` : 'Brak'}</p>
      </div>
      
      <div className="test-controls">
        <h3>Test FEN:</h3>
        <input 
          type="text" 
          value={testFen} 
          onChange={(e) => setTestFen(e.target.value)}
          style={{width: '100%', padding: '8px', marginBottom: '10px'}}
        />
        <button onClick={handleAnalyze} disabled={!isInitialized}>
          🔍 Analizuj pozycję
        </button>
      </div>
      
      <div className="test-presets">
        <h3>Szybkie testy:</h3>
        <button onClick={() => setTestFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')}>
          Pozycja startowa
        </button>
        <button onClick={() => setTestFen('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')}>
          1.e4
        </button>
        <button onClick={() => setTestFen('rnb1kbnr/pppp1ppp/8/4N2q/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 1 4')}>
          Problematyczna pozycja
        </button>
      </div>
      
      <div className="debug-section">
        <h3>🐛 Debug:</h3>
        <button onClick={() => console.log('Local Stockfish state:', { isInitialized, currentAnalysis })}>
          Pokaż stan w konsoli
        </button>
      </div>
      
      {currentAnalysis && (
        <div className="analysis-result">
          <h3>Wynik analizy:</h3>
          <p><strong>Ocena:</strong> {currentAnalysis.score}</p>
          <p><strong>Najlepszy ruch:</strong> {currentAnalysis.bestMove}</p>
          <p><strong>Głębokość:</strong> {currentAnalysis.depth}</p>
          <p><strong>Węzły:</strong> {currentAnalysis.nodes}</p>
          <p><strong>Źródło:</strong> {currentAnalysis.source}</p>
          <p><strong>Warianty:</strong> {currentAnalysis.pv.join(' ')}</p>
        </div>
      )}
    </div>
  )
}