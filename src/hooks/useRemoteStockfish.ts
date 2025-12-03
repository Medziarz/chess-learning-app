import { useState, useCallback } from 'react'

export interface StockfishAnalysis {
  depth: number
  score: number | string
  nodes: number
  pv: string[]
  bestMove?: string
  elo?: number
}

export interface UseRemoteStockfishReturn {
  analysis: StockfishAnalysis | null
  isReady: boolean
  isAnalyzing: boolean
  analyzePosition: (fen: string, depth?: number, elo?: number) => Promise<void>
  stopAnalysis: () => void
  error: string | null
}

export function useRemoteStockfish(): UseRemoteStockfishReturn {
  const [analysis, setAnalysis] = useState<StockfishAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzePosition = useCallback(async (fen: string, depth: number = 20, elo?: number) => {
    if (!fen) return

    setIsAnalyzing(true)
    setError(null)
    
    try {
      const apiUrl = import.meta.env.VITE_STOCKFISH_URL || 'https://chess-learning-app.onrender.com'
      console.log(`🔍 Analyzing position with Render Stockfish at ${apiUrl}${elo ? ` (ELO: ${elo})` : ''}...`)
      
      const response = await fetch(`${apiUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fen, depth, elo }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      setAnalysis({
        depth: data.depth || depth,
        score: data.score || 0,
        nodes: data.nodes || 0,
        pv: data.pv || [data.bestMove] || [],
        bestMove: data.bestMove || null,
        elo: elo
      })

      console.log(`✅ Stockfish analysis: depth=${data.depth}, score=${data.score}, move=${data.bestMove}${elo ? `, elo=${elo}` : ''}`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      console.error(`❌ Stockfish error: ${errorMsg}`)
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false)
  }, [])

  return {
    analysis,
    isReady,
    isAnalyzing,
    analyzePosition,
    stopAnalysis,
    error
  }
}
