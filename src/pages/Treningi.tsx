import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'

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

export function Treningi() {
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null)
  const [puzzleResult, setPuzzleResult] = useState<'correct' | 'incorrect' | null>(null)
  const [allPuzzles, setAllPuzzles] = useState<Puzzle[]>([])
  const [loadingPuzzles, setLoadingPuzzles] = useState(false)
  
  useEffect(() => {
    loadPuzzles()
  }, [])

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
        setAllPuzzles([])
      } else {
        setAllPuzzles(data || [])
        // Immediately load random puzzle
        if (data && data.length > 0) {
          const randomPuzzle = data[Math.floor(Math.random() * data.length)]
          setActivePuzzle(randomPuzzle)
          setPuzzleResult(null)
        }
      }
    } catch (err) {
      console.error('Exception:', err)
      setAllPuzzles([])
    }
    setLoadingPuzzles(false)
  }
  const loadRandomPuzzle = () => {
    if (allPuzzles.length > 0) {
      const randomPuzzle = allPuzzles[Math.floor(Math.random() * allPuzzles.length)]
      setActivePuzzle(randomPuzzle)
      setPuzzleResult(null)
    }
  }

  return (
    <div className="tab-content">
      <h2>💪 Treningi szachowe - Puzzles</h2>
      
      {/* Removed tab switcher - now only showing puzzles mode */}

      {/* Puzzles view - od razu puzzle player */}
      {(
        <>
          {loadingPuzzles ? (
            <p>Ładowanie puzzles...</p>
          ) : activePuzzle ? (
            <PuzzlePlayer
              key={activePuzzle.PuzzleId}
              puzzle={activePuzzle}
              onBack={() => loadRandomPuzzle()}
              result={puzzleResult}
              onResult={setPuzzleResult}
            />
          ) : (
            <p style={{ color: '#666' }}>
              Brak puzzles w bazie. Upewnij się, że:
              <br />1. Dodałeś dane do tabeli "puzzles" w Supabase
              <br />2. Zmienne VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY są ustawione w .env.local
              <br />3. Permissje (RLS) są prawidłowo skonfigurowane
            </p>
          )}
        </>
      )}
      
    </div>
  )
}

interface PuzzlePlayerProps {
  puzzle: Puzzle
  onBack: () => void
  result: 'correct' | 'incorrect' | null
  onResult: (result: 'correct' | 'incorrect') => void
}

