import { useState, useEffect, useRef, useCallback } from 'react'

export interface StockfishAnalysis {
  depth: number
  score: number | string
  nodes: number
  pv: string[]
  bestMove?: string
}

export interface UseStockfishReturn {
  analysis: StockfishAnalysis | null
  isReady: boolean
  isAnalyzing: boolean
  analyzePosition: (fen: string, depth?: number, skillLevel?: number) => void
  stopAnalysis: () => void
}

export function useStockfish(): UseStockfishReturn {
  const [analysis, setAnalysis] = useState<StockfishAnalysis | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const workerRef = useRef<Worker | null>(null)
  const currentFenRef = useRef<string>('')

  // Initialize Web Worker - Cloud Stockfish
  useEffect(() => {
    const worker = new Worker('/stockfishCloud.js')
    workerRef.current = worker
    console.log('☁️ Starting Cloud Stockfish Engine')

    // Handle messages from worker
    worker.onmessage = (e: MessageEvent) => {
      const { type, data } = e.data

      switch (type) {
        case 'ready':
          setIsReady(true)
          console.log('☁️ Cloud Stockfish engine ready!')
          break

        case 'analysis':
          console.log(`📊 Analysis depth ${data.depth}: ${data.score} (${data.source})`)
          setAnalysis({
            depth: data.depth,
            score: data.score,
            nodes: data.nodes,
            pv: data.pv,
            bestMove: data.bestMove || null
          })
          break

        case 'bestmove':
          setAnalysis(prevAnalysis => {
            if (prevAnalysis) {
              const updatedAnalysis = { ...prevAnalysis, bestMove: data }
              return updatedAnalysis
            }
            return null
          })
          setIsAnalyzing(false)
          break

        case 'error':
          console.error('☁️ Cloud engine error:', data)
          setIsAnalyzing(false)
          break
      }
    }

    // Initialize worker
    worker.postMessage({ type: 'init' })

    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'stop' })
        workerRef.current.terminate()
      }
    }
  }, [])

  const analyzePosition = useCallback((fen: string, depth: number = 22, skillLevel?: number) => {
    if (!workerRef.current || !isReady) {
      console.warn('☁️ Cloud Stockfish not ready yet')
      return
    }

    console.log(`☁️ Analyzing with Cloud Stockfish (depth: ${depth}, skill: ${skillLevel || 'max'}): ${fen.substring(0, 50)}...`)
    
    // Stop any previous analysis first
    workerRef.current.postMessage({ type: 'stop' })
    
    // Clear previous analysis and start fresh
    currentFenRef.current = fen
    setAnalysis(null)
    setIsAnalyzing(true)

    // Immediate analysis start for faster response
    setTimeout(() => {
      if (workerRef.current) {
        workerRef.current.postMessage({
          type: 'analyze',
          data: { fen, depth, skillLevel }
        })
      }
    }, 5)
  }, [isReady])

  const stopAnalysis = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'stop' })
      setIsAnalyzing(false)
    }
  }, [])

  return {
    analysis,
    isReady,
    isAnalyzing,
    analyzePosition,
    stopAnalysis
  }
}

// Helper function to format evaluation score for display
export function formatEvaluation(score: number | string): { 
  display: string, 
  advantage: 'white' | 'black' | 'equal',
  barPosition: number 
} {
  if (typeof score === 'string') {
    // Mate score
    const isWhiteMate = score.startsWith('M') && !score.startsWith('M-')
    return {
      display: score,
      advantage: isWhiteMate ? 'white' : 'black',
      barPosition: isWhiteMate ? 100 : 0
    }
  }

  // Numerical evaluation
  const advantage = score > 0.1 ? 'white' : score < -0.1 ? 'black' : 'equal'
  const display = score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)
  
  // Convert score to percentage for evaluation bar (clamped between 10% and 90%)
  const barPosition = Math.max(10, Math.min(90, 50 + (score * 10)))

  return { display, advantage, barPosition }
}