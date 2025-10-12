// WASM Stockfish Worker
importScripts('/stockfish-wasm.js');

let stockfish = null;
let isReady = false;
let currentAnalysisId = 0;

// Initialize Stockfish
Stockfish().then(function(wasmStockfish) {
  stockfish = wasmStockfish;
  
  // Set up message handling from Stockfish
  stockfish.addMessageListener(function(message) {
    handleStockfishMessage(message);
  });
  
  // Initialize UCI
  stockfish.postMessage('uci');
});

function handleStockfishMessage(message) {
  console.log('🔧 Stockfish:', message);
  
  if (message === 'uciok') {
    stockfish.postMessage('isready');
  } else if (message === 'readyok') {
    if (!isReady) {
      isReady = true;
      self.postMessage({ type: 'ready' });
    }
  } else if (message.startsWith('bestmove')) {
    // Parse bestmove
    const parts = message.split(' ');
    const bestMove = parts[1];
    
    self.postMessage({
      type: 'analysis',
      data: {
        depth: 15, // Default depth for WASM
        score: 0,  // We'll get this from info lines
        nodes: 0,
        pv: [bestMove],
        bestMove: bestMove,
        source: 'wasm-stockfish'
      }
    });
  } else if (message.startsWith('info')) {
    // Parse analysis info
    parseAnalysisInfo(message);
  }
}

function parseAnalysisInfo(message) {
  // Parse UCI info format: info depth 12 seldepth 14 multipv 1 score cp 25 nodes 1234567 pv e2e4 e7e5
  const depth = extractValue(message, 'depth');
  const score = extractScore(message);
  const nodes = extractValue(message, 'nodes');
  const pv = extractPV(message);
  
  if (depth && pv.length > 0) {
    self.postMessage({
      type: 'analysis',
      data: {
        depth: parseInt(depth),
        score: score,
        nodes: parseInt(nodes) || 0,
        pv: pv,
        bestMove: pv[0],
        source: 'wasm-stockfish'
      }
    });
  }
}

function extractValue(message, key) {
  const regex = new RegExp(key + '\\s+(\\d+)');
  const match = message.match(regex);
  return match ? match[1] : null;
}

function extractScore(message) {
  if (message.includes('score cp')) {
    const match = message.match(/score cp (-?\d+)/);
    return match ? parseInt(match[1]) / 100 : 0; // Convert centipawns to pawns
  } else if (message.includes('score mate')) {
    const match = message.match(/score mate (-?\d+)/);
    return match ? (parseInt(match[1]) > 0 ? 999 : -999) : 0;
  }
  return 0;
}

function extractPV(message) {
  const pvIndex = message.indexOf('pv ');
  if (pvIndex === -1) return [];
  
  const pvString = message.substring(pvIndex + 3);
  return pvString.split(' ').filter(move => move.length > 0);
}

// Handle messages from main thread
self.onmessage = function(e) {
  const { type, fen, depth = 15, skillLevel = 20 } = e.data;
  
  if (type === 'init') {
    // Already handled in Stockfish initialization
  } else if (type === 'analyze') {
    if (stockfish && isReady) {
      currentAnalysisId++;
      
      // Stop any current analysis
      stockfish.postMessage('stop');
      
      // Set skill level (0-20, where 20 is strongest)
      stockfish.postMessage(`setoption name Skill Level value ${skillLevel}`);
      
      // Set position
      stockfish.postMessage(`position fen ${fen}`);
      
      // Start analysis
      stockfish.postMessage(`go depth ${depth}`);
    }
  } else if (type === 'stop') {
    if (stockfish) {
      stockfish.postMessage('stop');
    }
  }
};