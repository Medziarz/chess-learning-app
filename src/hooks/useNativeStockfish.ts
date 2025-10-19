import { useState } from 'react'

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
    // Zwiększamy timeout do 30 sekund, bo Render.com może potrzebować więcej czasu na pierwszy request
    const timeout = setTimeout(() => controller.abort(), 30000);
  const apiUrl = import.meta.env.VITE_STOCKFISH_URL || 'http://localhost:3001';
  fetch(`${apiUrl}/analyze`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
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
          setError('Timeout: silnik nie odpowiedział w 30 sekund. Jeśli to pierwszy request, serwer mógł być uśpiony - spróbuj ponownie.');
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
