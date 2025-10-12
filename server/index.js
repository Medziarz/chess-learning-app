const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const STOCKFISH_PATH = path.join(__dirname, '../stockfish/stockfish.exe');

app.post('/analyze', (req, res) => {
  const { fen, depth = 20 } = req.body;
  if (!fen) return res.status(400).json({ error: 'Missing FEN' });

  // Determine turn from FEN (FEN format: [piece placement] [active color] ...)
  const turn = fen.split(' ')[1]; // 'w' or 'b'

  const stockfish = spawn(STOCKFISH_PATH);
  let output = '';

  stockfish.stdin.write(`uci\n`);
  stockfish.stdin.write(`isready\n`);
  stockfish.stdin.write(`position fen ${fen}\n`);
  stockfish.stdin.write(`go depth ${depth}\n`);

  stockfish.stdout.on('data', (data) => {
    output += data.toString();
    if (output.includes('bestmove')) {
      stockfish.kill();
      // Parse evaluation from output
      const lines = output.split('\n');
      let evalScore = null;
      for (const line of lines) {
        if (line.includes('score')) {
          const match = line.match(/score (cp|mate) (-?\d+)/);
          if (match) {
            if (match[1] === 'mate') {
              evalScore = `#${match[2]}`;
            } else {
              let score = parseInt(match[2], 10) / 100;
              // Always return from White's perspective
              if (turn === 'b') score = -score;
              evalScore = score.toFixed(2);
            }
          }
        }
      }
      res.json({ output, eval: evalScore });
    }
  });

  stockfish.stderr.on('data', (data) => {
    console.error('Stockfish error:', data.toString());
  });

  stockfish.on('error', (err) => {
    res.status(500).json({ error: 'Failed to start Stockfish', details: err.message });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Stockfish server running on port ${PORT}`);
});
