import React, { useEffect, useRef } from 'react'
import { useCloudAnalysis } from '../hooks/useCloudAnalysis'

interface CloudAnalysisProps {
  currentFen: string
  isEnabled: boolean
}

export const CloudAnalysis: React.FC<CloudAnalysisProps> = ({ 
  currentFen, 
  isEnabled = true 
}) => {
  const { 
    isAnalyzing, 
    evaluation, 
    bestMove, 
    depth, 
    error, 
    analyzePosition, 
    clearError 
  } = useCloudAnalysis()
  
  const lastFenRef = useRef<string>('')

  useEffect(() => {
    if (!isEnabled) return
    if (currentFen === lastFenRef.current) return
    if (!currentFen || currentFen === 'start') return

    lastFenRef.current = currentFen
    console.log('🎯 CloudAnalysis: Analyzing new position:', currentFen)
    
    // Immediate analysis - no delays!
    analyzePosition(currentFen)
  }, [currentFen, isEnabled, analyzePosition])

  const getEvaluationDisplay = () => {
    if (evaluation === null) return '--'
    
    if (Math.abs(evaluation) > 10) {
      return evaluation > 0 ? 'White wins' : 'Black wins'
    }
    
    const sign = evaluation >= 0 ? '+' : ''
    return `${sign}${evaluation.toFixed(2)}`
  }

  const getEvaluationColor = () => {
    if (evaluation === null) return '#666'
    if (Math.abs(evaluation) > 5) return evaluation > 0 ? '#22c55e' : '#ef4444'
    if (Math.abs(evaluation) > 2) return evaluation > 0 ? '#84cc16' : '#f97316'
    return '#6b7280'
  }

  const getEvaluationBar = () => {
    if (evaluation === null) return 50
    
    // Convert evaluation to percentage (0-100)
    // Clamp between -10 and +10, then convert to 0-100 scale
    const clampedEval = Math.max(-10, Math.min(10, evaluation))
    return ((clampedEval + 10) / 20) * 100
  }

  return (
    <div className="cloud-analysis">
      <div className="analysis-header">
        <h3>⚡ Instant Analysis</h3>
        <div className="analysis-status">
          {isAnalyzing ? (
            <span className="analyzing">🔍 Analyzing...</span>
          ) : (
            <span className="ready">✅ Ready</span>
          )}
        </div>
      </div>

      {error && (
        <div className="analysis-error" onClick={clearError}>
          ❌ {error} (click to dismiss)
        </div>
      )}

      <div className="evaluation-section">
        <div className="evaluation-bar-container">
          <div 
            className="evaluation-bar"
            style={{ 
              background: `linear-gradient(to right, 
                #1f2937 0%, 
                #1f2937 ${getEvaluationBar()}%, 
                #f8fafc ${getEvaluationBar()}%, 
                #f8fafc 100%)`
            }}
          >
            <div className="evaluation-marker" style={{ left: `${getEvaluationBar()}%` }}>
              |
            </div>
          </div>
        </div>
        
        <div className="evaluation-display">
          <div className="eval-value" style={{ color: getEvaluationColor() }}>
            {getEvaluationDisplay()}
          </div>
          <div className="eval-info">
            {depth && <span>Depth: {depth}</span>}
            {bestMove && <span>Best: {bestMove}</span>}
          </div>
        </div>
      </div>


    </div>
  )
}