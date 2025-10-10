import { useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'

interface GameState {
  fen: string
  history: string[]
  isGameOver: boolean
  winner: string | null
}

interface SavedGame {
  id: string
  date: string
  moves: string[]
  result: string
  duration: number
}

export function Rozgrywka() {
  const [game, setGame] = useState(new Chess())
  const [gameState, setGameState] = useState<GameState>({
    fen: game.fen(),
    history: [],
    isGameOver: false,
    winner: null
  })
  const [savedGames, setSavedGames] = useState<SavedGame[]>([])
  const [currentGameId, setCurrentGameId] = useState<string>('')
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now())

  const makeMove = (sourceSquare: string, targetSquare: string) => {
    const gameCopy = new Chess(game.fen())
    const result = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    })
    
    if (result) {
      setGame(gameCopy)
      const newGameState: GameState = {
        fen: gameCopy.fen(),
        history: [...gameState.history, result.san],
        isGameOver: gameCopy.isGameOver(),
        winner: gameCopy.isGameOver() ? 
          (gameCopy.isCheckmate() ? 
            (gameCopy.turn() === 'w' ? 'Czarne wygrały!' : 'Białe wygrały!') : 
            'Remis!') : null
      }
      
      setGameState(newGameState)
      
      // Auto-save current game
      localStorage.setItem('current-chess-game', JSON.stringify({
        id: currentGameId,
        moves: newGameState.history,
        startTime: gameStartTime
      }))
      
      // Save completed game
      if (newGameState.isGameOver && newGameState.winner) {
        const completedGame: SavedGame = {
          id: currentGameId,
          date: new Date().toLocaleDateString('pl-PL'),
          moves: newGameState.history,
          result: newGameState.winner,
          duration: Math.round((Date.now() - gameStartTime) / 1000 / 60)
        }
        
        const updatedGames = [...savedGames, completedGame]
        setSavedGames(updatedGames)
        localStorage.setItem('chess-games', JSON.stringify(updatedGames))
      }
    }
    
    return result !== null
  }

  const resetGame = () => {
    const newGame = new Chess()
    setGame(newGame)
    setGameState({
      fen: newGame.fen(),
      history: [],
      isGameOver: false,
      winner: null
    })
    
    const newGameId = `game-${Date.now()}`
    setCurrentGameId(newGameId)
    setGameStartTime(Date.now())
    
    localStorage.removeItem('current-chess-game')
  }

  const loadSavedGame = (savedGame: SavedGame) => {
    const loadedGame = new Chess()
    const moves: string[] = []
    
    savedGame.moves.forEach((move) => {
      const result = loadedGame.move(move)
      if (result) {
        moves.push(result.san)
      }
    })
    
    setGame(loadedGame)
    setGameState({
      fen: loadedGame.fen(),
      history: moves,
      isGameOver: loadedGame.isGameOver(),
      winner: savedGame.result
    })
    setCurrentGameId(savedGame.id)
  }

  return (
    <div className="tab-content">
      <h2>♟️ Rozgrywka</h2>
      
      <div className="game-section">
        <div className="board-container">
          <Chessboard 
            position={gameState.fen}
            onPieceDrop={makeMove}
            boardWidth={400}
          />
          
          <div className="game-controls">
            {gameState.isGameOver && (
              <div className="game-over">
                <h3>Gra zakończona!</h3>
                <p>Wynik: {gameState.winner}</p>
              </div>
            )}
            
            <button onClick={resetGame} className="reset-button">
              Nowa gra
            </button>
          </div>
        </div>
        
        <div className="moves-section">
          <h3>Historia ruchów</h3>
          <div className="moves-list">
            {gameState.history.length === 0 ? (
              <p>Brak ruchów</p>
            ) : (
              <ol>
                {gameState.history.map((move, index) => (
                  <li key={index}>{move}</li>
                ))}
              </ol>
            )}
          </div>
          
          <div className="game-status">
            <p><strong>ID gry:</strong> {currentGameId.split('-')[1]}</p>
            <p><strong>Czas:</strong> {Math.round((Date.now() - gameStartTime) / 1000 / 60)} min</p>
          </div>
        </div>
        
        <div className="saved-games-section">
          <h3>Zapisane partie ({savedGames.length})</h3>
          <div className="saved-games-list">
            {savedGames.length === 0 ? (
              <p>Brak zapisanych partii</p>
            ) : (
              savedGames.slice(-5).reverse().map((savedGame) => (
                <div key={savedGame.id} className="saved-game-item" onClick={() => loadSavedGame(savedGame)}>
                  <div className="saved-game-info">
                    <strong>{savedGame.date}</strong>
                    <span className="game-result">{savedGame.result}</span>
                  </div>
                  <div className="saved-game-details">
                    <span>{savedGame.moves.length} ruchów</span>
                    <span>{savedGame.duration} min</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}