# 🔥 **Chess Learning App - Z Własnym Stockfish Serverem**

Profesjonalna aplikacja szachowa z lokalnym silnikiem Stockfish dla natychmiastowej analizy bez limitów API.

## 🚀 **Funkcje**

✅ **Własny Serwer Stockfish** - Pełna kontrola, bez limitów API  
✅ **Smart Analysis** - Auto-wybór między lokalnym a cloud  
✅ **Real-time Analysis** - Głębokość 20+, customizable  
✅ **Wszystkie Zakładki** - Rozgrywka, Analiza, Trening, Profile  
✅ **Fallback System** - Graceful handling gdy serwer nie działa  

## ⚡ **Quick Start**

### **Opcja 1: Wszystko naraz (Recommended)**
```bash
npm install
npm run full-dev
```

### **Opcja 2: Osobno (dla debugowania)**

**Terminal 1 - Stockfish Server:**
```bash
npm run server
```

**Terminal 2 - React App:**
```bash
npm run dev
```

## 🖥️ **Instalacja Stockfish Engine**

### **Windows**
1. Pobierz: https://stockfishchess.org/download/
2. Rozpakuj do `C:\stockfish\`
3. Dodaj do PATH lub umieść `stockfish.exe` w folderze `server/`

### **Linux/Ubuntu**
```bash
sudo apt install stockfish
```

### **MacOS**
```bash
brew install stockfish
```

## 📊 **Konfiguracja Analysis**

Aplikacja automatycznie wykrywa i wybiera najlepszą opcję:

**🖥️ Local Stockfish** (Jeśli serwer działa):
- ✅ **Unlimited analysis** - bez limitów API
- ✅ **Customizable depth** (5-30)
- ✅ **Wszystkie pozycje** - nie tylko popularne
- ✅ **Fast response** - 1-3 sekundy

**☁️ Lichess Cloud** (Fallback):  
- ✅ **15,000 requestów/dzień**
- ✅ **Instant dla popularnych pozycji**
- ✅ **Professional depth** (48+)

**📖 Opening Book** (Last resort):
- ✅ **Always available**
- ✅ **Smart evaluation** based na pozycji

## 🔧 **Custom Stockfish Settings**

Edytuj `server/stockfish-server.js`:

```javascript
// Zwiększ głębokość analizy
const analysis = await stockfish.analyzePosition(fen, 25, 5000) // depth 25, 5s

// Dostosuj evaluation time
app.post('/analyze', async (req, res) => {
  const { fen, depth = 22, timeLimit = 3000 } = req.body // 3 sekundy
})
```

## 🎯 **API Endpoints**

**Health Check:**
```bash
curl http://localhost:3001/health
```

**Analyze Position:**
```bash
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{"fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "depth": 20}'
```

## 🧠 **Własny Trening Stockfish**

### **Zwiększ Siłę Silnika:**
```javascript
// W stockfish-server.js
this.sendCommand('setoption name Hash value 2048')     // 2GB RAM
this.sendCommand('setoption name Threads value 8')     // 8 cores
this.sendCommand('setoption name MultiPV value 3')     // 3 warianty
```

### **Specjalne Ustawienia:**
```javascript
// Agresywny styl
this.sendCommand('setoption name Contempt value 20')

// Endgame optimization  
this.sendCommand('setoption name Syzygy50MoveRule value false')

// Więcej analysis lines
this.sendCommand('setoption name MultiPV value 5')
```

## 🏆 **Performance Tuning**

**Dla mocnych komputerów:**
- `depth: 25-30`
- `timeLimit: 5000-10000ms`  
- `Hash: 4096MB+`
- `Threads: 16+`

**Dla słabszych:**
- `depth: 15-18`
- `timeLimit: 1500-2000ms`
- `Hash: 512-1024MB`
- `Threads: 4-6`

## 📱 **Usage**

1. **Otwórz aplikację** → http://localhost:5176
2. **Wybierz zakładkę "Analiza"**  
3. **Graj ruchy** - analiza automatyczna po każdym ruchu
4. **Przełączaj tryby** - Auto/Local/Cloud w dropdown
5. **Monitoruj status** - 🟢 Local server running

## ❌ **Troubleshooting**

**Serwer się nie uruchamia:**
```bash
# Sprawdź czy Stockfish jest zainstalowany
stockfish
# Powinno otworzyć UCI interface

# Sprawdź port 3001
netstat -an | findstr 3001

# Restart
npm run server
```

**Błędy analizy:**
- Sprawdź console (F12) w przeglądarce
- Sprawdź logi serwera w terminalu
- Fallback do Lichess Cloud działa automatycznie

**Performance issues:**
- Zmniejsz `depth` w `localStockfish.ts`
- Zwiększ `timeLimit` dla lepszej jakości
- Dostosuj `Hash` i `Threads` w server

## 🎖️ **Pro Tips**

1. **Use batch analysis** dla wielu pozycji
2. **Cache działa 10 minut** - powtórzone pozycje są instant
3. **Monitor RAM usage** - większy Hash = więcej RAM
4. **Background server** - zostaw włączony podczas grania
5. **Custom opening book** - dodaj swoje analizy do cache

## 🔧 **Development**

```bash
# Install dependencies
npm install
cd server && npm install

# Development mode z hot reload
npm run server:dev  # Terminal 1
npm run dev        # Terminal 2

# Or single command:
npm run full-dev
```

---

## 🏁 **Result**

Masz teraz **professional-grade chess analysis** z:
- ✅ **Własnym Stockfish serverem** 
- ✅ **Unlimited local analysis**
- ✅ **Smart fallback system**
- ✅ **Customizable engine settings**
- ✅ **Production-ready performance**

**Enjoy your personalized chess engine!** 🌟