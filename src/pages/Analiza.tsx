import { useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { CloudOnlyAnalysis } from '../components/CloudOnlyAnalysis'

type VariationNode = {
  move: string
  subVariations?: {[key: number]: VariationNode[]}
}

export function Analiza() {
  const [analysisGame, setAnalysisGame] = useState(new Chess())
  const [analysisHistory, setAnalysisHistory] = useState<string[]>([])
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
  const [variations, setVariations] = useState<{[key: number]: VariationNode[]}>({})
  const [activeVariation, setActiveVariation] = useState<{startIndex: number, moves: string[], path: number[]} | null>(null)

  const getCurrentPath = () => {
    if (activeVariation && currentMoveIndex >= activeVariation.startIndex) {
      const mainLineUpToVariation = analysisHistory.slice(0, activeVariation.startIndex)
      const variationMoves = activeVariation.moves.slice(0, currentMoveIndex - activeVariation.startIndex + 1)
      return [...mainLineUpToVariation, ...variationMoves]
    } else {
      return analysisHistory.slice(0, currentMoveIndex + 1)
    }
  }

  const addMoveToAnalysis = (move: string) => {
    if (activeVariation && currentMoveIndex >= activeVariation.startIndex) {
      // Dodaj ruch do aktywnego wariantu
      const newVariation = {
        ...activeVariation,
        moves: [...activeVariation.moves.slice(0, currentMoveIndex - activeVariation.startIndex + 1), move]
      }
      setActiveVariation(newVariation)
    } else {
      // Dodaj ruch do głównej linii
      const newHistory = [...analysisHistory.slice(0, currentMoveIndex + 1), move]
      setAnalysisHistory(newHistory)
    }
    setCurrentMoveIndex(currentMoveIndex + 1)
  }

  const makeAnalysisMove = (sourceSquare: string, targetSquare: string) => {
    const currentPath = getCurrentPath()
    const tempGame = new Chess()
    
    // Odtwórz aktualną pozycję
    currentPath.forEach(move => {
      tempGame.move(move)
    })
    
    const result = tempGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    })
    
    if (result) {
      addMoveToAnalysis(result.san)
      setAnalysisGame(tempGame)
    }
    
    return result !== null
  }

  const goToMove = (index: number) => {
    setCurrentMoveIndex(index)
    const currentPath = getCurrentPath()
    const tempGame = new Chess()
    
    currentPath.forEach(move => {
      tempGame.move(move)
    })
    
    setAnalysisGame(tempGame)
  }

  const addVariation = () => {
    const newVariation: VariationNode[] = []
    setVariations({
      ...variations,
      [currentMoveIndex]: [...(variations[currentMoveIndex] || []), ...newVariation]
    })
  }

  const loadPositionFromFEN = () => {
    const fen = prompt("Wprowadź FEN pozycji:")
    if (fen) {
      try {
        const newGame = new Chess(fen)
        setAnalysisGame(newGame)
        setAnalysisHistory([])
        setCurrentMoveIndex(-1)
        setVariations({})
        setActiveVariation(null)
      } catch (error) {
        alert("Nieprawidłowy format FEN!")
      }
    }
  }

  const resetAnalysis = () => {
    const newGame = new Chess()
    setAnalysisGame(newGame)
    setAnalysisHistory([])
    setCurrentMoveIndex(-1)
    setVariations({})
    setActiveVariation(null)
  }

  const exportToPGN = () => {
    const pgn = `[Event "Analiza"]
[Site "Chess Learning App"]
[Date "${new Date().toISOString().split('T')[0]}"]
[Round "1"]
[White "Analiza"]
[Black "Analiza"]
[Result "*"]

${analysisHistory.join(' ')} *`

    navigator.clipboard.writeText(pgn).then(() => {
      alert('PGN skopiowany do schowka!')
    })
  }

  return (
    <div className="tab-content">
      <h2>🔍 Analiza pozycji</h2>
      
      <div className="analysis-container">
        <div className="board-container">
          <Chessboard 
            position={analysisGame.fen()}
            onPieceDrop={makeAnalysisMove}
            boardWidth={400}
          />
          
          <div className="analysis-controls">
            <button onClick={resetAnalysis}>🔄 Reset pozycji</button>
            <button onClick={loadPositionFromFEN}>📥 Wczytaj FEN</button>
            <button onClick={addVariation}>🌿 Dodaj wariant</button>
            <button onClick={exportToPGN}>📋 Eksport PGN</button>
          </div>
        </div>
        
        <div className="moves-analysis">
          <h3>Historia ruchów</h3>
          <div className="moves-navigation">
            <button 
              onClick={() => goToMove(-1)}
              disabled={currentMoveIndex <= -1}
            >
              ⏮️ Start
            </button>
            <button 
              onClick={() => goToMove(currentMoveIndex - 1)}
              disabled={currentMoveIndex <= -1}
            >
              ⏪ Poprzedni
            </button>
            <button 
              onClick={() => goToMove(currentMoveIndex + 1)}
              disabled={currentMoveIndex >= analysisHistory.length - 1}
            >
              ⏩ Następny
            </button>
            <button 
              onClick={() => goToMove(analysisHistory.length - 1)}
              disabled={currentMoveIndex >= analysisHistory.length - 1}
            >
              ⏭️ Koniec
            </button>
          </div>
          
          <div className="moves-list">
            {analysisHistory.length === 0 ? (
              <p>Brak ruchów do analizy</p>
            ) : (
              <ol>
                {analysisHistory.map((move, index) => (
                  <li 
                    key={index}
                    className={index === currentMoveIndex ? 'current-move' : ''}
                    onClick={() => goToMove(index)}
                  >
                    {move}
                    {variations[index] && (
                      <span className="variation-indicator">🌿</span>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
          
          {activeVariation && (
            <div className="active-variation">
              <h4>Aktywny wariant:</h4>
              <p>{activeVariation.moves.join(' ')}</p>
            </div>
          )}
        </div>
        
        <div className="position-info">
          <h3>Informacje o pozycji</h3>
          <p><strong>FEN:</strong> {analysisGame.fen()}</p>
          <p><strong>Na ruchu:</strong> {analysisGame.turn() === 'w' ? 'Białe' : 'Czarne'}</p>
          <p><strong>Szach:</strong> {analysisGame.inCheck() ? 'Tak' : 'Nie'}</p>
          <p><strong>Mat:</strong> {analysisGame.isCheckmate() ? 'Tak' : 'Nie'}</p>
          <p><strong>Remis:</strong> {analysisGame.isDraw() ? 'Tak' : 'Nie'}</p>
          <p><strong>Ruchów:</strong> {analysisHistory.length}</p>
        </div>
      </div>
      
      {/* Cloud Analysis Integration */}
      <CloudOnlyAnalysis 
        currentFen={analysisGame.fen()} 
        isEnabled={true} 
      />
    </div>
  )
}