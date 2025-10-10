import { useState, useCallback } from 'react'
import { lichessAnalysis } from '../services/lichessAnalysis'

interface CloudAnalysisHook {
  isAnalyzing: boolean
  evaluation: number | null
  bestMove: string | null
  depth: number | null
  error: string | null
  analyzePosition: (fen: string) => Promise<void>
  clearError: () => void
}

export const useCloudAnalysis = (): CloudAnalysisHook => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [evaluation, setEvaluation] = useState<number | null>(null)
  const [bestMove, setBestMove] = useState<string | null>(null)
  const [depth, setDepth] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzePosition = useCallback(async (fen: string) => {
    if (isAnalyzing) return // Prevent multiple simultaneous requests

    setIsAnalyzing(true)
    setError(null)

    try {
      console.log('🔍 Analyzing position with Lichess API:', fen)
      const result = await lichessAnalysis.getAnalysis(fen)
      
      console.log('✅ Analysis result:', result)
      setEvaluation(result.evaluation)
      setBestMove(result.bestMove)
      setDepth(result.depth)
      
    } catch (err) {
      console.error('❌ Analysis failed:', err)
      setError(err instanceof Error ? err.message : 'Analysis failed')
      
      // Set fallback values
      setEvaluation(0)
      setBestMove('e2e4')
      setDepth(10)
    } finally {
      setIsAnalyzing(false)
    }
  }, [isAnalyzing])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isAnalyzing,
    evaluation,
    bestMove,
    depth,
    error,
    analyzePosition,
    clearError
  }
}