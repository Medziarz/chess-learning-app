import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useNativeStockfish } from '../hooks/useNativeStockfish';

export function Analiza() {
  const [game, setGame] = useState(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [analysisHistory, setAnalysisHistory] = useState<string[]>([]);
  const [depth, setDepth] = useState(20);
  const [displayAnalysis, setDisplayAnalysis] = useState<{ score: any; bestMove: string | null } | null>(null);
  const fenRef = useRef(game.fen());

  // Hook do analizy pozycji przez backend z wybraną głębią
  const { analysis, error } = useNativeStockfish(game.fen(), depth);

  // Request next depth only after analysis for current depth is received
  useEffect(() => {
    if (depth < 100 && analysis) {
      let delay;
      if (depth < 25) {
        delay = 100;
      } else {
        const base = 500;
        const factor = 50;
        delay = base + factor * Math.pow(depth - 20, 2);
      }
      const timer = setTimeout(() => setDepth(depth + 1), delay);
      return () => clearTimeout(timer);
    }
  }, [analysis, depth, fenRef.current]);

  // Aktualizuj wyświetlaną analizę od głębi 20, a potem tylko jeśli wynik się zmieni
  useEffect(() => {
    if (analysis && depth >= 20) {
      // Only update if new analysis is different
      if (!displayAnalysis || displayAnalysis.score !== analysis.score || displayAnalysis.bestMove !== analysis.bestMove) {
        setDisplayAnalysis({ score: analysis.score, bestMove: analysis.bestMove ?? null });
      }
      // Do NOT clear displayAnalysis between depths
    }
  }, [analysis, depth]);

  // Resetuj głębię i ewaluację po ruchu lub cofnięciu
  useEffect(() => {
    fenRef.current = game.fen();
    setDepth(20);
    setDisplayAnalysis(null);
  }, [game.fen()]);

  // Najlepszy ruch w notacji szachowej
  function getSanBestMove() {
    if (!displayAnalysis?.bestMove) return '—';
    const bestMove = displayAnalysis.bestMove;
    const tempGame = new Chess(game.fen());
    const legalMoves = tempGame.moves({ verbose: true });
    const moveObj = bestMove
      ? legalMoves.find(m => m.from === bestMove.slice(0, 2) && m.to === bestMove.slice(2, 4))
      : null;
    if (moveObj) {
      return moveObj.san;
    }
    // Jeśli ruch nielegalny, zwróć UCI
    return bestMove ?? '—';
  }

  // Obsługa ruchu na szachownicy
  function onPieceDrop(sourceSquare: string, targetSquare: string) {
    const newGame = new Chess(game.fen());
    const move = newGame.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
    if (move) {
      setGame(newGame);
      setCurrentMoveIndex(currentMoveIndex + 1);
      setAnalysisHistory([...analysisHistory, move.san]);
      return true;
    }
    return false;
  }

  function goToMove(index: number) {
    const tempGame = new Chess();
    for (let i = 0; i <= index && i < analysisHistory.length; i++) {
      tempGame.move(analysisHistory[i]);
    }
    setGame(tempGame);
    setCurrentMoveIndex(index);
  }

  // Strzałka dla najlepszego ruchu
  const bestMoveArrow = displayAnalysis?.bestMove && displayAnalysis.bestMove.length === 4
    ? ([
        [displayAnalysis.bestMove.slice(0, 2), displayAnalysis.bestMove.slice(2, 4), '#6ee96e'] // lighter green
      ])
    : [];

  return (
    <div className="analysis-container">
      {/* Panel szachownicy */}
      <div className="analysis-panel">
        <h3>♛ Pozycja na szachownicy</h3>
        <Chessboard
          position={game.fen()}
          boardWidth={400}
          onPieceDrop={onPieceDrop}
          customArrows={bestMoveArrow as any}
          areArrowsAllowed={true}
        />
        <div style={{ marginTop: 12 }}>
          <span>Głębia analizy: {depth}</span>
          <pre style={{ fontSize: 12, color: 'gray' }}>bestMoveArrow: {JSON.stringify(bestMoveArrow)}</pre>
        </div>
      </div>
      {/* Panel ewaluacji silnika */}
      <div className="analysis-panel">
        <h3>🧠 Ewaluacja silnika</h3>
        <div className="panel-content">
          <div className="engine-status">
            <span className="engine-type">Stockfish Native (backend)</span>
          </div>
          <div className="current-fen">
            <span className="fen-label">FEN:</span>
            <span className="fen-value">{game.fen()}</span>
          </div>
          <div className="evaluation-display">
            {displayAnalysis ? (
              <>
                <div className="eval-score">
                  <span className="eval-value">{
                    typeof displayAnalysis.score === 'number'
                      ? parseFloat(displayAnalysis.score.toFixed(1)).toString()
                      : (typeof displayAnalysis.score === 'string' && !isNaN(Number(displayAnalysis.score))
                          ? parseFloat(Number(displayAnalysis.score).toFixed(1)).toString()
                          : displayAnalysis.score ?? '—')
                  }</span>
                  <span className="eval-label">Ewaluacja silnika</span>
                </div>
                <div className="best-move">
                  <span className="best-move-label">Najlepszy ruch:</span>
                  <span className="best-move-value">{getSanBestMove()}</span>
                </div>
              </>
            ) : (
              <div className="loading-analysis">Analiza trwa...</div>
            )}
          </div>
          {error && <div style={{ color: 'red' }}>Błąd analizy: {error}</div>}
        </div>
      </div>
      {/* Panel historii ruchów */}
      <div className="analysis-panel">
        <h3>📝 Historia ruchów</h3>
        <div className="moves-navigation-buttons">
          <button onClick={() => goToMove(-1)} disabled={currentMoveIndex <= -1}>⏮️ Start</button>
          <button onClick={() => goToMove(currentMoveIndex - 1)} disabled={currentMoveIndex <= -1}>⏪ Poprzedni</button>
          <button onClick={() => goToMove(currentMoveIndex + 1)} disabled={currentMoveIndex >= analysisHistory.length - 1}>⏩ Następny</button>
          <button onClick={() => goToMove(analysisHistory.length - 1)} disabled={currentMoveIndex >= analysisHistory.length - 1}>⏭️ Koniec</button>
        </div>
        <div className="moves-list">
          {analysisHistory.length === 0 ? (
            <p>Brak ruchów do analizy</p>
          ) : (
            <div className="moves-pgn">
              {analysisHistory.map((move, idx) => (
                <span key={idx}>
                  {idx % 2 === 0 && <span className="move-number">{Math.floor(idx / 2) + 1}.</span>}
                  <button
                    className={`move-notation ${idx === currentMoveIndex ? 'current-move' : ''}`}
                    onClick={() => goToMove(idx)}
                  >
                    {move}
                  </button>
                  {idx % 2 === 1 && ' '}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}