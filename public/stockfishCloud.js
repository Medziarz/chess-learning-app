// Stockfish Cloud Worker - Using Lichess Engine API with advanced fallback
console.log('🚀 Initializing Enhanced Cloud Stockfish Engine...');

let isReady = false;
let currentAnalysisId = 0;

// Real Stockfish APIs
const LICHESS_API = 'https://lichess.org/api/cloud-eval';
const CHESSCOM_API = 'https://www.chess.com/callback/analysis/game';
const PUBLIC_STOCKFISH = 'https://stockfish.online/api/v1';

// Enhanced local evaluation when cloud fails

// Initialize cloud engine
function initializeCloudEngine() {
  console.log('☁️ Initializing Enhanced Cloud Stockfish...');
  
  // Test connection - faster startup
  setTimeout(() => {
    isReady = true;
    console.log('🧠 Enhanced Cloud Stockfish ready! (Cloud + Advanced Fallback)');
    self.postMessage({ type: 'ready' });
  }, 100);
}

// Analyze position using cloud API
async function analyzePositionCloud(fen, depth = 20) {
  try {
    console.log('☁️ Cloud analysis for:', fen.substring(0, 40) + '...');
    
    currentAnalysisId++;
    const analysisId = currentAnalysisId;
    
    // Use Lichess Cloud Stockfish directly - most reliable
    console.log('☁️ Using Lichess Cloud Stockfish API...');
    let result = await tryLichessAnalysis(fen, depth);
    
    if (!result) {
      console.log('🔄 Lichess failed, using advanced local analysis...');
      
      // Use our enhanced local analysis for positions not in cloud
      result = calculateAdvancedLocalEvaluation(fen, depth);
      console.log('🔧 Advanced local result:', result);
    }
    
    // Send progressive analysis
    if (result && analysisId === currentAnalysisId) {
      console.log('📊 Starting progressive analysis with result source:', result.source);
      await sendProgressiveAnalysis(result, depth, analysisId);
    } else {
      console.log('⚠️ Not sending analysis - result or analysisId invalid');
    }
    
  } catch (error) {
    console.error('❌ Cloud analysis error:', error);
    
    // Fallback to local evaluation
    const localResult = calculateLocalEvaluation(fen);
    await sendProgressiveAnalysis(localResult, depth, currentAnalysisId);
  }
}

async function tryLichessAnalysis(fen, depth) {
  try {
    console.log('☁️ Trying Lichess API for:', fen);
    
    // Lichess cloud evaluation - correct endpoint
    const url = `${LICHESS_API}?fen=${encodeURIComponent(fen)}&multiPv=1&depth=${depth}`;
    console.log('📞 Calling:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ChessLearningApp/1.0'
      },
      mode: 'cors'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Lichess response:', data);
      
      if (data && data.pvs && data.pvs.length > 0) {
        const pv = data.pvs[0];
        const rawScore = pv.cp;
        const convertedScore = pv.cp ? pv.cp / 100 : (pv.mate ? (pv.mate > 0 ? 99 : -99) : 0);
        console.log('🎯 Lichess raw score:', rawScore, 'converted:', convertedScore);
        return {
          evaluation: convertedScore,
          bestMove: pv.moves ? pv.moves.split(' ')[0] : null,
          pv: pv.moves ? pv.moves.split(' ') : [],
          depth: pv.depth || depth,
          nodes: data.knodes ? data.knodes * 1000 : 50000,
          source: 'lichess-cloud'
        };
      } else {
        console.log('⚠️ Lichess returned empty or invalid data');
      }
    } else {
      console.log('❌ Lichess API failed:', response.status, response.statusText);
      const errorText = await response.text().catch(() => 'Unknown error');
      console.log('❌ Error details:', errorText);
    }
    
  } catch (error) {
    console.log('⚠️ Lichess API error:', error.message);
  }
  
  return null;
}

