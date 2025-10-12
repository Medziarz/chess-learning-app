// Local Stockfish Analysis Service
interface LocalAnalysisResult {
  fen: string
  evaluation: number
  bestMove: string
  depth: number
  engine: string
  timestamp: string
  error?: string
}

interface EvaluationResult {
  evaluation: number
  bestMove: string
  depth: number
}

class LocalStockfishService {
  private baseUrl = process.env.VITE_STOCKFISH_URL || 'http://localhost:3001'
  private cache = new Map<string, EvaluationResult & { timestamp: number }>()
  private readonly CACHE_DURATION = 10 * 60 * 1000 // 10 minut - longer cache for local
  
  async getAnalysis(fen: string, depth: number = 20): Promise<EvaluationResult> {
    // Check cache first
    const cached = this.cache.get(fen)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('💾 Local cache hit for:', fen)
      return { evaluation: cached.evaluation, bestMove: cached.bestMove, depth: cached.depth }
    }

    try {
      console.log(`🔍 Local Stockfish analysis (depth ${depth}):`, fen)
      
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fen, depth, timeLimit: 3000 })
      })

      if (!response.ok) {
        if (response.status === 500) {
          console.log('⚠️ Local server error, using fallback')
          return this.getFallbackAnalysis(fen)
        }
        throw new Error(`Local server error: ${response.status}`)
      }

      const data: LocalAnalysisResult = await response.json()
      
      if (data.error) {
        console.log('⚠️ Analysis error:', data.error)
        return this.getFallbackAnalysis(fen)
      }

      const result: EvaluationResult = {
        evaluation: data.evaluation,
        bestMove: data.bestMove,
        depth: data.depth
      }

      // Cache successful result
      this.cache.set(fen, { ...result, timestamp: Date.now() })
      console.log(`✅ Local analysis (depth ${data.depth}):`, 
        `eval=${data.evaluation.toFixed(2)}, best=${data.bestMove}`)

      return result

    } catch (error) {
      console.error('Local Stockfish analysis error:', error)
      
      // Check if server is running
      try {
        const healthResponse = await fetch(`${this.baseUrl}/health`)
        if (!healthResponse.ok) {
          console.log('🚨 Local server not responding, using fallback')
        }
      } catch {
        console.log('🚨 Local server not running. Start with: npm run server')
      }
      
      return this.getFallbackAnalysis(fen)
    }
  }

  private getFallbackAnalysis(fen: string): EvaluationResult {
    // Smart fallback based on position analysis
    const parts = fen.split(' ')
    const position = parts[0]
    const activeColor = parts[1]
    const moveCount = parseInt(parts[5]) || 1
    
    // Opening principles
    let evaluation = 0.0
    let bestMove = 'e2e4' // default
    
    if (moveCount <= 3) {
      // Opening phase - central control
      evaluation = activeColor === 'w' ? 0.2 : -0.2
      bestMove = activeColor === 'w' ? 
        (moveCount === 1 ? 'e2e4' : 'd2d4') :
        (moveCount <= 2 ? 'e7e5' : 'd7d5')
    } else if (moveCount <= 15) {
      // Early middlegame
      const centralPieces = (position.match(/[nN]/g) || []).length
      const developmentBonus = centralPieces * 0.1
      evaluation = (activeColor === 'w' ? 1 : -1) * (0.1 + developmentBonus)
      
      // Suggest development moves
      const developmentMoves = ['g1f3', 'b1c3', 'f1e2', 'e1g1', 'g8f6', 'b8c6', 'f8e7', 'e8g8']
      bestMove = developmentMoves[Math.floor(Math.random() * developmentMoves.length)]
    } else {
      // Middlegame/Endgame
      const materialBalance = this.calculateMaterialBalance(position)
      evaluation = materialBalance * (activeColor === 'w' ? 1 : -1)
      bestMove = 'a2a3' // Neutral move
    }
    
    // Cache fallback too
    const result: EvaluationResult = {
      evaluation: Math.max(-5, Math.min(5, evaluation)),
      bestMove,
      depth: 10
    }
    
    this.cache.set(fen, { ...result, timestamp: Date.now() })
    
    console.log(`🎯 Fallback analysis (move ${moveCount}):`, 
      `eval=${result.evaluation.toFixed(2)}, best=${result.bestMove}`)
    
    return result
  }

  private calculateMaterialBalance(position: string): number {
    const pieceValues: { [key: string]: number } = {
      'q': 9, 'Q': 9,
      'r': 5, 'R': 5, 
      'b': 3, 'B': 3,
      'n': 3, 'N': 3,
      'p': 1, 'P': 1
    }
    
    let balance = 0
    for (const char of position) {
      if (pieceValues[char]) {
        balance += char === char.toUpperCase() ? pieceValues[char] : -pieceValues[char]
      }
    }
    
    return balance * 0.1 // Convert to evaluation units
  }

  // Check if local server is running
  async isServerRunning(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, { 
        signal: AbortSignal.timeout(2000) 
      })
      return response.ok
    } catch {
      return false
    }
  }
}

export const localStockfishService = new LocalStockfishService()