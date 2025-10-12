import { useState, useCallback } from 'react'

export interface NativeStockfishAnalysis {
  depth: number
  score: number | string
  bestMove?: string
  output?: string
}

import { useEffect } from 'react'

export function useNativeStockfish(fen: string, depth: number = 15) {
  const [analysis, setAnalysis] = useState<NativeStockfishAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!fen) return;
    let isMounted = true;
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    fetch('http://localhost:3001/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fen, depth }),
      signal: controller.signal
    })
      .then(async response => {
        clearTimeout(timeout);
        const result = await response.json();
        if (!isMounted) return;
        if (response.ok) {
          setAnalysis({
            depth,
            score: result.eval,
            bestMove: result.output?.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/)?.[1],
            output: result.output
          });
        } else {
          setError(result.error || 'Unknown error');
        }
      })
      .catch(err => {
        if (!isMounted) return;
        if (err.name === 'AbortError') {
          setError('Timeout: silnik nie odpowiedział w 15 sekund');
        } else {
          setError(err.message || 'Network error');
        }
      })
      .finally(() => {
        if (isMounted) setIsAnalyzing(false);
      });
    return () => {
      isMounted = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [fen, depth]);

  return { analysis, isAnalyzing, error };
}