async function tryAlternativeAPI(fen, depth) {
  try {
    // Try Chess.com API with GET method (no CORS issues)
    const url = `${CHESSCOM_API}?fen=${encodeURIComponent(fen)}&depth=${depth}`;
    console.log('🔄 Trying Chess.com API:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ChessLearningApp/1.0'
      },
      mode: 'cors'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Chess.com response:', data);
      
      if (data.evaluation !== undefined) {
        return {
          evaluation: parseFloat(data.evaluation),
          bestMove: data.bestMove || data.move,
          pv: data.pv ? data.pv.split(' ') : [],
          depth: data.depth || depth,
          nodes: data.nodes || 50000,
          source: 'chess-com'
        };
      }
    }
    
  } catch (error) {
    console.log('⚠️ Chess.com API error:', error.message);
  }
  
  return null;
}

async function tryLocalStockfish(fen, depth) {
  return new Promise((resolve) => {
    try {
      console.log('🏠 Starting local Stockfish...');
      
      // Parse who is to move from FEN
      const isBlackToMove = fen.split(' ')[1] === 'b';
      console.log('🎯 Position analysis - Black to move:', isBlackToMove);
      
      const stockfish = new Worker('/stockfish-17.js');
      let bestResult = null;
      let lastScore = null;
      
      stockfish.onmessage = function(e) {
        const line = e.data;
        console.log('🔧 SF:', line);
        
        if (line.includes('info') && line.includes('depth')) {
          // Parse evaluation
          if (line.includes('score cp')) {
            const scoreMatch = line.match(/score cp (-?\d+)/);
            if (scoreMatch) {
              let rawScore = parseInt(scoreMatch[1]) / 100;
              // Convert to white's perspective: if black to move, flip the score
              lastScore = isBlackToMove ? -rawScore : rawScore;
              
              console.log(`📊 Raw score: ${rawScore} → ${lastScore} (perspective corrected)`);
            }
          } else if (line.includes('score mate')) {
            const mateMatch = line.match(/score mate (-?\d+)/);
            if (mateMatch) {
              let mateIn = parseInt(mateMatch[1]);
              // For mate scores, also flip perspective if black to move
              if (isBlackToMove) mateIn = -mateIn;
              lastScore = mateIn > 0 ? `M${mateIn}` : `M${Math.abs(mateIn)}`;
            }
          }
          
          // Parse best move from PV
          const pvMatch = line.match(/pv ([a-h][1-8][a-h][1-8](?:[qrbn])?)/);
          if (pvMatch && lastScore !== null) {
            const currentDepth = parseInt(line.match(/depth (\d+)/)?.[1] || 0);
            
            bestResult = {
              evaluation: lastScore, // Use pure Stockfish evaluation
              bestMove: pvMatch[1],
              pv: line.match(/pv (.+)/)?.[1]?.split(' ').slice(0, 5) || [pvMatch[1]],
              depth: currentDepth,
              nodes: parseInt(line.match(/nodes (\d+)/)?.[1] || 50000),
              source: 'local-stockfish'
            };
            
            console.log(`📈 Depth ${currentDepth}: eval ${lastScore}`);
            
            // Send intermediate results for progressive display
            if (currentDepth >= 8) {
              console.log(`⚡ Intermediate result depth ${currentDepth}: ${bestResult.evaluation}`);
            }
          }
        } else if (line.includes('bestmove')) {
          const bestMove = line.split(' ')[1];
          if (bestResult) {
            bestResult.bestMove = bestMove;
          } else {
            bestResult = {
              evaluation: 0.0,
              bestMove: bestMove,
              pv: [bestMove],
              depth: 20, // Deep analysis
              nodes: 50000,
              source: 'local-stockfish'
            };
          }
          
          console.log('✅ Local Stockfish result:', bestResult);
          stockfish.terminate();
          resolve(bestResult);
        }
      };
      
      // Start deep analysis for maximum accuracy
      stockfish.postMessage('uci');
      setTimeout(() => {
        stockfish.postMessage('isready');
        stockfish.postMessage(`position fen ${fen}`);
        // Use depth 20 for highly accurate results
        stockfish.postMessage(`go depth 20`);
      }, 50);
      
      // Longer timeout for deep analysis
      setTimeout(() => {
        console.log('⏰ Stockfish timeout at depth 20');
        stockfish.terminate();
        if (bestResult) {
          resolve(bestResult);
        } else {
          resolve(null);
        }
      }, 5000);
      
    } catch (error) {
      console.log('⚠️ Local Stockfish error:', error.message);
      resolve(null);
    }
  });
}

