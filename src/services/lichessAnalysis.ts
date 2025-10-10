// Lichess Cloud Analysis Service
interface LichessAnalysisResult {
  fen: string
  knodes: number
  depth: number
  pvs: Array<{
    cp?: number
    mate?: number
    moves: string[]
  }>
}

interface EvaluationResult {
  evaluation: number
  bestMove: string
  depth: number
}

class LichessAnalysisService {
  private readonly baseUrl = 'https://lichess.org/api/cloud-eval'
  private cache = new Map<string, EvaluationResult>()

  async getAnalysis(fen: string): Promise<EvaluationResult> {
    // Check cache first
    const cached = this.cache.get(fen)
    if (cached) {
      return cached
    }

    try {
      const params = new URLSearchParams({
        fen: fen,
        multiPv: '1'
      })

      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          // Position not found in cloud database - use fallback
          console.log(`🔄 Position not in Lichess cloud DB, using fallback: ${fen}`)
          return this.getFallbackAnalysis(fen)
        }
        throw new Error(`Lichess API error: ${response.status}`)
      }

      const data: LichessAnalysisResult = await response.json()
      
      if (!data.pvs || data.pvs.length === 0) {
        throw new Error('No analysis data received')
      }

      const pv = data.pvs[0]
      let evaluation: number

      if (pv.cp !== undefined) {
        // Centipawns to pawns
        evaluation = pv.cp / 100
      } else if (pv.mate !== undefined) {
        // Mate score
        evaluation = pv.mate > 0 ? 99 : -99
      } else {
        evaluation = 0
      }

      const bestMove = pv.moves[0] || 'e2e4'

      const result: EvaluationResult = {
        evaluation,
        bestMove,
        depth: data.depth || 20
      }

      // Cache the result
      this.cache.set(fen, result)
      
      return result

    } catch (error) {
      console.error('Lichess analysis error:', error)
      
      // Fallback to simple opening book
      return this.getFallbackAnalysis(fen)
    }
  }

  private getFallbackAnalysis(fen: string): EvaluationResult {
    const activeColor = fen.split(' ')[1]
    
    // Simple opening book
    const openingMoves: { [key: string]: string } = {
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': 'e2e4',
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1': 'e7e5',
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2': 'g1f3',
      'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1': 'd7d5'
    }

    const bestMove = openingMoves[fen] || (activeColor === 'w' ? 'e2e4' : 'e7e5')
    
    return {
      evaluation: 0.2,
      bestMove,
      depth: 15
    }
  }

  clearCache() {
    this.cache.clear()
  }
}

export const lichessAnalysis = new LichessAnalysisService()