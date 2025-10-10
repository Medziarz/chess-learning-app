# Chess Learning App 🎯

Aplikacja do nauki szachów z **automatycznym zapisywaniem partii!** Stworzona w React z TypeScript.

## 🎮 Funkcjonalności

### ✅ Podstawowe
- **Interaktywna szachownica** - przeciągnij figury aby wykonać ruch
- **Walidacja ruchów** - tylko legalne ruchy są akceptowane  
- **Status gry** - pokazuje czyj ruch, wykrywa mata i remis
- **Historia ruchów** - wszystkie ruchy w notacji szachowej

### 🆕 Nowe - Zapisywanie Partii
- **📱 Automatyczny zapis** - każdy ruch zapisuje się do localStorage
- **🔄 Kontynuacja gry** - wróć do gry po odświeżeniu strony
- **📚 Historia partii** - przeglądaj ostatnie 5 zakończonych gier
- **⏱️ Śledzenie czasu** - monitoruj czas trwania partii
- **🎯 Statystyki** - liczba ruchów, wynik, czas gry
- ✅ Reset gry
- ✅ Responsywny design

## Technologie

- **React 18** - biblioteka UI
- **TypeScript** - typowanie statyczne
- **Vite** - narzędzie do budowania
- **chess.js** - logika gry w szachy
- **react-chessboard** - komponent szachownicy

## Instalacja i uruchomienie

1. Sklonuj repozytorium
2. Zainstaluj zależności:
   ```bash
   npm install
   ```

3. Uruchom serwer deweloperski:
   ```bash
   npm run dev
   ```

4. Otwórz [http://localhost:5173](http://localhost:5173) w przeglądarce

## Skrypty

- `npm run dev` - uruchomienie serwera deweloperskiego
- `npm run build` - budowanie aplikacji do produkcji
- `npm run preview` - podgląd zbudowanej aplikacji
- `npm run lint` - sprawdzanie kodu z ESLint

## Struktura projektu

```
src/
  ├── App.tsx          # Główny komponent aplikacji
  ├── App.css          # Style aplikacji
  ├── main.tsx         # Punkt wejścia aplikacji
  └── index.css        # Globalne style
```

## Jak grać

1. Kliknij na figurę, którą chcesz ruszyć
2. Kliknij na pole docelowe
3. Aplikacja automatycznie waliduje ruchy
4. Historia ruchów jest zapisywana po prawej stronie
5. Użyj przycisku "Nowa gra" aby zacząć od nowa

## Planowane funkcjonalności

- 🎯 Puzzle szachowe
- 📊 Analiza partii
- 🤖 Gra przeciwko komputerowi
- 📚 Sekcja edukacyjna z zasadami
- 💾 Zapisywanie partii
- 🎨 Różne motywy szachownicy

## Licencja

MIT