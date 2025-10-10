import { useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { CloudOnlyAnalysis } from './components/CloudOnlyAnalysis'
import './components/CloudOnlyAnalysis.css'
import './App.css'

type TabType = 'rozgrywka' | 'kalendarz' | 'profil' | 'analiza' | 'trening' | 'aktualnosci' | 'ustawienia'
type ThemeType = 'light' | 'dark'

// Typ dla zagnieżdżonego wariantu
type VariationNode = {
  move: string
  subVariations?: {[key: number]: VariationNode[]} // Sub-warianty na każdej pozycji
}

function App() {
  const [game, setGame] = useState(new Chess())
  const [analysisGame, setAnalysisGame] = useState(new Chess()) // Oddzielny stan dla analizy
  const [analysisHistory, setAnalysisHistory] = useState<string[]>([]) // Główna linia ruchów
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1) // Indeks aktualnego ruchu (-1 = pozycja startowa)
  const [variations, setVariations] = useState<{[key: number]: VariationNode[]}>({}) // Warianty dla każdego ruchu
  const [activeVariation, setActiveVariation] = useState<{startIndex: number, moves: string[], path: number[]} | null>(null) // Aktywny wariant z ścieżką
  const [activeTab, setActiveTab] = useState<TabType>('rozgrywka')
  const [theme, setTheme] = useState<ThemeType>('light')

  // Funkcja pomocnicza do uzyskania aktualnej ścieżki ruchów
  const getCurrentPath = () => {
    if (activeVariation && currentMoveIndex >= activeVariation.startIndex) {
      // Jesteśmy w wariancie
      const mainLineUpToVariation = analysisHistory.slice(0, activeVariation.startIndex)
      const variationMoves = activeVariation.moves.slice(0, currentMoveIndex - activeVariation.startIndex + 1)
      return [...mainLineUpToVariation, ...variationMoves]
    } else {
      // Jesteśmy w głównej linii
      return analysisHistory.slice(0, currentMoveIndex + 1)
    }
  }

  const makeMove = (sourceSquare: string, targetSquare: string) => {
    const gameCopy = new Chess(game.fen())
    const result = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    })
    
    if (result) {
      setGame(gameCopy)
    }
    
    return result !== null
  }

  const resetGame = () => {
    setGame(new Chess())
  }



  // Funkcje dla analizy - oddzielny stan
  const makeAnalysisMove = (sourceSquare: string, targetSquare: string) => {
    const gameCopy = new Chess(analysisGame.fen())
    const result = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    })
    
    if (result) {
      setAnalysisGame(gameCopy)
      console.log(`Wykonano ruch: ${result.san}, currentMoveIndex: ${currentMoveIndex}, activeVariation:`, activeVariation)
      
      if (activeVariation) {
        // Jesteśmy w wariancie
        const nextMoveIndex = currentMoveIndex + 1
        const nextMoveInMainLine = analysisHistory[nextMoveIndex]
        
        console.log(`W wariancie: currentMoveIndex=${currentMoveIndex}, nextMoveIndex=${nextMoveIndex}`)
        console.log(`nextMoveInMainLine='${nextMoveInMainLine}', nowy ruch='${result.san}'`)
        console.log(`activeVariation:`, activeVariation)
        console.log(`analysisHistory:`, analysisHistory)
        
        if (nextMoveInMainLine === result.san) {
          // UWAGA: To może być błędne! Sprawdzamy czy rzeczywiście to jest powrót do głównej linii
          console.log(`WYKRYTO POWRÓT DO GŁÓWNEJ LINII - czy to prawidłowe?`)
          setActiveVariation(null) // Opuszczamy wariant
          setCurrentMoveIndex(nextMoveIndex)
        } else {
          // Nowy ruch w wariancie - sprawdź czy kontynuować czy utworzyć sub-wariant
          const currentPositionInVariation = currentMoveIndex - activeVariation.startIndex
          
          // Sprawdź czy następny ruch już istnieje w obecnym wariancie
          const nextMoveInVariation = activeVariation.moves[currentPositionInVariation + 1]
          
          if (nextMoveInVariation && nextMoveInVariation === result.san) {
            // Ten sam ruch co w wariancie - przejdź dalej
            setCurrentMoveIndex(prev => prev + 1)
          } else if (nextMoveInVariation && nextMoveInVariation !== result.san) {
            // Jesteśmy w środku wariantu i robimy inny ruch - twórz sub-wariant
            console.log(`Tworzenie sub-wariantu: pozycja ${currentPositionInVariation + 1}, nowy ruch: ${result.san}, istniejący: ${nextMoveInVariation}`)
            
            // Pozycja w globalnym indeksie gdzie tworzymy sub-wariant
            const subVariationGlobalPosition = currentMoveIndex + 1
            
            // KLUCZOWE: Nie modyfikujemy istniejącego wariantu, tworzymy nowy!
            // Dodaj nowy sub-wariant do struktury variations
            setVariations(prev => {
              const newVariations = {...prev}
              
              // Dodaj sub-wariant na pozycji gdzie się rozgałęziamy
              if (!newVariations[subVariationGlobalPosition]) {
                newVariations[subVariationGlobalPosition] = []
              }
              
              const newSubVariationNode: VariationNode = {
                move: result.san
              }
              
              // Sprawdź czy taki sub-wariant już istnieje
              const existingSubVariation = newVariations[subVariationGlobalPosition].find(
                node => node.move === result.san
              )
              
              if (!existingSubVariation) {
                newVariations[subVariationGlobalPosition].push(newSubVariationNode)
                console.log(`Dodano sub-wariant: pozycja ${subVariationGlobalPosition}, ruch: ${result.san}`)
              }
              
              return newVariations
            })
            
            // Rozpocznij NOWY sub-wariant (nie modyfikuj istniejącego!)
            const newSubVariation = {
              startIndex: subVariationGlobalPosition,
              moves: [result.san],
              path: [...(activeVariation.path || [0]), 1]
            }
            setActiveVariation(newSubVariation)
            setCurrentMoveIndex(subVariationGlobalPosition)
          } else {
            // Na końcu wariantu lub brak następnego ruchu - kontynuujemy normalnie
            const newVariation = {
              ...activeVariation,
              moves: [...activeVariation.moves, result.san],
              path: activeVariation.path || [0]
            }
            setActiveVariation(newVariation)
            setCurrentMoveIndex(prev => prev + 1)
          }
        }
      } else {
        // Jesteśmy w głównej linii
        const totalMoves = analysisHistory.length
        
        if (currentMoveIndex === totalMoves - 1) {
          // Na końcu głównej linii - dodaj normalnie
          setAnalysisHistory(prev => [...prev, result.san])
          setCurrentMoveIndex(prev => prev + 1)
        } else {
          // W środku głównej linii - sprawdź czy ruch już istnieje
          const movePosition = currentMoveIndex + 1
          const existingMove = analysisHistory[movePosition]
          
          if (existingMove === result.san) {
            // Ten sam ruch co w głównej linii - przejdź do tej pozycji
            setCurrentMoveIndex(movePosition)
            // Nie trzeba zmieniać gry, już jest na właściwej pozycji
          } else {
            // Inny ruch - rozpocznij nowy wariant (GŁÓWNA LINIA POZOSTAJE NIETKNIĘTA)
            
            // Rozpocznij nowy wariant z nowym ruchem
            setActiveVariation({
              startIndex: movePosition,
              moves: [result.san],
              path: [0]
            })
            setCurrentMoveIndex(movePosition)
            
            // Dodaj nowy wariant do struktury
            setVariations(prev => {
              const newVariations = {...prev}
              if (!newVariations[movePosition]) {
                newVariations[movePosition] = []
              }
              
              const newVariationNode: VariationNode = {
                move: result.san
              }
              
              // Sprawdź czy taki wariant już istnieje
              const existingNode = newVariations[movePosition].find(node => node.move === result.san)
              if (!existingNode) {
                newVariations[movePosition].push(newVariationNode)
              }
              return newVariations
            })
          }
        }
      }
    }
    
    return result !== null
  }

  const undoAnalysisMove = () => {
    if (currentMoveIndex >= 0) {
      const newIndex = currentMoveIndex - 1
      setCurrentMoveIndex(newIndex)
      
      // Sprawdź czy wychodzimy z wariantu
      if (activeVariation && newIndex < activeVariation.startIndex) {
        setActiveVariation(null)
      }
      
      // Odbuduj grę do pozycji na newIndex
      const newGame = new Chess()
      const currentPath = getCurrentPath()
      for (let i = 0; i <= newIndex && i < currentPath.length; i++) {
        newGame.move(currentPath[i])
      }
      setAnalysisGame(newGame)
    }
  }

  const forwardAnalysisMove = () => {
    const currentPath = getCurrentPath()
    if (currentMoveIndex < currentPath.length - 1) {
      // Przesuń wskaźnik do przodu
      const newIndex = currentMoveIndex + 1
      setCurrentMoveIndex(newIndex)
      
      // Odbuduj grę do pozycji na newIndex
      const newGame = new Chess()
      for (let i = 0; i <= newIndex && i < currentPath.length; i++) {
        newGame.move(currentPath[i])
      }
      setAnalysisGame(newGame)
    }
  }

  const selectVariation = (startIndex: number, variationNode: VariationNode) => {
    // Znajdź wariant w variations i aktywuj go
    const existingVariations = variations[startIndex] || []
    const existingNode = existingVariations.find(node => node.move === variationNode.move)
    if (existingNode) {
      setActiveVariation({
        startIndex: startIndex,
        moves: [variationNode.move],
        path: [0]
      })
      setCurrentMoveIndex(startIndex)
      
      // Odbuduj grę do tej pozycji
      const newGame = new Chess()
      for (let i = 0; i < startIndex; i++) {
        newGame.move(analysisHistory[i])
      }
      newGame.move(variationNode.move)
      setAnalysisGame(newGame)
    }
  }

  const resetAnalysisGame = () => {
    setAnalysisGame(new Chess())
    setAnalysisHistory([]) // Resetuj też historię ruchów
    setCurrentMoveIndex(-1) // Powrót do pozycji startowej
    setVariations({}) // Wyczyść warianty
    setActiveVariation(null) // Wyczyść aktywny wariant
  }

  // Funkcja debugowania do wyświetlania struktury wariantów
  const logVariationsStructure = () => {
    alert('Debug kliknięty - sprawdź konsolę!')
    console.log('=== STRUKTURA WARIANTÓW ===')
    console.log('Main line:', analysisHistory)
    console.log('Active variation:', activeVariation)
    console.log('Variations structure:', JSON.stringify(variations, null, 2))
    console.log('Current move index:', currentMoveIndex)
    console.log('=== KONIEC DEBUG ===')
  }

  // Funkcja do przechodzenia do konkretnego ruchu
  const goToMove = (moveIndex: number) => {
    console.log(`Przechodzę do ruchu na pozycji: ${moveIndex}, current: ${currentMoveIndex}, activeVariation:`, activeVariation)
    
    // Najpierw określ jakiej ścieżki potrzebujemy
    let targetPath: string[] = []
    let newActiveVariation = activeVariation
    
    // Sprawdź czy docelowa pozycja jest w głównej linii
    if (moveIndex < analysisHistory.length) {
      // Pozycja w głównej linii
      targetPath = analysisHistory.slice(0, moveIndex + 1)
      newActiveVariation = null
    } else if (activeVariation && moveIndex >= activeVariation.startIndex && moveIndex < activeVariation.startIndex + activeVariation.moves.length) {
      // Pozycja w obecnym wariancie
      const mainLineUpToVariation = analysisHistory.slice(0, activeVariation.startIndex)
      const variationMoves = activeVariation.moves.slice(0, moveIndex - activeVariation.startIndex + 1)
      targetPath = [...mainLineUpToVariation, ...variationMoves]
      // Zachowaj obecny wariant
    } else {
      // Fallback - użyj głównej linii
      targetPath = analysisHistory.slice(0, Math.min(moveIndex + 1, analysisHistory.length))
      newActiveVariation = null
    }
    
    console.log(`Target path dla pozycji ${moveIndex}:`, targetPath)
    
    // Odbuduj grę używając docelowej ścieżki
    const newGame = new Chess()
    for (let i = 0; i < targetPath.length; i++) {
      const moveResult = newGame.move(targetPath[i])
      if (!moveResult) {
        console.error(`Nie można wykonać ruchu: ${targetPath[i]} na pozycji ${i}`)
        break
      }
    }
    
    // Ustaw stan AFTER odbudowania gry
    setAnalysisGame(newGame)
    setActiveVariation(newActiveVariation)
    setCurrentMoveIndex(moveIndex)
  }

  const copyAnalysisPGN = () => {
    // Generuj PGN z naszej historii ruchów
    let pgnMoves = ''
    for (let i = 0; i < analysisHistory.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1
      const whiteMove = analysisHistory[i]
      const blackMove = analysisHistory[i + 1]
      
      pgnMoves += `${moveNumber}.${whiteMove}`
      if (blackMove) {
        pgnMoves += ` ${blackMove} `
      } else {
        pgnMoves += ' '
      }
    }
    
    const pgn = `[Event "Analiza"]
[Site "Chess Learning App"]
[Date "${new Date().toISOString().split('T')[0]}"]
[Round "1"]
[White "Gracz"]
[Black "Gracz"]
[Result "*"]

${pgnMoves.trim()} *`
    
    navigator.clipboard.writeText(pgn).then(() => {
      alert('PGN analizy skopiowane do schowka!')
    }).catch(() => {
      alert('Błąd przy kopiowaniu PGN')
    })
  }

  const openSettings = () => {
    setActiveTab('ustawienia')
  }

  const tabs = [
    { id: 'rozgrywka' as TabType, name: 'Rozgrywka', icon: '♟️' },
    { id: 'kalendarz' as TabType, name: 'Kalendarz', icon: '📅' },
    { id: 'profil' as TabType, name: 'Profil', icon: '👤' },
    { id: 'analiza' as TabType, name: 'Analiza', icon: '🔍' },
    { id: 'trening' as TabType, name: 'Trening', icon: '💪' },
    { id: 'aktualnosci' as TabType, name: 'Aktualności', icon: '📰' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'rozgrywka':
        return (
          <main className="main-content">
            <div className="game-section">
              <div className="chessboard-container">
                <Chessboard 
                  position={game.fen()}
                  onPieceDrop={makeMove}
                  boardWidth={400}
                />
              </div>
              
              <div className="game-info">
                <h3>Status gry</h3>
                <p>Ruch: {game.turn() === 'w' ? 'Białych' : 'Czarnych'}</p>
                <p>Ruchów: {game.history().length}</p>
                
                <button onClick={resetGame} className="reset-button">
                  Nowa gra
                </button>
              </div>
            </div>
          </main>
        )
      
      case 'kalendarz':
        return (
          <main className="main-content">
            <div className="tab-content">
              <h2>📅 Kalendarz Turniejów</h2>
              <p>Tutaj będą wyświetlane nadchodzące turnieje i wydarzenia szachowe.</p>
              <div className="upcoming-events">
                <div className="event-item">
                  <h4>Mistrzostwa Polski Juniorów</h4>
                  <p>Data: 15-20 października 2025</p>
                  <p>Miejsce: Warszawa</p>
                </div>
                <div className="event-item">
                  <h4>Turniej Błyskawiczny Online</h4>
                  <p>Data: 25 października 2025</p>
                  <p>Platforma: Chess.com</p>
                </div>
              </div>
            </div>
          </main>
        )
      
      case 'profil':
        return (
          <main className="main-content">
            <div className="tab-content">
              <h2>👤 Twój Profil</h2>
              <div className="profile-stats">
                <div className="stat-item">
                  <h4>Rating</h4>
                  <p className="stat-number">1547</p>
                </div>
                <div className="stat-item">
                  <h4>Rozegranych partii</h4>
                  <p className="stat-number">42</p>
                </div>
                <div className="stat-item">
                  <h4>Procent wygranych</h4>
                  <p className="stat-number">67%</p>
                </div>
              </div>
            </div>
          </main>
        )
      
      case 'analiza':
        return (
          <main className="main-content">
            <div className="analysis-layout">
              <div className="analysis-board-section">
                <h2>🔍 Analiza z Stockfish</h2>
                <div className="analysis-game-area">
                  <div className="chessboard-container">
                    <Chessboard 
                      position={analysisGame.fen()}
                      onPieceDrop={makeAnalysisMove}
                      boardWidth={400}
                      animationDuration={0}
                    />
                  </div>
                  
                  <div className="game-history">
                    <h3>📝 Historia analizy</h3>
                    <div className="game-status">
                      <p><strong>Na ruchu:</strong> {analysisGame.turn() === 'w' ? 'Białe' : 'Czarne'}</p>
                      <p><strong>Ruchów:</strong> {getCurrentPath().length}</p>
                      {activeVariation && (
                        <p><strong>Aktywny wariant</strong> od ruchu {Math.floor(activeVariation.startIndex / 2) + 1}</p>
                      )}
                    </div>
                    
                    <div className="moves-history">
                      <h4>Ruchy:</h4>
                      {analysisHistory.length === 0 && !activeVariation ? (
                        <p className="no-moves">Rozpocznij analizę</p>
                      ) : (
                        <div className="moves-list">
                          {(() => {
                            const result = [];
                            
                            // Najpierw wyświetl główną linię
                            for (let i = 0; i < analysisHistory.length; i += 2) {
                              const moveNumber = Math.floor(i / 2) + 1;
                              const whiteMove = analysisHistory[i];
                              const blackMove = analysisHistory[i + 1];
                              
                              // Sprawdź czy ruchy są aktywne
                              let whiteActive = false;
                              let blackActive = false;
                              
                              if (activeVariation) {
                                // Jesteśmy w wariancie - podświetl główną linię tylko do początku wariantu
                                whiteActive = i < activeVariation.startIndex;
                                blackActive = i + 1 < activeVariation.startIndex;
                              } else {
                                // W głównej linii - podświetl do aktualnej pozycji
                                whiteActive = i <= currentMoveIndex;
                                blackActive = i + 1 <= currentMoveIndex;
                              }
                              
                              result.push(
                                <div key={moveNumber} className="move-pair">
                                  <span className="move-number">{moveNumber}.</span>
                                  <button 
                                    className={`move-notation white-move ${whiteActive ? 'active' : 'inactive'}`}
                                    onClick={() => goToMove(i)}
                                  >
                                    {whiteMove}
                                  </button>
                                  {blackMove && (
                                    <button 
                                      className={`move-notation black-move ${blackActive ? 'active' : 'inactive'}`}
                                      onClick={() => goToMove(i + 1)}
                                    >
                                      {blackMove}
                                    </button>
                                  )}
                                  
                                  {/* Pokaż warianty dla białych */}
                                  {(variations[i]?.length > 0 || (activeVariation?.startIndex === i)) && (
                                    <div className="variations">
                                      
                                      {/* Jeśli aktywny wariant zaczyna się tutaj, pokaż jego ruchy */}
                                      {activeVariation?.startIndex === i ? (
                                        <>
                                          {activeVariation.moves.map((move, moveIdx) => {
                                            const currentMoveNum = moveNumber + Math.floor(moveIdx / 2);
                                            const isWhiteInVariation = (i + moveIdx) % 2 === 0;
                                            const isActiveMove = (i + moveIdx) <= currentMoveIndex;
                                            const isFirstBlackMove = !isWhiteInVariation && moveIdx === 0;
                                            
                                            return (
                                              <button 
                                                key={`active-${moveIdx}`}
                                                className={`variation-move active-variation ${isActiveMove ? 'current-move' : 'future-move'}`}
                                                onClick={() => goToMove(i + moveIdx)}
                                              >
                                                {isWhiteInVariation ? `${currentMoveNum}.` : (isFirstBlackMove ? `${currentMoveNum}...` : '')}{move}
                                              </button>
                                            );
                                          })}
                                        </>
                                      ) : (
                                        /* Pokaż warianty z variations tylko jeśli nie ma aktywnego wariantu tutaj */
                                        variations[i]?.map((variation, idx) => (
                                          <button 
                                            key={idx} 
                                            className="variation-move"
                                            onClick={() => selectVariation(i, variation)}
                                          >
                                            {moveNumber}.{variation.move}
                                          </button>
                                        ))
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Pokaż warianty dla czarnych */}
                                  {blackMove && (variations[i + 1]?.length > 0 || (activeVariation?.startIndex === i + 1)) && (
                                    <div className="variations">
                                      
                                      {/* Jeśli aktywny wariant zaczyna się tutaj, pokaż jego ruchy */}
                                      {activeVariation?.startIndex === i + 1 ? (
                                        <>
                                          {activeVariation.moves.map((move, moveIdx) => {
                                            const currentMoveNum = moveNumber + Math.floor((moveIdx + 1) / 2);
                                            const isWhiteInVariation = (i + 1 + moveIdx) % 2 === 0;
                                            const isActiveMove = (i + 1 + moveIdx) <= currentMoveIndex;
                                            const isFirstBlackMove = !isWhiteInVariation && moveIdx === 0;
                                            
                                            return (
                                              <span 
                                                key={`active-${moveIdx}`}
                                                className={`variation-move active-variation ${isActiveMove ? 'current-move' : 'future-move'}`}
                                              >
                                                {isWhiteInVariation ? `${currentMoveNum}.` : (isFirstBlackMove ? `${currentMoveNum}...` : '')}{move}
                                              </span>
                                            );
                                          })}
                                        </>
                                      ) : (
                                        /* Pokaż warianty z variations tylko jeśli nie ma aktywnego wariantu tutaj */
                                        variations[i + 1]?.map((variation, idx) => (
                                          <button 
                                            key={idx} 
                                            className="variation-move"
                                            onClick={() => selectVariation(i + 1, variation)}
                                          >
                                            {variation.move}
                                          </button>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            
                            return result;
                          })()}
                        </div>
                      )}
                    </div>
                    
                    <div className="control-buttons">
                      <button 
                        onClick={() => undoAnalysisMove()} 
                        disabled={currentMoveIndex < 0}
                        className="control-button undo-button"
                      >
                        ← Cofnij
                      </button>
                      
                      <button 
                        onClick={() => forwardAnalysisMove()} 
                        disabled={
                          activeVariation 
                            ? currentMoveIndex >= activeVariation.startIndex + activeVariation.moves.length - 1
                            : currentMoveIndex >= analysisHistory.length - 1
                        }
                        className="control-button forward-button"
                      >
                        → Do przodu
                      </button>
                      
                      <button onClick={resetAnalysisGame} className="control-button reset-button">
                        🔄 Reset
                      </button>
                      
                      <button onClick={logVariationsStructure} className="control-button debug-button">
                        🐛 Debug
                      </button>
                      
                      <button 
                        onClick={() => copyAnalysisPGN()}
                        disabled={analysisHistory.length === 0}
                        className="control-button copy-button"
                      >
                        📋 PGN
                      </button>
                      
                      {activeVariation && (
                        <button 
                          onClick={() => {
                            setActiveVariation(null)
                            setCurrentMoveIndex(Math.min(currentMoveIndex, analysisHistory.length - 1))
                            
                            // Odbuduj grę do pozycji w głównej linii
                            const newGame = new Chess()
                            const targetIndex = Math.min(currentMoveIndex, analysisHistory.length - 1)
                            for (let i = 0; i <= targetIndex; i++) {
                              newGame.move(analysisHistory[i])
                            }
                            setAnalysisGame(newGame)
                          }}
                          className="control-button main-line-button"
                        >
                          ⬆️ Główna linia
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="analysis-panel">
                <CloudOnlyAnalysis currentFen={analysisGame.fen()} isEnabled={true} />
              </div>
            </div>
          </main>
        )
      
      case 'trening':
        return (
          <main className="main-content">
            <div className="tab-content">
              <h2>💪 Trening Taktyczny</h2>
              <p>Rozwiązuj puzzle i ćwicz kombinacje.</p>
              <div className="training-modes">
                <div className="training-card">
                  <h4>🎯 Puzzle dnia</h4>
                  <p>Codzienne zadanie taktyczne</p>
                  <button className="start-training">Rozpocznij</button>
                </div>
                <div className="training-card">
                  <h4>⚡ Trening błyskawiczny</h4>
                  <p>Szybkie kombinacje</p>
                  <button className="start-training">Rozpocznij</button>
                </div>
              </div>
            </div>
          </main>
        )
      
      case 'aktualnosci':
        return (
          <main className="main-content">
            <div className="tab-content">
              <h2>📰 Aktualności Szachowe</h2>
              <div className="news-items">
                <div className="news-item">
                  <h4>Magnus Carlsen wygrał kolejny turniej</h4>
                  <p className="news-date">7 października 2025</p>
                  <p>Mistrz świata ponownie dominuje w szachach szybkich...</p>
                </div>
                <div className="news-item">
                  <h4>Nowa książka o debiutach</h4>
                  <p className="news-date">5 października 2025</p>
                  <p>Wydawnictwo Chess Publishing prezentuje...</p>
                </div>
              </div>
            </div>
          </main>
        )
      
      case 'ustawienia':
        return (
          <main className="main-content">
            <div className="tab-content">
              <h2>⚙️ Ustawienia</h2>
              <div className="settings-sections">
                
                <div className="setting-group">
                  <h3>🎨 Wygląd</h3>
                  <div className="setting-item">
                    <label>Motyw aplikacji:</label>
                    <div className="theme-selector">
                      <button 
                        className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                        onClick={() => setTheme('light')}
                      >
                        ☀️ Jasny
                      </button>
                      <button 
                        className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                        onClick={() => setTheme('dark')}
                      >
                        🌙 Ciemny
                      </button>
                    </div>
                  </div>
                </div>

                <div className="setting-group">
                  <h3>♟️ Gra</h3>
                  <div className="setting-item">
                    <label>Automatyczne promowanie pionka:</label>
                    <select className="setting-select">
                      <option value="queen">Hetman</option>
                      <option value="ask">Pytaj za każdym razem</option>
                    </select>
                  </div>
                  <div className="setting-item">
                    <label>Pokazuj możliwe ruchy:</label>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>

                <div className="setting-group">
                  <h3>🔊 Dźwięk</h3>
                  <div className="setting-item">
                    <label>Dźwięki ruchów:</label>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="setting-item">
                    <label>Głośność:</label>
                    <input type="range" min="0" max="100" defaultValue="70" />
                  </div>
                </div>

              </div>
            </div>
          </main>
        )
      
      default:
        return null
    }
  }

  return (
    <div className={`app ${theme}`}>
      <header className="app-header">
        <div className="header-top">
          <h1>Chess Learning App</h1>
          <button className="settings-gear" onClick={openSettings} title="Ustawienia">
            ⚙️
          </button>
        </div>
        <nav className="main-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-name">{tab.name}</span>
            </button>
          ))}
        </nav>
      </header>
      
      {renderTabContent()}
    </div>
  )
}

export default App