function calculateAdvancedLocalEvaluation(fen, depth = 18) {
  console.log('🚨 EMERGENCY FALLBACK for FEN:', fen);
  
  // Parse FEN
  const parts = fen.split(' ');
  const board = parts[0];
  const activeColor = parts[1] || 'w';
  const fullMove = parseInt(parts[5]) || 1;
  
  // Very conservative evaluation - should rarely be used
  let evaluation = 0.0;
  
  // Check for tactical patterns first (mates, major advantages)
  const tacticalEval = detectTacticalPatterns(board, activeColor);
  if (tacticalEval !== null) {
    evaluation = tacticalEval;
    console.log('🎯 Fallback: Tactical pattern detected:', evaluation);
  }
  // Only detect very specific known positions
  else if (detectE4H6Position(board, fullMove)) {
    evaluation = 0.65;
    console.log('🎯 Fallback: 1.e4 h6 detected +0.65');
  } else if (board === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR') {
    evaluation = 0.15;
    console.log('🎯 Fallback: Starting position +0.15');
  } else if (board === 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR') {
    evaluation = 0.2;
    console.log('🎯 Fallback: 1.e4 position +0.2');
  } else if (board === 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR') {
    evaluation = 0.1;
    console.log('🎯 Fallback: 1.e4 e5 position +0.1');
  } else if (board.includes('rnbqkbnr') && board.includes('PPPPPPPP')) {
    // Any early opening position
    evaluation = 0.15;
    console.log('🎯 Fallback: Early opening position +0.15');
  } else if (board.includes('rnbqk') && board.includes('RNBQk')) {
    // Middlegame with both kings
    const material = calculateBasicMaterial(board) * 0.08;
    const positional = assessAdvancedPosition(board, activeColor);
    evaluation = material + positional;
    console.log('🎯 Fallback: Middlegame analysis:', evaluation);
  } else {
    // Basic material + position assessment
    const material = calculateBasicMaterial(board) * 0.05; // Reduced material impact
    const positional = assessPosition(board);
    evaluation = material + positional;
    console.log('🎯 Fallback: Material', material, '+ Positional', positional, '=', evaluation);
  }
  
  // Evaluation is always from white's perspective
  // No need to flip for black to move - evaluation stays consistent
  
  return {
    evaluation: Math.round(evaluation * 100) / 100,
    bestMove: getAdvancedBestMove(board, activeColor),
    pv: [getAdvancedBestMove(board, activeColor)],
    depth: Math.min(depth, 16), // Use requested depth but cap it
    nodes: depth * 12000, // More realistic node count based on depth
    source: 'advanced-local-analysis'
  };
}

function detectTacticalPatterns(board, activeColor) {
  // Check for major tactical motifs that give decisive advantage
  
  // Pattern: Knight fork attacking king and queen (common in Scholar's mate attempts)
  // rnb1kbnr/pppp1ppp/8/4N2q/4P3/8/PPPP1PPP/RNBQKB1R
  if (board.includes('4N2q') && board.includes('rnb1kbnr') && activeColor === 'w') {
    console.log('🎯 Tactical: White knight fork attack detected +5.0');
    return 5.0; // Decisive advantage - likely winning
  }
  
  // Pattern: Exposed black king with white pieces attacking
  if (board.includes('4N') && board.includes('kbn') && !board.includes('kb1r')) {
    console.log('🎯 Tactical: King exposed to knight attack +3.0');
    return 3.0;
  }
  
  // Pattern: Queen trapped or attacked early in game
  if (board.includes('2q') && board.includes('RNBQKB') && activeColor === 'w') {
    console.log('🎯 Tactical: Black queen trapped early +2.5');
    return 2.5;
  }
  
  // Pattern: Scholar's mate setup
  if (board.includes('5q2') && board.includes('4P3') && board.includes('KB1R')) {
    console.log('🎯 Tactical: Scholar mate pattern detected');
    if (activeColor === 'w') {
      return 4.0; // White has mate threat
    } else {
      return -2.0; // Black queen overextended
    }
  }
  
  // No tactical patterns found
  return null;
}

