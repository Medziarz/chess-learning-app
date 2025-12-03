import { useState, useEffect } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { useRemoteStockfish } from '../hooks/useRemoteStockfish'

interface GameState {
  fen: string
  history: string[]
  isGameOver: boolean
  winner: string | null
}

type PlayerColor = 'white' | 'black'

export function Rozgrywka() {
  const [game, setGame] = useState(new Chess())
  const [gameState, setGameState] = useState<GameState>({
    fen: game.fen(),
    history: [],
    isGameOver: false,
    winner: null
  })
  
  // Stockfish settings
  const [playerColor, setPlayerColor] = useState<PlayerColor>('white')
  const [eloLevel, setEloLevel] = useState(2000)
  const [gameStarted, setGameStarted] = useState(false)
  const [isAiThinking, setIsAiThinking] = useState(false)
  
  // Stockfish integration
  const { analysis, isReady: stockfishReady, analyzePosition } = useRemoteStockfish()

  // Save game state to localStorage
  const saveGameToStorage = () => {
    const gameData = {
      fen: game.fen(),
      gameState,
      playerColor,
      eloLevel,
      gameStarted
    }
    localStorage.setItem('chess-game-state', JSON.stringify(gameData))
  }

  // Load game state from localStorage
  const loadGameFromStorage = () => {
    try {
      const savedGame = localStorage.getItem('chess-game-state')
      if (savedGame) {
        const gameData = JSON.parse(savedGame)
        const restoredGame = new Chess(gameData.fen)
        setGame(restoredGame)
        setGameState(gameData.gameState)
        setPlayerColor(gameData.playerColor)
        setEloLevel(gameData.eloLevel || 2000)
        setGameStarted(gameData.gameStarted)
        return true
      }
    } catch (error) {
      console.error('Error loading game from storage:', error)
      localStorage.removeItem('chess-game-state')
    }
    return false
  }

  // Load saved game on component mount
  useEffect(() => {
    loadGameFromStorage()
  }, [])

  // Save game state whenever it changes
  useEffect(() => {
    if (gameStarted) {
      saveGameToStorage()
    }
  }, [game, gameState, playerColor, eloLevel, gameStarted])

  // Check if it's player turn
  const isCurrentlyPlayerTurn = () => {
    if (!gameStarted) return false
    const currentTurn = game.turn() === 'w' ? 'white' : 'black'
    return currentTurn === playerColor
  }

  // Make Stockfish move with ELO difficulty
  const makeStockfishMove = () => {
    if (!analysis?.bestMove || !stockfishReady) return
    
    const randomChance = Math.random() * 100
    const accuracy = 85 // Default accuracy for ELO-based moves
    
    // Apply accuracy: sometimes make a random legal move instead of best move
    let moveToPlay = analysis.bestMove
    
    if (randomChance > accuracy) {
      // Make a weaker move - get random legal moves
      const gameCopy = new Chess(game.fen())
      const legalMoves = gameCopy.moves({ verbose: true })
      
      if (legalMoves.length > 1) {
        // Pick a random move that's not the best move (if possible)
        const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)]
        moveToPlay = randomMove.from + randomMove.to + (randomMove.promotion || '')
        console.log(`🎲 Playing weaker move (85% accuracy): ${randomMove.san}`)
      }
    } else {
      console.log(`🎯 Playing best move (85% accuracy): ${analysis.bestMove}`)
    }
    
    // Convert castling notation from Stockfish format to Chess.js format (only for actual castling moves)
    const convertCastlingMove = (move: string): string => {
      // Only convert if it's actually a castling move (king moving to rook position)
      if (move === 'e1h1') {
        console.log(`🏰 Converting white king-side castling: e1h1 → e1g1`)
        return 'e1g1' // King-side castling
      }
      if (move === 'e1a1') {
        console.log(`🏰 Converting white queen-side castling: e1a1 → e1c1`)
        return 'e1c1' // Queen-side castling
      }
      if (move === 'e8h8') {
        console.log(`🏰 Converting black king-side castling: e8h8 → e8g8`)
        return 'e8g8' // King-side castling
      }
      if (move === 'e8a8') {
        console.log(`🏰 Converting black queen-side castling: e8a8 → e8c8`)
        return 'e8c8' // Queen-side castling
      }
      return move // No conversion needed for non-castling moves
    }
    
    moveToPlay = convertCastlingMove(moveToPlay)
    
    const from = moveToPlay.slice(0, 2)
    const to = moveToPlay.slice(2, 4)
    const promotion = moveToPlay.length > 4 ? moveToPlay.slice(4) : undefined
    
    const gameCopy = new Chess(game.fen())
    
    // Validate that the move is legal before attempting it
    const legalMoves = gameCopy.moves({ verbose: true })
    const isLegalMove = legalMoves.some(move => 
      move.from === from && move.to === to && (move.promotion || '') === (promotion || '')
    )
    
    if (!isLegalMove) {
      console.warn(`⚠️ Illegal move suggested: ${moveToPlay}, picking random legal move instead`)
      if (legalMoves.length > 0) {
        const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)]
        const result = gameCopy.move(randomMove)
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
          setIsAiThinking(false)
          
          // Clear saved game when game ends
          if (gameCopy.isGameOver()) {
            localStorage.removeItem('chess-game-state')
          }
        } else {
          setIsAiThinking(false)
        }
      } else {
        setIsAiThinking(false)
      }
      return
    }
    
    const result = gameCopy.move({ from, to, promotion })
    
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
      setIsAiThinking(false)
      
      // Clear saved game when game ends
      if (gameCopy.isGameOver()) {
        localStorage.removeItem('chess-game-state')
      }
    } else {
      setIsAiThinking(false)
    }
  }

  // Convert English chess notation to Polish notation
  const convertToPolishNotation = (move: string): string => {
    return move
      .replace(/B/g, 'G')  // Bishop -> Goniec
      .replace(/N/g, 'S')  // Knight -> Skoczek
      .replace(/R/g, 'W')  // Rook -> Wieża
      .replace(/Q/g, 'H')  // Queen -> Hetman
      .replace(/K/g, 'K')  // King -> Król (bez zmiany)
  }

  // Format moves history in Polish chess notation (1. e4 e5 2. Sf3 Sc6)
  const formatMovesHistory = (history: string[]) => {
    if (history.length === 0) return <p className="no-moves">Brak ruchów</p>
    
    const moves = []
    for (let i = 0; i < history.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1
      const whiteMove = convertToPolishNotation(history[i])
      const blackMove = history[i + 1] ? convertToPolishNotation(history[i + 1]) : null
      
      moves.push(
        <div key={moveNumber} className="move-pair">
          <span className="move-number">{moveNumber}.</span>
          <span className="white-move">{whiteMove}</span>
          {blackMove && <span className="black-move">{blackMove}</span>}
        </div>
      )
    }
    
    return moves
  }



  // Analyze position for Stockfish when it's AI turn
  useEffect(() => {
    if (gameStarted && stockfishReady && !isCurrentlyPlayerTurn() && !gameState.isGameOver && !isAiThinking) {
      console.log(`🤖 Stockfish analyzing position (ELO ${eloLevel})...`)
      analyzePosition(game.fen(), 20, eloLevel)
    }
  }, [gameStarted, stockfishReady, game, gameState.isGameOver, playerColor, eloLevel, analyzePosition, isAiThinking])

  // Make Stockfish move when analysis is ready
  useEffect(() => {
    if (gameStarted && analysis?.bestMove && !isCurrentlyPlayerTurn() && !gameState.isGameOver && !isAiThinking) {
      setIsAiThinking(true)
      // Delay move for better UX
      setTimeout(() => {
        makeStockfishMove()
      }, 1000)
    }
  }, [analysis, gameStarted, gameState.isGameOver, isAiThinking])

  const makeMove = (sourceSquare: string, targetSquare: string) => {
    // Only allow moves on player's turn
    if (!gameStarted || !isCurrentlyPlayerTurn()) return false
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
      
      // Clear saved game when game ends  
      if (gameCopy.isGameOver()) {
        localStorage.removeItem('chess-game-state')
      }
    }
    
    return result !== null
  }

  const startGame = () => {
    const newGame = new Chess()
    setGame(newGame)
    setGameState({
      fen: newGame.fen(),
      history: [],
      isGameOver: false,
      winner: null
    })
    setGameStarted(true)
    
    // If player chose black, let Stockfish make first move
    // Turn logic is handled by isCurrentlyPlayerTurn() function
  }

  const surrenderGame = () => {
    setGameState({
      ...gameState,
      isGameOver: true,
      winner: `${playerColor === 'white' ? 'Czarne' : 'Białe'} wygrały przez poddanie!`
    })
    localStorage.removeItem('chess-game-state') // Clear saved game when surrendering
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
    setGameStarted(false)
    setIsAiThinking(false)
    localStorage.removeItem('chess-game-state') // Clear saved game
  }

  return (
    <div className="tab-content">
      <h2>♟️ Rozgrywka vs Stockfish</h2>
      
      {!gameStarted ? (
        <div className="game-setup">
          <h3>Konfiguracja gry</h3>
          
          <div className="setup-options">
            <div className="color-selection">
              <label><strong>Wybierz kolor:</strong></label>
              <div className="color-buttons">
                <button 
                  onClick={() => setPlayerColor('white')}
                  className={playerColor === 'white' ? 'active' : ''}
                >
                  ⚪ Białe
                </button>
                <button 
                  onClick={() => setPlayerColor('black')}
                  className={playerColor === 'black' ? 'active' : ''}
                >
                  ⚫ Czarne
                </button>
              </div>
            </div>
            
            <div className="difficulty-selection">
              <label><strong>🎯 Poziom gry (ELO):</strong></label>
              <select value={eloLevel} onChange={(e) => setEloLevel(Number(e.target.value))}>
                <option value={1000}>1000 ELO - Początkujący</option>
                <option value={1500}>1500 ELO - Amatorski</option>
                <option value={2000}>2000 ELO - Zaawansowany</option>
                <option value={2500}>2500 ELO - Międzyczat</option>
                <option value={3000}>3000 ELO - Mistrz</option>
              </select>
            </div>
            
            <button onClick={startGame} className="start-game-button" disabled={!stockfishReady}>
              {stockfishReady ? '🚀 Rozpocznij grę' : '⏳ Ładowanie Stockfish...'}
            </button>
          </div>
        </div>
      ) : (
        <div className="game-section">
          <div className="game-info">
            <p><strong>Grasz jako:</strong> {playerColor === 'white' ? '⚪ Białe' : '⚫ Czarne'}</p>
            <p><strong>Tura:</strong> {isCurrentlyPlayerTurn() ? 'Twoja' : isAiThinking ? 'Stockfish myśli...' : 'Stockfish'}</p>
          </div>
          
          <div className="game-layout">
            <div className="board-container">
              <Chessboard 
                position={gameState.fen}
                onPieceDrop={makeMove}
                boardOrientation={playerColor}
                areArrowsAllowed={true}
              />
            </div>
            
            <div className="moves-panel">
              <h3>📝 Historia ruchów</h3>
              <div className="moves-list">
                {formatMovesHistory(gameState.history)}
              </div>
            </div>
          </div>
          
          <div className="game-controls">
            {gameState.isGameOver && (
              <div className="game-over">
                <h3>🎯 Gra zakończona!</h3>
                <p><strong>Wynik:</strong> {gameState.winner}</p>
              </div>
            )}
            
            <div className="game-buttons">
              <button onClick={resetGame} className="reset-button">
                🔄 Nowa gra
              </button>
              {!gameState.isGameOver && (
                <button onClick={surrenderGame} className="surrender-button">
                  🏳️ Poddaj się
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}