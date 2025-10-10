import { useState, useEffect } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { CloudOnlyAnalysis } from './components/CloudOnlyAnalysis'
import './components/CloudOnlyAnalysis.css'
import './App.css'

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

function App() {
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

  // Wczytaj zapisane gry przy starcie
  useEffect(() => {
    const saved = localStorage.getItem('chess-games')
    if (saved) {
      setSavedGames(JSON.parse(saved))
    }
    
    // Wczytaj aktualną grę jeśli istnieje
    const currentGame = localStorage.getItem('current-chess-game')
    if (currentGame) {
      const gameData = JSON.parse(currentGame)
      const loadedGame = new Chess()
      
      // Odtwórz wszystkie ruchy
      gameData.moves.forEach((move: string) => {
        loadedGame.move(move)
      })
      
      setGame(loadedGame)
      setGameState({
        fen: loadedGame.fen(),
        history: loadedGame.history(),
        isGameOver: loadedGame.isGameOver(),
        winner: loadedGame.isCheckmate() 
          ? (loadedGame.turn() === 'w' ? 'Czarne' : 'Białe')
          : loadedGame.isDraw() ? 'Remis' : null
      })
      setCurrentGameId(gameData.id)
      setGameStartTime(gameData.startTime)
    } else {
      // Nowa gra - wygeneruj ID
      setCurrentGameId(generateGameId())
    }
  }, [])

  // Zapisuj grę po każdym ruchu
  useEffect(() => {
    if (gameState.history.length > 0) {
      const gameData = {
        id: currentGameId,
        moves: gameState.history,
        startTime: gameStartTime,
        currentFen: gameState.fen
      }
      localStorage.setItem('current-chess-game', JSON.stringify(gameData))
    }
  }, [gameState.history, currentGameId, gameStartTime, gameState.fen])

  const generateGameId = (): string => {
    return `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }



  const makeMove = (move: any) => {
    const gameCopy = new Chess(game.fen())
    const result = gameCopy.move(move)
    
    if (result) {
      setGame(gameCopy)
      const newGameState = {
        fen: gameCopy.fen(),
        history: gameCopy.history(),
        isGameOver: gameCopy.isGameOver(),
        winner: gameCopy.isCheckmate() 
          ? (gameCopy.turn() === 'w' ? 'Czarne' : 'Białe')
          : gameCopy.isDraw() ? 'Remis' : null
      }
      setGameState(newGameState)
      
      // Jeśli gra się skończyła, zapisz ją
      if (newGameState.isGameOver) {
        const completedGame: SavedGame = {
          id: currentGameId,
          date: new Date().toLocaleString('pl-PL'),
          moves: newGameState.history,
          result: newGameState.winner || 'Remis',
          duration: Math.round((Date.now() - gameStartTime) / 1000 / 60)
        }
        
        // Zapisz do localStorage
        setTimeout(() => {
          const saved = localStorage.getItem('chess-games')
          const existing = saved ? JSON.parse(saved) : []
          const updated = [...existing, completedGame]
          setSavedGames(updated)
          localStorage.setItem('chess-games', JSON.stringify(updated))
          localStorage.removeItem('current-chess-game')
        }, 100)
      }
    }
    
    return result
  }

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // domyślnie promuj do hetmana
    })
    
    return move !== null
  }

  const resetGame = () => {
    // Usuń aktualną grę z localStorage
    localStorage.removeItem('current-chess-game')
    
    const newGame = new Chess()
    const newGameId = generateGameId()
    
    setGame(newGame)
    setGameState({
      fen: newGame.fen(),
      history: [],
      isGameOver: false,
      winner: null
    })
    setCurrentGameId(newGameId)
    setGameStartTime(Date.now())
  }

  const loadSavedGame = (savedGame: SavedGame) => {
    const loadedGame = new Chess()
    
    // Odtwórz wszystkie ruchy
    savedGame.moves.forEach((move: string) => {
      loadedGame.move(move)
    })
    
    setGame(loadedGame)
    setGameState({
      fen: loadedGame.fen(),
      history: loadedGame.history(),
      isGameOver: true, // zapisane gry są skończone
      winner: savedGame.result
    })
    setCurrentGameId(savedGame.id)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Chess Learning App</h1>
        <p>Aplikacja do nauki szachów</p>
      </header>
      
      <main className="main-content">
        <div className="game-section">
          <div className="chessboard-container">
            <Chessboard 
              position={gameState.fen}
              onPieceDrop={onDrop}
              boardWidth={400}
            />
          </div>
          
          <div className="game-info">
            <h3>Status gry</h3>
            <p>Ruch: {game.turn() === 'w' ? 'Białych' : 'Czarnych'}</p>
            
            {gameState.isGameOver && (
              <div className="game-over">
                <h4>Koniec gry!</h4>
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
      </main>
      
      <footer className="app-footer">
        <p>Wykorzystuje chess.js i react-chessboard</p>
      </footer>
      
      {/* Cloud-only Analysis - szybkie i niezawodne */}
      <CloudOnlyAnalysis 
        currentFen={gameState.fen} 
        isEnabled={true} 
      />
    </div>
  )
}

export default App