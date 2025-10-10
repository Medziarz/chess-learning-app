# 🔧 Troubleshooting - Cloud Analysis Issues

## 🐛 Problem: Tylko jedna litera w ruchu

### Możliwe przyczyny:
1. **Lichess API zwraca nieprawidłowe dane**
2. **Parsing ruchu się nie udaje** 
3. **Fallback do opening book**

### Jak debugować:

#### 1. Otwórz DevTools (F12) → Console
```
Powinieneś zobaczyć logi:
📡 Full Lichess API response: {...}
🎯 Best line from Lichess: {...}
🔍 Move parsing: {...}  
🎯 Final move decision: {...}
```

#### 2. Sprawdź co zwraca Lichess API:
```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  "knodes": 345,
  "depth": 20,
  "pvs": [
    {
      "moves": "e7e5 g1f3 b8c6 f1c4",  // ← Powinno być tutaj
      "cp": 15                          // ← I tutaj evaluacja
    }
  ]
}
```

#### 3. Możliwe scenariusze:

**Scenariusz A: Lichess API działa poprawnie**
```
📡 Full Lichess API response: {pvs: [{moves: "e7e5 g1f3", cp: 15}]}
🔍 Move parsing: {firstMove: "e7e5", isValidMove: true}
🎯 Final move decision: {finalMove: "e7e5"}
```

**Scenariusz B: Lichess API zwraca dziwne dane**
```
📡 Full Lichess API response: {pvs: [{moves: "e", cp: 0}]}
🔍 Move parsing: {firstMove: "e", isValidMove: false}  
🎯 Final move decision: {finalMove: "e2e4"}  // fallback
```

**Scenariusz C: Lichess API nie działa**
```
⚠️ Lichess failed, using opening book fallback
📖 Using opening book move: e7e5
```

## 🛠️ Rozwiązania:

### Jeśli Lichess zwraca nieprawidłowe dane:
```javascript
// W cloudOnlyAnalysis.ts dodano walidację:
const validMove = /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(bestMove) && bestMove.length >= 4
const finalMove = validMove ? bestMove : 'e2e4'
```

### Jeśli Lichess nie działa wcale:
```javascript  
// Fallback do rozszerzonego opening book z 15+ pozycjami
const openingMoves = {
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': { move: 'e2e4', eval: 0.2 },
  // ... więcej pozycji
}
```

## 🎯 Co sprawdzić w konsoli:

### ✅ Prawidłowe działanie:
```
🔍 Starting cloud analysis for: rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1
📡 Full Lichess API response: {fen: "...", pvs: [{moves: "e7e5 g1f3", cp: 15}]}
🎯 Best line from Lichess: {moves: "e7e5 g1f3", cp: 15}
🔍 Move parsing: {firstMove: "e7e5", isValidMove: true}
🎯 Final move decision: {finalMove: "e7e5"}
✅ Analysis complete: {evaluation: 0.15, bestMove: "e7e5", depth: 20}
```

### ❌ Problemy:
```
🔍 Starting cloud analysis for: [pozycja]
📡 Full Lichess API response: {error: "..."}  // ← Błąd API
// lub
🔍 Move parsing: {firstMove: "e", isValidMove: false}  // ← Zły ruch
🎯 Final move decision: {finalMove: "e2e4"}  // ← Fallback
```

## 🚀 Rozwiązanie problemu:

### 1. **Zaktualizowano App.simple.tsx**
Aplikacja teraz używa CloudOnlyAnalysis zamiast starego SmartAnalysis

### 2. **Dodano walidację ruchu**
Sprawdza czy ruch ma format typu "e2e4", "a7a8q"

### 3. **Rozszerzono opening book** 
15+ popularnych pozycji jako fallback

### 4. **Dodano debugging**
Szczegółowe logi pokazują co się dzieje

## 🧪 Test:

1. **Odśwież stronę** (Ctrl+F5)
2. **Otwórz DevTools** (F12) 
3. **Wykonaj ruch** na szachownicy
4. **Sprawdź logi** w Console
5. **Powinno pokazać pełny ruch** (np. "e7e5")

**Jeśli nadal nie działa, skopiuj logi z konsoli i pokaż co dokładnie się wyświetla! 🔍**