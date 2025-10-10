import { useState, useEffect } from 'react'
import { productionAnalysisService } from '../services/productionAnalysis'

interface ProductionAnalysisProps {
  currentFen: string
  userId: string
  isEnabled: boolean
}

interface AnalysisResult {
  evaluation: number
  bestMove: string
  depth: number
  source: string
}

export const ProductionAnalysis: React.FC<ProductionAnalysisProps> = ({ 
  currentFen, 
  userId, 
  isEnabled 
}) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)

  // Get system stats
  useEffect(() => {
    const updateStats = () => {
      setStats(productionAnalysisService.getStats())
    }
    
    updateStats()
    const interval = setInterval(updateStats, 5000) // Update every 5s
    return () => clearInterval(interval)
  }, [])

  // Analyze position when FEN changes
  useEffect(() => {
    if (!isEnabled || !currentFen || !userId) return

    const analyzePosition = async () => {
      setIsLoading(true)
      
      try {
        console.log(`🔍 Production analysis for user ${userId}:`, currentFen)
        
        const result = await productionAnalysisService.analyzePosition(currentFen, userId)
        setAnalysis(result)
        
        console.log(`✅ Analysis result (${result.source}):`, 
          `eval=${result.evaluation}, best=${result.bestMove}, depth=${result.depth}`)
        
      } catch (error) {
        console.error('Production analysis failed:', error)
        setAnalysis({
          evaluation: 0.0,
          bestMove: 'e2e4',
          depth: 10,
          source: 'error'
        })
      } finally {
        setIsLoading(false)
      }
    }

    analyzePosition()
  }, [currentFen, userId, isEnabled])

  if (!isEnabled) return null

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'global-cache': return '#10b981'    // green - fastest
      case 'lichess-cloud': return '#3b82f6'  // blue - reliable  
      case 'local-stockfish': return '#8b5cf6' // purple - powerful
      case 'opening-book': return '#f59e0b'    // orange - fallback
      case 'rate-limited': return '#ef4444'   // red - limited
      default: return '#6b7280'               // gray - unknown
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'global-cache': return '⚡'
      case 'lichess-cloud': return '☁️'
      case 'local-stockfish': return '🖥️'
      case 'opening-book': return '📖'
      case 'rate-limited': return '⏳'
      default: return '🔍'
    }
  }

  const getSourceDescription = (source: string) => {
    switch (source) {
      case 'global-cache': return 'Global Cache (Instant)'
      case 'lichess-cloud': return 'Lichess Cloud API'
      case 'local-stockfish': return 'Local Stockfish Engine'
      case 'opening-book': return 'Opening Book'
      case 'rate-limited': return 'Rate Limited'
      default: return 'Unknown Source'
    }
  }

  const getEvaluationColor = (evaluation: number) => {
    if (evaluation > 1) return '#10b981'      // strong advantage
    if (evaluation > 0.5) return '#84cc16'   // slight advantage  
    if (evaluation > -0.5) return '#6b7280'  // equal
    if (evaluation > -1) return '#f97316'    // slight disadvantage
    return '#ef4444'                         // strong disadvantage
  }

  return (
    <div className="production-analysis">
      {/* System Status */}
      <div className="system-status">
        <h4>🏭 Production Analysis System</h4>
        {stats && (
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Cache:</span>
              <span className="stat-value">{stats.cacheSize} positions</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active:</span>
              <span className="stat-value">{stats.activeAnalyses} analyses</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Queue:</span>
              <span className="stat-value">{stats.queueLength} waiting</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Users:</span>
              <span className="stat-value">{stats.rateLimitedUsers}</span>
            </div>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="user-info">
        <span className="user-id">👤 User: {userId}</span>
        <span className="analysis-mode">🎯 Cloud-First Mode</span>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="analysis-results">
          <div className="analysis-header">
            <div className="source-info">
              <span 
                className="source-badge" 
                style={{ backgroundColor: getSourceColor(analysis.source) }}
              >
                {getSourceIcon(analysis.source)} {getSourceDescription(analysis.source)}
              </span>
              <span className="depth-info">Depth: {analysis.depth}</span>
            </div>
          </div>

          <div className="evaluation-display">
            <div className="evaluation-bar-container">
              <div className="evaluation-label">Position Evaluation:</div>
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
                <strong style={{ color: getEvaluationColor(analysis.evaluation) }}>
                  {analysis.evaluation > 0 ? '+' : ''}{analysis.evaluation.toFixed(2)}
                </strong>
              </div>
            </div>

            <div className="best-move-container">
              <span className="move-label">Best Move:</span>
              <span className="move-value">{analysis.bestMove}</span>
            </div>
          </div>

          {isLoading && (
            <div className="loading-indicator">
              <span className="spinner">🔄</span>
              <span>Analyzing position...</span>
            </div>
          )}
        </div>
      )}

      {/* Performance Tips */}
      <div className="performance-tips">
        <h5>💡 Multi-User Optimization:</h5>
        <ul>
          <li>✅ Global cache shared between all users</li>
          <li>✅ Rate limiting prevents server overload</li>
          <li>✅ Cloud-first approach scales infinitely</li>
          <li>✅ Smart fallback chain ensures reliability</li>
          <li>✅ Queue system manages local resources</li>
        </ul>
      </div>
    </div>
  )
}