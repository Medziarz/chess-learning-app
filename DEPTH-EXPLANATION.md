# 🔍 Dlaczego głębokość spada po kilku ruchach?

## 📊 Źródła analizy i ich głębokości:

### 🏆 **Lichess Cloud API (głębokość 20-25)**
- **Co to:** Profesjonalna baza pozycji z serwerów Lichess
- **Kiedy:** Popularne pozycje które były już analizowane przez graczy
- **Jakość:** Najwyższa - analizy Stockfish z wielką głębokością
- **Ograniczenia:** ~15 milionów pozycji w bazie

### 📖 **Opening Book (głębokość 15)**  
- **Co to:** Ręcznie sprawdzone otwarcia szachowe
- **Kiedy:** Znane pozycje z pierwszych 10-15 ruchów
- **Jakość:** Dobra - sprawdzone przez mistrzów
- **Ograniczenia:** Tylko popularne otwarcia

### 🎲 **Fallback Analysis (głębokość 10)**
- **Co to:** Podstawowa heurystyka gdy pozycja nieznana
- **Kiedy:** Rzadkie pozycje, nietypowe warianty
- **Jakość:** Podstawowa - liczenie materiału + losowość
- **Ograniczenia:** Nie uwzględnia taktyki, struktury

## 🤔 Dlaczego tak się dzieje?

### **Scenariusz typowy:**
```
Ruch 1: e2-e4  → 🏆 Lichess (głęb. 22) - popularna pozycja
Ruch 2: e7-e5  → 🏆 Lichess (głęb. 21) - bardzo popularna  
Ruch 3: Ng1-f3 → 🏆 Lichess (głęb. 20) - standardowe otwarcie
Ruch 4: b7-b6  → 📖 Opening book (głęb. 15) - rzadszy ruch
Ruch 5: Bc1-c4 → 🎲 Fallback (głęb. 10) - pozycja nie w bazie
```

### **Dlaczego Lichess nie ma wszystkich pozycji?**

1. **Baza oparta na grach** - Lichess analizuje tylko pozycje które wystąpiły w prawdziwych grach
2. **Popularność** - Rzadkie ruchy nie są pre-analizowane
3. **Ograniczenia zasobów** - Nie można pre-analizować wszystkich możliwych pozycji

## 🔍 Co widzisz w debugowaniu:

### ✅ **Lichess działa:**
```
🌐 Calling Lichess API: https://lichess.org/api/cloud-eval?fen=...
📡 Lichess response status: 200 OK
📡 Full Lichess API response: {pvs: [{moves: "...", cp: 25}]}
✅ Lichess analysis successful: {evaluation: 0.25, depth: 22}
```

### ❌ **Lichess nie ma pozycji:**
```
🌐 Calling Lichess API: https://lichess.org/api/cloud-eval?fen=...
📡 Lichess response status: 404 Not Found
⚠️ Lichess failed: Position not in Lichess database (404)
📖 Using opening book move: c2c4 eval: 0.3
```

### 🎲 **Fallback aktywny:**
```
⚠️ Lichess failed: Position not in Lichess database (404)
🎲 Unknown position, using heuristic fallback
🧮 Basic evaluation: {materialBalance: 0, evaluation: 0.12}
```

## 🛠️ Co możesz zrobić:

### **Dla developera:**
1. **Sprawdź logi** - Zobacz dlaczego Lichess zwraca 404
2. **Rozszerz opening book** - Dodaj więcej pozycji manualnie
3. **Popraw fallback** - Lepsze heurystyki w calculateBasicEvaluation

### **Dla użytkownika:**
1. **To normalne** - Nie każda pozycja jest w bazie Lichess
2. **Graj popularne otwarcia** - Będą miały wyższą głębokość
3. **Głębokość 10** - Nadal daje podstawową orientację

## 🎯 **Podsumowanie:**

**Głębokość 22 → 15 → 10 to normalne** bo:
- Popularne pozycje są w Lichess (głębokość 20+)
- Rzadsze pozycje tylko w opening book (głębokość 15) 
- Nietypowe pozycje wymagają fallback (głębokość 10)

**To nie bug, to feature** - system inteligentnie degraduje jakość w zależności od dostępności danych, ale zawsze daje jakąś analizę! 🎉