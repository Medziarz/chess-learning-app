import { useState, useEffect, useRef } from 'react'
import { evaluationCache } from '../utils/evaluationCache'

interface StockfishHook {
  isReady: boolean
  isThinking: boolean
  bestMove: string | null
  evaluation: number | null
  getBestMove: (fen: string, depth?: number) => void
  getEvaluation: (fen: string, depth?: number) => void
  stopThinking: () => void
}

export const useStockfish = (): StockfishHook => {
  const [isReady, setIsReady] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [bestMove, setBestMove] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<number | null>(null)
  const engineRef = useRef<any>(null)
  const currentPositionRef = useRef<string>('')
  const currentEvalRef = useRef<number | null>(null)
  const currentMoveRef = useRef<string | null>(null)

  useEffect(() => {
    const initStockfish = async () => {
      try {
        console.log('Initializing Stockfish...')
        let engine: any = null
        
        const setupEngine = (eng: any) => {
          if (!eng) {
            console.error('Engine is null, cannot setup')
            return
          }
          
          console.log('Setting up engine...')
          engineRef.current = eng
          
          // Obsługa wiadomości od silnika
          eng.onmessage = (event: any) => {
            const message = event.data || event
            console.log('Stockfish message:', message)

            if (typeof message === 'string') {
              if (message.includes('uciok')) {
                console.log('UCI OK received')
                setIsReady(true)
              }
              
              if (message.includes('bestmove')) {
                const move = message.split(' ')[1]
                setBestMove(move)
                setIsThinking(false)
                currentMoveRef.current = move
                
                // Save to cache if we have both evaluation and best move
                if (currentPositionRef.current && currentEvalRef.current !== null && move) {
                  evaluationCache.set(currentPositionRef.current, {
                    evaluation: currentEvalRef.current,
                    bestMove: move,
                    depth: 8,
                    timestamp: Date.now()
                  })
                  console.log('Saved evaluation to cache for position')
                }
              }
              
              if (message.includes('info') && message.includes('score')) {
                // Parsuj evaluation
                const scoreMatch = message.match(/score (cp|mate) (-?\d+)/)
                if (scoreMatch) {
                  let evalValue: number
                  if (scoreMatch[1] === 'cp') {
                    // Centipawns to pawns
                    evalValue = parseInt(scoreMatch[2]) / 100
                  } else if (scoreMatch[1] === 'mate') {
                    // Mate score
                    const mateIn = parseInt(scoreMatch[2])
                    evalValue = mateIn > 0 ? 99 : -99
                  } else {
                    return
                  }
                  setEvaluation(evalValue)
                  currentEvalRef.current = evalValue
                }
              }
            }
          }

          // Inicjalizacja UCI z opóźnieniem dla kompatybilności
          const initializeUCI = () => {
            try {
              if (typeof eng.postMessage === 'function') {
                eng.postMessage('uci')
                eng.postMessage('isready')
                console.log('UCI commands sent')
              } else {
                console.error('postMessage is not available on engine')
              }
            } catch (err) {
              console.error('Error sending UCI commands:', err)
            }
          }
          
          // Some engines need a small delay before they're ready
          setTimeout(initializeUCI, 100)
        }

        const loadStockfishScript = (url: string): Promise<void> => {
          return new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = url
            script.onload = () => resolve()
            script.onerror = () => reject(new Error(`Failed to load ${url}`))
            document.head.appendChild(script)
          })
        }

        const checkStockfish = async () => {
          try {
            console.log('Checking for Stockfish... window:', typeof window)
            console.log('Stockfish object:', typeof (window as any)?.Stockfish)
            
            // Próba 1: Już załadowany Stockfish
            if (typeof window !== 'undefined' && (window as any).Stockfish) {
              console.log('Stockfish found on window, creating engine...')
              try {
                let stockfishEngine = (window as any).Stockfish()
                console.log('Stockfish engine created:', stockfishEngine)
                
                // Handle different Stockfish versions
                if (stockfishEngine && typeof stockfishEngine.then === 'function') {
                  console.log('Stockfish returned a Promise, awaiting...')
                  try {
                    engine = await stockfishEngine
                    console.log('Resolved Stockfish engine:', engine)
                  } catch (promiseErr) {
                    console.log('Promise rejected, falling back to direct usage:', promiseErr)
                    engine = stockfishEngine
                  }
                } else if (stockfishEngine) {
                  engine = stockfishEngine
                }
                
                // Validate engine
                if (engine && typeof engine.postMessage === 'function') {
                  console.log('Engine has postMessage, setting up...')
                  setupEngine(engine)
                  return true
                } else if (engine) {
                  console.log('Engine exists but no postMessage, checking for onmessage...')
                  // Some versions might use different interface
                  if (typeof engine.onmessage !== 'undefined') {
                    setupEngine(engine)
                    return true
                  }
                }
                
                console.error('Engine validation failed - no postMessage method')
              } catch (err) {
                console.error('Error creating Stockfish engine:', err)
              }
            }
            
            // Próba 2: Alternatywny CDN
            console.log('Trying alternative CDN sources...')
            const cdnUrls = [
              'https://cdnjs.cloudflare.com/ajax/libs/stockfish/10.0.2/stockfish.min.js',
              'https://unpkg.com/stockfish@10.0.2/src/stockfish.js',
              'https://cdn.skypack.dev/stockfish@10.0.2'
            ]
            
            for (const url of cdnUrls) {
              try {
                console.log(`Trying to load from: ${url}`)
                await loadStockfishScript(url)
                
                if ((window as any).Stockfish) {
                  const stockfishEngine = (window as any).Stockfish()
                  if (stockfishEngine && typeof stockfishEngine.then === 'function') {
                    try {
                      engine = await stockfishEngine
                    } catch {
                      engine = stockfishEngine
                    }
                  } else {
                    engine = stockfishEngine
                  }
                  
                  if (engine && (typeof engine.postMessage === 'function' || engine.onmessage !== undefined)) {
                    setupEngine(engine)
                    return true
                  }
                }
              } catch (e) {
                console.log(`Failed to load from ${url}:`, e)
                continue
              }
            }
            
            console.log('No Stockfish implementation could be loaded')
          } catch (err) {
            console.error('Error creating Stockfish engine:', err)
          }
          return false
        }

        // Próba bezpośrednia
        const initialCheck = await checkStockfish()
        if (!initialCheck) {
          // Czekamy z timeout
          let attempts = 0
          const interval = setInterval(async () => {
            attempts++
            console.log(`Attempting to load Stockfish... (${attempts}/50)`)
            
            const success = await checkStockfish()
            if (success || attempts > 50) {
              clearInterval(interval)
              
              if (!engine && attempts > 50) {
                console.log('Stockfish not available after 50 attempts, using mock...')
                
                // Funkcja do generowania oceny na podstawie FEN
                const getMockEvaluation = (fen: string) => {
                  const fenParts = fen.split(' ')
                  const position = fenParts[0]
                  const activeColor = fenParts[1] // 'w' dla białych, 'b' dla czarnych
                  
                  const hash = position.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                  const evaluation = ((hash % 200) - 100) // Losowa ocena od -100 do +100 centipawnów
                  
                  // Ruchy dla białych i czarnych oddzielnie
                  const whiteMoves = ['e2e4', 'd2d4', 'g1f3', 'f1c4', 'b1c3', 'c2c4', 'f2f4', 'd2d3', 'e2e3', 'g2g3']
                  const blackMoves = ['e7e5', 'd7d5', 'b8c6', 'g8f6', 'f8c5', 'c7c5', 'f7f5', 'd7d6', 'e7e6', 'g7g6']
                  
                  // Wybierz odpowiednie ruchy w zależności od tego kto ma ruch
                  const availableMoves = activeColor === 'w' ? whiteMoves : blackMoves
                  const bestMove = availableMoves[hash % availableMoves.length]
                  
                  return { evaluation, bestMove }
                }
                
                let currentPosition = ''
                
                // Mock engine do testów z symulacją analizy
                engine = {
                  postMessage: (msg: string) => {
                    console.log('Mock Stockfish:', msg)
                    
                    // Przechwyć pozycję FEN
                    if (msg.includes('position fen ')) {
                      currentPosition = msg.replace('position fen ', '')
                    }
                    
                    // Symuluj odpowiedź na analizę
                    if (msg.includes('go movetime') || msg.includes('go depth')) {
                      setTimeout(() => {
                        if (engine && engine.onmessage && currentPosition) {
                          const { evaluation, bestMove } = getMockEvaluation(currentPosition)
                          
                          // Symuluj info o analizie z realną oceną
                          engine.onmessage({ data: `info depth 8 score cp ${evaluation} nodes 5000 time 800 pv ${bestMove}` })
                          setTimeout(() => {
                            // Symuluj najlepszy ruch
                            if (engine && engine.onmessage) {
                              engine.onmessage({ data: `bestmove ${bestMove}` })
                            }
                          }, 700)
                        }
                      }, 300)
                    }
                  },
                  onmessage: null,
                  terminate: () => console.log('Mock terminated')
                }
                setupEngine(engine)
                
                // Symulacja odpowiedzi UCI dla mock
                setTimeout(() => {
                  if (engine && engine.onmessage) {
                    engine.onmessage({ data: 'uciok' })
                    setTimeout(() => {
                      if (engine && engine.onmessage) {
                        engine.onmessage({ data: 'readyok' })
                      }
                    }, 100)
                  }
                }, 500)
              }
            }
          }, 100)
        }
        
      } catch (error) {
        console.error('Błąd inicjalizacji Stockfish:', error)
      }
    }

    initStockfish()

    return () => {
      if (engineRef.current) {
        try {
          engineRef.current.terminate?.()
        } catch (err) {
          console.error('Error terminating engine:', err)
        }
      }
    }
  }, [])

  const getBestMove = (fen: string, depth: number = 10) => {
    if (!engineRef.current || !isReady) return

    setIsThinking(true)
    setBestMove(null)
    
    engineRef.current.postMessage('ucinewgame')
    engineRef.current.postMessage(`position fen ${fen}`)
    engineRef.current.postMessage(`go depth ${depth}`)
  }

  const getEvaluation = (fen: string, _depth: number = 8) => {
    if (!engineRef.current || !isReady) return

    // Check cache first
    const cached = evaluationCache.get(fen)
    if (cached) {
      console.log('Using cached evaluation for position')
      setEvaluation(cached.evaluation)
      setBestMove(cached.bestMove)
      return
    }

    setIsThinking(true)
    setEvaluation(null)
    setBestMove(null)
    
    // Track current position for cache saving
    currentPositionRef.current = fen
    currentEvalRef.current = null
    currentMoveRef.current = null
    
    try {
      engineRef.current.postMessage(`position fen ${fen}`)
      // Używamy czasu zamiast głębokości dla lepszej responsywności
      engineRef.current.postMessage(`go movetime 1500`) // 1.5 sekundy
    } catch (err) {
      console.error('Error getting evaluation:', err)
      setIsThinking(false)
    }
  }

  const stopThinking = () => {
    if (engineRef.current && isThinking) {
      engineRef.current.postMessage('stop')
      setIsThinking(false)
    }
  }

  return {
    isReady,
    isThinking,
    bestMove,
    evaluation,
    getBestMove,
    getEvaluation,
    stopThinking
  }
}