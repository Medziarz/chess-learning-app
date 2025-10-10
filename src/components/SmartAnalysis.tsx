import { useState, useEffect } from 'react'
import { localStockfishService } from '../services/localStockfish'
import { lichessAnalysis } from '../services/lichessAnalysis'

interface AnalysisResult {
  evaluation: number
  bestMove: string
  depth: number
  source: 'local-stockfish' | 'lichess-cloud' | 'fallback'
}

interface SmartAnalysisProps {
  currentFen: string
  isEnabled: boolean
}

export const SmartAnalysis: React.FC<SmartAnalysisProps> = ({ currentFen, isEnabled }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLocalServerRunning, setIsLocalServerRunning] = useState(false)
  const [analysisMode, setAnalysisMode] = useState<'auto' | 'local' | 'cloud'>('auto')

  // Check if local server is running
  useEffect(() => {
    const checkServer = async () => {
      const running = await localStockfishService.isServerRunning()
      setIsLocalServerRunning(running)
      if (running && analysisMode === 'auto') {
        console.log('🔥 Local Stockfish server detected, using local analysis')
      }
    }
    
    checkServer()
    const interval = setInterval(checkServer, 10000) // Check every 10s
    return () => clearInterval(interval)
  }, [analysisMode])

  // Analyze position when FEN changes
  useEffect(() => {
    if (!isEnabled || !currentFen) return

    const analyzePosition = async () => {
      setIsLoading(true)
      
      try {
        let result: AnalysisResult
        
        if (analysisMode === 'local' || (analysisMode === 'auto' && isLocalServerRunning)) {
          // Use local Stockfish
          console.log('🔍 Using local Stockfish analysis')
          const localResult = await localStockfishService.getAnalysis(currentFen, 22)
          result = {
            ...localResult,
            source: 'local-stockfish'
          }
        } else {
          // Use Lichess Cloud API  
          console.log('🌐 Using Lichess cloud analysis')
          const cloudResult = await lichessAnalysis.getAnalysis(currentFen)
          result = {
            ...cloudResult,
            source: 'lichess-cloud'
          }
        }
        
        setAnalysis(result)
        
      } catch (error) {
        console.error('Analysis failed:', error)
        setAnalysis({
          evaluation: 0.0,
          bestMove: 'e2e4',
          depth: 10,
          source: 'fallback'
        })
      } finally {
        setIsLoading(false)
      }
    }

    analyzePosition()
  }, [currentFen, isEnabled, analysisMode, isLocalServerRunning])

  if (!isEnabled) return null

  const getEvaluationColor = (evaluation: number) => {
    if (evaluation > 1) return '#4ade80' // green
    if (evaluation > 0.5) return '#84cc16' // lime
    if (evaluation > -0.5) return '#64748b' // gray
    if (evaluation > -1) return '#f97316' // orange
    return '#ef4444' // red
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'local-stockfish': return '🖥️'
      case 'lichess-cloud': return '☁️'
      case 'fallback': return '📖'
      default: return '🔍'
    }
  }

  const getSourceName = (source: string) => {
    switch (source) {
      case 'local-stockfish': return 'Local Stockfish'
      case 'lichess-cloud': return 'Lichess Cloud'
      case 'fallback': return 'Opening Book'
      default: return 'Analysis'
    }
  }

  return (
    <div className="smart-analysis">
      {/* Analysis Mode Selector */}
      <div className="analysis-mode-selector">
        <label>Analysis Engine:</label>
        <select 
          value={analysisMode} 
          onChange={(e) => setAnalysisMode(e.target.value as any)}
          className="mode-select"
        >
          <option value="auto">🤖 Auto (Local if available)</option>
          <option value="local">🖥️ Local Stockfish Only</option>
          <option value="cloud">☁️ Lichess Cloud Only</option>
        </select>
      </div>

      {/* Server Status */}
      <div className="server-status">
        <span className={`status-indicator ${isLocalServerRunning ? 'running' : 'stopped'}`}>
          {isLocalServerRunning ? '🟢' : '🔴'}
        </span>
        <span>Local Server: {isLocalServerRunning ? 'Running' : 'Stopped'}</span>
        {!isLocalServerRunning && (
          <small className="server-hint">
            Start with: <code>npm run server</code>
          </small>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="analysis-results">
          <div className="analysis-header">
            <span className="source-badge">
              {getSourceIcon(analysis.source)} {getSourceName(analysis.source)}
            </span>
            <span className="depth-badge">Depth: {analysis.depth}</span>
          </div>
          
          <div className="evaluation-display">
            <div className="evaluation-bar-container">
              <div className="evaluation-bar">
                <div 
                  className="evaluation-fill" 
                  style={{
                    width: `${Math.max(0, Math.min(100, (analysis.evaluation + 5) * 10))}%`,
                    backgroundColor: getEvaluationColor(analysis.evaluation)
                  }}
                />
              </div>
              <div className="evaluation-text">
                <strong>{analysis.evaluation > 0 ? '+' : ''}{analysis.evaluation.toFixed(2)}</strong>
              </div>
            </div>
            
            <div className="best-move">
              <label>Best Move:</label>
              <span className="move-notation">{analysis.bestMove}</span>
            </div>
          </div>
          
          {isLoading && (
            <div className="analysis-loading">
              <span className="loading-spinner">🔄</span>
              Analyzing position...
            </div>
          )}
        </div>
      )}
    </div>
  )
}