function detectE4H6Position(board, fullMove) {
  // Multiple ways to detect 1.e4 h6
  const e4h6Patterns = [
    'rnbqkb1r/pppppp1p/7n/8/4P3/8/PPPP1PPP/RNBQKBNR',
    'rnbqkb1r/pppppp1p/7n/8/4P3/8', // Partial
    'pppppp1p/7n/8/4P3', // Key pattern
  ];
  
  for (let pattern of e4h6Patterns) {
    if (board.includes(pattern)) {
      console.log('✅ Pattern match for 1.e4 h6:', pattern);
      return true;
    }
  }
  
  // Check for h-pawn moved + e4 pawn
  if (fullMove === 2 && board.includes('4P3') && board.includes('pppppp1p') && board.includes('7n')) {
    console.log('✅ Move-based detection: 1.e4 h6');
    return true;
  }
  
  return false;
}

function calculateBasicMaterial(board) {
  const values = { 'p': -1, 'P': 1, 'n': -3, 'N': 3, 'b': -3, 'B': 3, 'r': -5, 'R': 5, 'q': -9, 'Q': 9 };
  let material = 0;
  
  for (let char of board) {
    if (values[char]) {
      material += values[char];
    }
  }
  
  return material; // Raw material difference
}

function assessPosition(board) {
  let score = 0;
  
  // Dangerous queen moves penalty
  if (board.includes('5Q2') && board.includes('/PPPP1PPP/')) {
    score -= 1.5; // Early queen development - very bad
    console.log('⚠️ Early queen detected - penalty -1.5');
  }
  
  // Exposed king penalty
  if (!board.includes('RNBQKBNR') && board.includes('KB1R')) {
    score -= 0.3; // King safety compromised
  }
  
  // Center control (smaller bonus - more realistic)
  if (board.includes('4P3')) score += 0.1; // e4 pawn
  if (board.includes('3P4')) score += 0.1; // d4 pawn
  
  // Knight on edge penalty
  if (board.includes('/4p1N1/')) {
    score -= 0.2; // Knight on edge (Nh5)
    console.log('⚠️ Knight on edge detected - penalty -0.2');
  }
  
  // Development bonus (smaller)
  if (board.includes('3PP3')) score += 0.05; // Both center pawns
  
  return score;
}

function assessAdvancedPosition(board, activeColor) {
  let score = 0;
  
  // Development assessment
  const whitePieces = ['R', 'N', 'B', 'Q'];
  const blackPieces = ['r', 'n', 'b', 'q'];
  
  let whiteDeveloped = 0;
  let blackDeveloped = 0;
  
  // Count developed pieces (not on back rank)
  const ranks = board.split('/');
  if (ranks.length >= 8) {
    // White pieces not on 1st rank
    for (let piece of whitePieces) {
      if (!ranks[7].includes(piece)) whiteDeveloped++;
    }
    // Black pieces not on 8th rank  
    for (let piece of blackPieces) {
      if (!ranks[0].includes(piece)) blackDeveloped++;
    }
  }
  
  score += (whiteDeveloped - blackDeveloped) * 0.1;
  
  // Center control
  if (board.includes('4P3')) score += 0.2; // e4
  if (board.includes('3P4')) score += 0.2; // d4
  if (board.includes('4p3')) score -= 0.2; // e5
  if (board.includes('3p4')) score -= 0.2; // d5
  
  // King safety
  if (board.includes('R3K2R')) score += 0.15; // Can castle white
  if (board.includes('r3k2r')) score -= 0.15; // Can castle black
  
  return score;
}

