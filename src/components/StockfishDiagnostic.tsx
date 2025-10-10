import React, { useEffect, useState } from 'react'

export const StockfishDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<string[]>([])

  useEffect(() => {
    const logs: string[] = []
    
    // Check if Stockfish is available
    logs.push(`Window object: ${typeof window}`)
    logs.push(`Stockfish function: ${typeof (window as any)?.Stockfish}`)
    
    // Try to create Stockfish instance
    if ((window as any)?.Stockfish) {
      try {
        const engine = (window as any).Stockfish()
        logs.push(`Stockfish engine type: ${typeof engine}`)
        logs.push(`Engine is Promise: ${engine && typeof engine.then === 'function'}`)
        logs.push(`Engine has postMessage: ${engine && typeof engine.postMessage === 'function'}`)
        logs.push(`Engine has onmessage: ${engine && engine.onmessage !== undefined}`)
      } catch (err) {
        logs.push(`Error creating engine: ${err}`)
      }
    } else {
      logs.push('Stockfish not available on window')
    }
    
    setDiagnostics(logs)
  }, [])

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      width: '300px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <h4>Stockfish Diagnostic</h4>
      {diagnostics.map((log, index) => (
        <div key={index} style={{ marginBottom: '5px' }}>
          {log}
        </div>
      ))}
    </div>
  )
}