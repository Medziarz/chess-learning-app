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
  console.log('Sending request to:', apiUrl);
  console.log('Request payload:', { fen, depth });
  
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
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Server error: ${response.status} - ${errorText || response.statusText}`);
      }
      return response;
    })
      .then(async response => {
        clearTimeout(timeout);
        const result = await response.json();
        if (!isMounted) return;
        console.log('Server response:', result);
        setAnalysis({
          depth,
          score: result.eval,
          bestMove: result.output?.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/)?.[1],
          output: result.output
        });
      })
      .catch(err => {
        if (!isMounted) return;
        if (err.name === 'AbortError') {
          setError('Timeout: silnik nie odpowiedział w 30 sekund. Jeśli to pierwszy request, serwer mógł być uśpiony - spróbuj ponownie.');
        } else {
          console.error('Error details:', err);
          setError(err.message || 'Network error');
          // Po błędzie spróbujmy ponownie za 5 sekund
          setTimeout(() => {
            if (isMounted) {
              console.log('Retrying after error...');
              setError(null);
              setIsAnalyzing(true);
            }
          }, 5000);
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
