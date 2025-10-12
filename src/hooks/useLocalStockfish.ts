import { useEffect, useRef, useCallback, useState } from 'react'

export interface LocalStockfishAnalysis {
  depth: number
  score: number
  bestMove: string
  pv: string[]
  nodes: number
  source: 'local-stockfish-sim' | 'advanced-fallback'
}

export function useLocalStockfish() {
  const workerRef = useRef<Worker | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState<LocalStockfishAnalysis | null>(null)

  // Initialize worker
  useEffect(() => {
    console.log('🏠 Initializing Local Stockfish worker...')
    
    try {
      workerRef.current = new Worker('/stockfishLocal.js')
      
      workerRef.current.onmessage = (event) => {
        const { type, data } = event.data
        
        switch (type) {
          case 'analysis':
            console.log(`📊 Local analysis depth ${data.depth}: ${data.score.toFixed(2)} (${data.source})`)
            setCurrentAnalysis({
              depth: data.depth,
              score: data.score,
              bestMove: data.bestMove,
              pv: data.pv || [data.bestMove],
              nodes: data.nodes,
              source: data.source
            })
            break
            
          case 'bestmove':
            console.log('🎯 Local bestmove:', data)
            break
            
          case 'error':
            console.error('❌ Local Stockfish error:', data.error)
            break
            
          default:
            console.log('❓ Unknown local message:', type, data)
        }
      }

      workerRef.current.onerror = (error) => {
        console.error('💥 Local Stockfish worker error:', error)
      }

      // Initialize the engine
      workerRef.current.postMessage({ type: 'init' })
      setIsInitialized(true)
      console.log('✅ Local Stockfish worker ready')
      
    } catch (error) {
      console.error('❌ Failed to create Local Stockfish worker:', error)
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        console.log('🔄 Local Stockfish worker terminated')
      }
    }
  }, [])

  // Analyze position
  const analyzePosition = useCallback((fen: string, depth: number = 20) => {
    if (!workerRef.current || !isInitialized) {
      console.warn('⚠️ Local Stockfish not initialized yet')
      return
    }

    console.log(`🔍 Analyzing with local Stockfish: ${fen.split(' ')[0]} (depth ${depth})`)
    
    workerRef.current.postMessage({
      type: 'analyze',
      data: { fen, depth }
    })
  }, [isInitialized])

  // Stop analysis
  const stopAnalysis = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'stop' })
      console.log('⏹️ Stopped local analysis')
    }
  }, [])

  // Format evaluation for display
  const formatEvaluation = useCallback((score: number): string => {
    if (Math.abs(score) > 10) {
      return score > 0 ? '+M' : '-M' // Mate
    }
    
    const formatted = score >= 0 ? `+${score.toFixed(2)}` : score.toFixed(2)
    return formatted
  }, [])

  return {
    isInitialized,
    currentAnalysis,
    analyzePosition,
    stopAnalysis,
    formatEvaluation
  }
}