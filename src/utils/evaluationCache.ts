// Simple evaluation cache to store position evaluations
interface EvaluationResult {
  evaluation: number
  bestMove: string
  depth: number
  timestamp: number
}

class EvaluationCache {
  private cache = new Map<string, EvaluationResult>()
  private maxSize = 1000
  private maxAge = 30 * 60 * 1000 // 30 minutes

  set(fen: string, result: EvaluationResult) {
    // Clean old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(fen, { ...result, timestamp: Date.now() })
  }

  get(fen: string): EvaluationResult | null {
    const result = this.cache.get(fen)
    if (!result) return null

    // Check if entry is too old
    if (Date.now() - result.timestamp > this.maxAge) {
      this.cache.delete(fen)
      return null
    }

    return result
  }

  clear() {
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }
}

export const evaluationCache = new EvaluationCache()