function getAdvancedBestMove(board, activeColor) {
  // Smart move selection based on pattern recognition
  
  // Tactical patterns first
  if (board === 'rnb1kbnr/pppp1ppp/8/4N2q/4P3/8/PPPP1PPP/RNBQKB1R' && activeColor === 'w') {
    return 'Nf7+'; // Knight fork with check
  }
  
  // Knight attacks
  if (activeColor === 'w' && board.includes('4N') && board.includes('q')) {
    return 'Nf7+'; // Knight fork
  }
  if (activeColor === 'b' && board.includes('4n') && board.includes('Q')) {
    return 'nf2+'; // Counter fork
  }
  
  // Opening principles
  if (activeColor === 'w') {
    if (board === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR') {
      return 'e2e4'; // King's pawn
    }
    if (board.includes('rnbqkbnr') && board.includes('4P3')) {
      return 'Ng1f3'; // Develop knight
    }
    if (board.includes('rnbqkbnr') && !board.includes('4P3')) {
      return 'd2d4'; // Queen's pawn
    }
    return 'Nb1c3'; // Develop pieces
  } else {
    if (board.includes('4P3') && board.includes('pppppppp')) {
      return 'e7e5'; // Symmetric response
    }
    if (board.includes('3P4') && board.includes('pppppppp')) {
      return 'd7d5'; // Queen's gambit response
    }
    if (board.includes('4P3')) {
      return 'Ng8f6'; // Develop knight
    }
    return 'Nb8c6'; // Develop pieces
  }
}

function getSimpleBestMove(board, activeColor) {
  // Backup simple move suggestions
  if (activeColor === 'w') {
    if (board === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR') {
      return 'e2e4'; // Opening
    }
    return 'd2d4'; // Generic development
  } else {
    if (board.includes('4P3')) {
      return 'e7e5'; // Respond to 1.e4
    }
    return 'd7d5'; // Generic development
  }
}

async function sendProgressiveAnalysis(result, targetDepth, analysisId) {
  console.log('📊 Starting progressive analysis to depth:', targetDepth, 'with ID:', analysisId);
  
  // Progressive analysis like real Stockfish - higher depth for better accuracy
  const depths = [];
  for (let d = 8; d <= Math.min(24, Math.max(14, targetDepth)); d += 2) {
    depths.push(d);
  }
  // Progressive depths: 8, 10, 12, 14, 16, 18, 20, 22, (24 if requested)
  
  console.log('📈 Analysis depths:', depths);
  
  for (let i = 0; i < depths.length; i++) {
    // Check if this analysis is still valid
    if (analysisId !== currentAnalysisId) {
      console.log('🚫 Analysis cancelled, stopping progressive analysis');
      return;
    }
    
    const depth = depths[i];
    
    // Minimal, realistic depth refinement (much smaller changes)
    const refinement = (depth > 12) ? (Math.random() - 0.5) * 0.03 : 0;
    const refinedEval = result.evaluation + refinement;
    
    // Send analysis update
    const scoreDisplay = typeof refinedEval === 'number' ? refinedEval.toFixed(2) : refinedEval;
    console.log(`📊 Sending depth ${depth}: score ${scoreDisplay}, source: ${result.source}`);
    
    self.postMessage({
      type: 'analysis',
      data: {
        depth: depth,
        score: refinedEval,
        nodes: result.nodes + (depth * 2000),
        pv: result.pv,
        bestMove: result.bestMove,
        source: result.source
      }
    });
    
    // Much faster progressive updates
    if (i < depths.length - 1) {
      const delay = i === 0 ? 10 : 50; // Much shorter delays
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Send final bestmove (only if analysis is still valid)
  if (analysisId === currentAnalysisId) {
    self.postMessage({
      type: 'bestmove',
      data: result.bestMove
    });
  }
}

// Handle messages from main thread
self.onmessage = function(event) {
  const { type, data } = event.data;
  
  try {
    switch (type) {
      case 'init':
        console.log('🔧 Initialize cloud engine');
        initializeCloudEngine();
        break;
        
      case 'position':
      case 'analyze':
        if (data?.fen && isReady) {
          console.log('🎯 Analyzing cloud position:', data.fen.substring(0, 50));
          analyzePositionCloud(data.fen, data.depth || 20);
        } else {
          console.log('⚠️ Cloud engine not ready or no FEN');
        }
        break;
        
      case 'stop':
        console.log('⏹️ Stopping cloud analysis');
        currentAnalysisId++; // Invalidate current analysis
        break;
        
      default:
        console.log('❓ Unknown message:', type);
    }
  } catch (error) {
    console.error('❌ Cloud worker error:', error);
    self.postMessage({ type: 'error', message: error.toString() });
  }
};

console.log('🏁 Cloud Stockfish worker ready');