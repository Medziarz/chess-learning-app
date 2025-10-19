// Local Stockfish Analysis Server
const express = require('express')
const cors = require('cors')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = 3001

// Enable CORS for your frontend
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://localhost:5176', 
    'https://medarddahms.pl',
    'https://www.medarddahms.pl',
    'http://medarddahms.pl',
    'http://www.medarddahms.pl'
  ],
  credentials: false
}))

app.use(express.json())

class StockfishEngine {
  constructor() {
    this.engine = null
    this.isReady = false
    this.pendingRequests = new Map()
    this.requestId = 0
    this.initEngine()
  }

  initEngine() {
    try {
      // Use system stockfish
      const enginePath = '/usr/games/stockfish'
      
      if (!fs.existsSync(enginePath)) {
        throw new Error(`Stockfish not found at ${enginePath}`)
      
      console.log('🚀 Starting Stockfish engine...')
      this.engine = spawn(enginePath, [], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      this.engine.stdout.on('data', (data) => {
        this.handleEngineOutput(data.toString())
      })

      this.engine.stderr.on('data', (data) => {
        console.error('Stockfish error:', data.toString())
      })

      this.engine.on('error', (error) => {
        console.error('Failed to start Stockfish:', error.message)
        console.log('📥 Please install Stockfish:')
        console.log('   Windows: Download from https://stockfishchess.org/download/')
        console.log('   Linux: sudo apt install stockfish')
        console.log('   MacOS: brew install stockfish')
      })

      // Initialize engine
      this.sendCommand('uci')
      this.sendCommand('ucinewgame')
      
    } catch (error) {
      console.error('Engine initialization failed:', error)
    }
  }

  sendCommand(command) {
    if (this.engine && this.engine.stdin.writable) {
      console.log('→', command)
      this.engine.stdin.write(command + '\n')
    }
  }

  handleEngineOutput(output) {
    const lines = output.trim().split('\n')
    
    for (const line of lines) {
      console.log('←', line)
      
      if (line === 'uciok') {
        this.isReady = true
        console.log('✅ Stockfish engine ready!')
      }
      
      // Handle analysis results
      if (line.startsWith('info') && line.includes('pv')) {
        this.parseAnalysisLine(line)
      }
      
      if (line.startsWith('bestmove')) {
        this.handleBestMove(line)
      }
    }
  }

  parseAnalysisLine(line) {
    // Parse: info depth 20 seldepth 25 time 1000 nodes 500000 score cp 47 pv e2e4 e7e5
    const parts = line.split(' ')
    const analysis = {}
    
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === 'depth') analysis.depth = parseInt(parts[i + 1])
      if (parts[i] === 'score') {
        if (parts[i + 1] === 'cp') {
          analysis.evaluation = parseInt(parts[i + 2]) / 100
        } else if (parts[i + 1] === 'mate') {
          analysis.mate = parseInt(parts[i + 2])
          analysis.evaluation = parts[i + 2] > 0 ? 999 : -999
        }
      }
      if (parts[i] === 'pv') {
        analysis.bestMove = parts[i + 1]
        analysis.pv = parts.slice(i + 1).join(' ')
        break
      }
    }
    
    // Send to waiting requests
    this.pendingRequests.forEach((resolve, id) => {
      if (analysis.bestMove && analysis.depth >= 15) {
        resolve(analysis)
        this.pendingRequests.delete(id)
      }
    })
  }

  handleBestMove(line) {
    // Final bestmove - clean up any remaining requests
    const bestMove = line.split(' ')[1]
    this.pendingRequests.forEach((resolve, id) => {
      resolve({
        bestMove: bestMove,
        evaluation: 0.0,
        depth: 20
      })
      this.pendingRequests.delete(id)
    })
  }

  async analyzePosition(fen, depth = 20, timeLimit = 2000) {
    return new Promise((resolve, reject) => {
      if (!this.isReady) {
        return reject(new Error('Engine not ready'))
      }

      const requestId = ++this.requestId
      this.pendingRequests.set(requestId, resolve)

      // Set position and analyze
      this.sendCommand(`position fen ${fen}`)
      this.sendCommand(`go depth ${depth} movetime ${timeLimit}`)
      
      // Timeout fallback
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId)
          resolve({
            evaluation: 0.0,
            bestMove: 'e2e4',
            depth: depth,
            error: 'timeout'
          })
        }
      }, timeLimit + 1000)
    })
  }
}

// Initialize engine
const stockfish = new StockfishEngine()

// API Endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    engine: stockfish.isReady ? 'ready' : 'initializing',
    timestamp: new Date().toISOString()
  })
})

app.post('/analyze', async (req, res) => {
  try {
    const { fen, depth = 20, timeLimit = 2000 } = req.body
    
    if (!fen) {
      return res.status(400).json({ error: 'FEN position required' })
    }
    
    console.log(`🔍 Analyzing: ${fen} (depth: ${depth})`)
    
    const analysis = await stockfish.analyzePosition(fen, depth, timeLimit)
    
    res.json({
      fen: fen,
      evaluation: analysis.evaluation || 0.0,
      bestMove: analysis.bestMove || 'e2e4',
      depth: analysis.depth || depth,
      engine: 'stockfish-local',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Analysis error:', error)
    res.status(500).json({ 
      error: 'Analysis failed', 
      details: error.message 
    })
  }
})

// Batch analysis endpoint
app.post('/analyze-batch', async (req, res) => {
  try {
    const { positions } = req.body
    
    if (!Array.isArray(positions)) {
      return res.status(400).json({ error: 'Positions array required' })
    }
    
    const results = []
    
    for (const { fen, depth = 15 } of positions) {
      try {
        const analysis = await stockfish.analyzePosition(fen, depth, 1000)
        results.push({
          fen,
          evaluation: analysis.evaluation,
          bestMove: analysis.bestMove,
          depth: analysis.depth
        })
      } catch (error) {
        results.push({
          fen,
          error: error.message
        })
      }
    }
    
    res.json({ results })
    
  } catch (error) {
    res.status(500).json({ error: 'Batch analysis failed' })
  }
})

app.listen(PORT, () => {
  console.log(`🔥 Local Stockfish Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🎯 Analysis endpoint: http://localhost:${PORT}/analyze`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Stockfish server...')
  if (stockfish.engine) {
    stockfish.sendCommand('quit')
    stockfish.engine.kill()
  }
  process.exit(0)
})