function PuzzlePlayer({ puzzle, onBack, result, onResult }: PuzzlePlayerProps) {
  const [game, setGame] = useState(new Chess(puzzle.FEN))
  const [displayGame, setDisplayGame] = useState(new Chess(puzzle.FEN))
  const [moveHistory, setMoveHistory] = useState<Array<{ notation: string; player: 'computer' | 'player' }>>([])
  const expectedMoves = puzzle.Moves.split(' ').filter(m => m.length > 0)
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [isPlayerTurn, setIsPlayerTurn] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)
  const [status, setStatus] = useState('🤖 Ruch komputera')
  
  console.log('PuzzlePlayer loaded with:', { puzzle: puzzle.PuzzleId, moves: expectedMoves, fen: puzzle.FEN })
  
  // Check if player is playing as black (computer plays white on first move)
  const firstMove = expectedMoves[0]
  const testGame = new Chess(puzzle.FEN)
  const firstMoveResult = testGame.move(firstMove, { strict: false })
  console.log('First move test:', { firstMove, firstMoveResult, isPlayerBlack: firstMoveResult?.color === 'w' })
  // If first move is by white, player is black
  const isPlayerBlack = firstMoveResult?.color === 'w'
  const boardOrientation = isPlayerBlack ? 'black' : 'white'

  useEffect(() => {
    if (expectedMoves.length === 0) return
    if (currentMoveIndex >= expectedMoves.length) return

    // Computer's turn (even indices: 0, 2, 4, ...)
    if (currentMoveIndex % 2 === 0) {
      const timer = setTimeout(() => {
        const move = expectedMoves[currentMoveIndex]
        // Always start from the puzzle FEN and replay moves up to current index
        const replayGame = new Chess(puzzle.FEN)
        
        // Replay all moves up to current index
        for (let i = 0; i < currentMoveIndex; i++) {
          try {
            replayGame.move(expectedMoves[i], { strict: true })
          } catch (e) {
            replayGame.move(expectedMoves[i], { strict: false })
          }
        }
        
        // Now make the current move
        let result
        try {
          result = replayGame.move(move, { strict: true })
        } catch (e) {
          try {
            result = replayGame.move(move, { strict: false })
          } catch (e2) {
            console.error('Failed to move:', move, 'on position:', replayGame.fen())
            return
          }
        }
        
        if (result) {
          setGame(new Chess(replayGame.fen()))
          setDisplayGame(new Chess(replayGame.fen()))
          setMoveHistory(prev => [...prev, { notation: result.san, player: 'computer' }])
          
          if (currentMoveIndex + 1 < expectedMoves.length) {
            // More moves after this
            setCurrentMoveIndex(currentMoveIndex + 1)
            setIsPlayerTurn(true)
            setStatus('👤 Twoja tura')
          } else {
            // Last computer move, puzzle complete
            onResult('correct')
            setStatus('✅ DOBRZE!')
          }
          setIsAnimating(false)
        }
      }, currentMoveIndex === 0 ? 500 : 500) // All computer moves 500ms
      
      return () => clearTimeout(timer)
    }

    // Player's turn (odd indices: 1, 3, 5, ...)
    if (currentMoveIndex % 2 === 1 && isPlayerTurn) {
      setStatus('👤 Twoja tura')
      setIsAnimating(false)
    }
  }, [currentMoveIndex, isPlayerTurn, expectedMoves, puzzle.FEN, onResult])

  const handlePieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
    // Only allow moves on odd indices (player's turn)
    if (currentMoveIndex % 2 === 0 || isAnimating) return false

    setIsAnimating(true)
    setStatus('⏳ Chwila')

    let move
    try {
      move = game.move(`${sourceSquare}${targetSquare}`, { strict: true })
    } catch (e) {
      try {
        move = game.move(`${sourceSquare}${targetSquare}`, { strict: false })
      } catch (e2) {
        setIsAnimating(false)
        setStatus('❌ Zły ruch! Spróbuj ponownie')
        return false
      }
    }

    if (!move) {
      setIsAnimating(false)
      setStatus('❌ Zły ruch! Spróbuj ponownie')
      return false
    }

    // Check if move matches expected
    const expectedMove = expectedMoves[currentMoveIndex]
    const testGame = new Chess(displayGame.fen())
    let expectedMoveObj
    
    try {
      expectedMoveObj = testGame.move(expectedMove, { strict: true })
    } catch (e) {
      try {
        expectedMoveObj = testGame.move(expectedMove, { strict: false })
      } catch (e2) {
        console.error('Invalid expected move:', expectedMove)
        setIsAnimating(false)
        return false
      }
    }
    
    if (move.san === expectedMoveObj?.san) {
      const newGame = new Chess(game.fen())
      setGame(newGame)
      setDisplayGame(new Chess(newGame.fen()))
      setMoveHistory(prev => [...prev, { notation: move.san, player: 'player' }])
      
      if (currentMoveIndex + 1 < expectedMoves.length) {
        // More moves (computer's turn next)
        setCurrentMoveIndex(currentMoveIndex + 1)
        setIsPlayerTurn(false)
        setStatus('🤖 Ruch komputera')
      } else {
        // Puzzle complete (last move was player's)
        onResult('correct')
        setStatus('✅ DOBRZE!')
      }
      return true
    } else {
      // Wrong move - puzzle failed
      onResult('incorrect')
      setStatus('❌ ŹLE!')
      return false
    }
  }

  return (
    <div className="puzzle-player">
      <button onClick={onBack} className="back-button">← Wróć do listy</button>
      
      <div className="puzzle-container">
        <div className="board-container">
          <Chessboard
            position={displayGame.fen()}
            onPieceDrop={handlePieceDrop}
            boardOrientation={boardOrientation}
            customBoardStyle={{
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          />
          <div className="puzzle-info">
            <p><strong>Rating:</strong> {puzzle.Rating}</p>
            <p><strong>Ruchy:</strong> {expectedMoves.length}</p>
            <p><strong>Status:</strong> {status}</p>
          </div>
        </div>

        <div className="move-history">
          <h3>Historia ruchów</h3>
          <div className="moves-list">
            {moveHistory.map((move, idx) => (
              <div key={idx} className="move-item">
                <span className="move-player">{move.player === 'computer' ? '🤖' : '👤'}</span>
                <span className="move-notation">{move.notation}</span>
              </div>
            ))}
          </div>
          {result && (
            <div className={`result-text result-${result}`}>
              {result === 'correct' ? (
                <>
                  <strong>✅ DOBRZE!</strong>
                  <p>Gratuluję! Rozwiązałeś puzzle poprawnie.</p>
                  <button onClick={onBack} className="result-button">← Następny puzzle</button>
                </>
              ) : (
                <>
                  <strong>❌ ŹLE!</strong>
                  <p>Blad! To nie był prawidłowy ruch.</p>
                  <button onClick={onBack} className="result-button">← Wróć do listy</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {result && (
        <div style={{ display: 'none' }} />
      )}

      <style>{`
        .puzzle-player {
          padding: 20px;
          width: 90%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .back-button {
          padding: 8px 16px;
          margin-bottom: 20px;
          background: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background: #e0e0e0;
          transform: translateX(-2px);
        }

        .puzzle-container {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 30px;
          margin-bottom: 30px;
        }

        .board-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .puzzle-info {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          font-size: 14px;
        }

        .puzzle-info p {
          margin: 8px 0;
        }

        .move-history {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #eee;
        }

        .move-history h3 {
          margin-top: 0;
          font-size: 16px;
          margin-bottom: 12px;
        }

        .moves-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 400px;
          overflow-y: auto;
        }

        .move-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px;
          background: white;
          border-radius: 4px;
          font-size: 13px;
        }

        .move-player {
          font-size: 18px;
          width: 20px;
        }

        .move-notation {
          font-family: monospace;
          font-weight: bold;
        }

        .result-text {
          margin-top: 15px;
          padding: 12px;
          border-radius: 6px;
          border-left: 4px solid #ccc;
        }

        .result-text strong {
          display: block;
          margin-bottom: 8px;
          font-size: 16px;
        }

        .result-text p {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: #666;
        }

        .result-correct {
          background: #e8f5e9;
          border-left-color: #4caf50;
        }

        .result-correct strong {
          color: #4caf50;
        }

        .result-incorrect {
          background: #ffebee;
          border-left-color: #f44336;
        }

        .result-incorrect strong {
          color: #f44336;
        }

        .result-button {
          padding: 8px 12px;
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .result-button:hover {
          background: #1976d2;
        }

        @media (max-width: 768px) {
          .puzzle-container {
            grid-template-columns: 1fr;
          }
          
          .result-card {
            width: 90%;
            padding: 30px;
          }
        }
      `}</style>
    </div>
  )
}