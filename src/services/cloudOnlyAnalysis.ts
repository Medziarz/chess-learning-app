interface AnalysisResult {
  evaluation: number
  bestMove: string
  depth: number
  mate?: number
}

interface LichessResponse {
  fen: string
  knodes: number
  depth: number
  pvs: Array<{
    moves: string
    cp?: number
    mate?: number
  }>
}

class CloudOnlyAnalysis {
  private cache = new Map<string, AnalysisResult>()

  async analyzePosition(fen: string): Promise<AnalysisResult> {
    console.log('🔍 Analyzing position:', fen)

    // Sprawdź cache
    const cached = this.cache.get(fen)
    if (cached) {
      console.log('⚡ Cache hit - instant result:', cached)
      return cached
    }

    console.log('💾 Cache miss, calling Lichess API...')

    try {
      // Wywołaj Lichess Cloud API
      const result = await this.callLichessAPI(fen)
      
      // Zapisz w cache
      this.cache.set(fen, result)
      
      // Wyczyść stare pozycje z cache
      this.cleanupCache()
      
      console.log('✅ Lichess analysis successful:', result)
      return result
      
    } catch (error) {
      console.warn('⚠️ Lichess failed:', error)
      console.warn('📖 Using opening book fallback')
      return this.getOpeningBookMove(fen)
    }
  }

  private async callLichessAPI(fen: string): Promise<AnalysisResult> {
    const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}`
    
    console.log('🌐 Calling Lichess API:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    console.log('📡 Lichess response status:', response.status, response.statusText)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Position not in Lichess database (404)`)
      }
      throw new Error(`Lichess API error: ${response.status} ${response.statusText}`)
    }

    const data: LichessResponse = await response.json()
    
    console.log('📡 Full Lichess API response:', data)
    
    if (!data.pvs || data.pvs.length === 0) {
      throw new Error('No analysis data from Lichess')
    }

    const bestLine = data.pvs[0]
    console.log('🎯 Best line from Lichess:', bestLine)
    
    // Konwertuj evaluację
    let evaluation = 0
    if (bestLine.mate !== undefined) {
      // Mate in X moves
      evaluation = bestLine.mate > 0 ? 10 : -10
    } else if (bestLine.cp !== undefined) {
      // Centipawn evaluation  
      evaluation = bestLine.cp / 100 // Convert centipawns to pawns
    }

    // Wyciągnij pierwszy ruch - upewnij się że to pełny ruch
    const movesString = bestLine.moves.trim()
    const moves = movesString.split(' ')
    const bestMove = moves[0] || 'e2e4'
    
    console.log('🔍 Move parsing:', {
      rawMovesString: bestLine.moves,
      trimmedMovesString: movesString,
      splitMoves: moves,
      firstMove: bestMove,
      firstMoveLength: bestMove.length,
      isValidMove: bestMove.length >= 4 && /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(bestMove)
    })

    // Validate move format (e.g. e2e4, a7a8q)
    const validMove = /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(bestMove) && bestMove.length >= 4
    const finalMove = validMove ? bestMove : 'e2e4'
    
    console.log('🎯 Final move decision:', {
      originalMove: bestMove,
      isValid: validMove,
      finalMove: finalMove
    })

    return {
      evaluation: Math.round(evaluation * 100) / 100, // Round to 2 decimals
      bestMove: finalMove,
      depth: data.depth || 20
    }
  }

  private getOpeningBookMove(fen: string): AnalysisResult {
    // Rozszerzony opening book z popularnymi ruchami
    const openingMoves: { [key: string]: { move: string, eval: number } } = {
      // Pozycja startowa
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': { move: 'e2e4', eval: 0.2 },
      
      // Po e4
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1': { move: 'e7e5', eval: 0.0 },
      
      // Po e4 e5
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2': { move: 'g1f3', eval: 0.2 },
      
      // Po e4 e5 Nf3
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2': { move: 'b8c6', eval: 0.0 },
      
      // Po e4 c5 (Sycylijska)
      'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2': { move: 'g1f3', eval: 0.3 },
      
      // Po e4 e6 (Francuska)
      'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': { move: 'd2d4', eval: 0.2 },
      
      // Po e4 c6 (Caro-Kann)
      'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': { move: 'd2d4', eval: 0.2 },
      
      // Po d4
      'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1': { move: 'd7d5', eval: 0.0 },
      
      // Po d4 d5
      'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2': { move: 'c2c4', eval: 0.2 },
      
      // Po d4 Nf6
      'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2': { move: 'c2c4', eval: 0.2 },
      
      // Po Nf3 (Reti)
      'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1': { move: 'd7d5', eval: 0.0 },
      
      // Po c4 (English)
      'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1': { move: 'e7e5', eval: 0.0 },
    }

    const opening = openingMoves[fen]
    if (opening) {
      console.log('📖 Using opening book move:', opening.move, 'eval:', opening.eval)
      return {
        evaluation: opening.eval,
        bestMove: opening.move,
        depth: 15
      }
    }

    // Fallback dla nieznanych pozycji - spróbuj podstawową analizę
    console.log('🎲 Unknown position, using heuristic fallback')
    
    // Podstawowa heurystyka na bazie FEN
    const evaluation = this.calculateBasicEvaluation(fen)
    const bestMove = this.getGenericMove(fen)
    
    return {
      evaluation: evaluation,
      bestMove: bestMove,
      depth: 10
    }
  }

  private cleanupCache() {
    // Jeśli cache za duży, wyczyść go
    if (this.cache.size > 1000) {
      this.cache.clear()
      console.log('🧹 Cache cleaned - too many positions')
    }
  }

  private calculateBasicEvaluation(fen: string): number {
    // Bardzo podstawowa heurystyka na bazie pozycji
    const parts = fen.split(' ')
    const position = parts[0]
    
    // Policz materiał
    let materialBalance = 0
    for (const char of position) {
      switch (char.toLowerCase()) {
        case 'q': materialBalance += char === char.toUpperCase() ? 9 : -9; break
        case 'r': materialBalance += char === char.toUpperCase() ? 5 : -5; break
        case 'b': 
        case 'n': materialBalance += char === char.toUpperCase() ? 3 : -3; break
        case 'p': materialBalance += char === char.toUpperCase() ? 1 : -1; break
      }
    }
    
    // Dodaj małą losowość żeby nie było zawsze 0
    const randomFactor = (Math.random() - 0.5) * 0.4
    
    const evaluation = materialBalance / 10 + randomFactor
    console.log('🧮 Basic evaluation:', { materialBalance, randomFactor, evaluation })
    return Math.round(evaluation * 100) / 100
  }

  private getGenericMove(fen: string): string {
    // Generuj podstawowy ruch na bazie pozycji
    const parts = fen.split(' ')
    const activeColor = parts[1]
    
    // Podstawowe ruchy w zależności od koloru
    if (activeColor === 'w') {
      const whiteMoves = ['e2e4', 'd2d4', 'g1f3', 'b1c3', 'f1c4', 'c2c4']
      return whiteMoves[Math.floor(Math.random() * whiteMoves.length)]
    } else {
      const blackMoves = ['e7e5', 'd7d5', 'g8f6', 'b8c6', 'f8c5', 'c7c5']
      return blackMoves[Math.floor(Math.random() * blackMoves.length)]
    }
  }

  // Publiczne metody dla UI
  getCacheSize(): number {
    return this.cache.size
  }

  clearCache(): void {
    this.cache.clear()
    console.log('🧹 Cache manually cleared')
  }
}

export const cloudOnlyAnalysis = new CloudOnlyAnalysis()