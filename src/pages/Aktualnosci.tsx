import { useState } from 'react'

interface NewsItem {
  id: string
  title: string
  summary: string
  content: string
  date: string
  category: 'tournament' | 'update' | 'tip' | 'news'
  author: string
  readTime: number
  image?: string
}

export function Aktualnosci() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | NewsItem['category']>('all')
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null)
  
  const [news] = useState<NewsItem[]>([
    {
      id: '1',
      title: 'Nowa funkcja analizy pozycji',
      summary: 'Dodaliśmy zaawansowaną analizę chmurową wykorzystującą API Lichess',
      content: `Cieszymy się, że możemy przedstawić nową funkcję analizy pozycji w naszej aplikacji. 

Dzięki integracji z API Lichess, możesz teraz:
• Analizować pozycje w czasie rzeczywistym
• Otrzymywać sugestie najlepszych ruchów
• Sprawdzać głębokość analizy do 20 półruchów
• Korzystać z bazy danych milionów partii

Funkcja jest dostępna w zakładce Analiza i działa całkowicie w chmurze, co oznacza szybkie wyniki bez obciążania twojego urządzenia.

Aby skorzystać z analizy, po prostu ustaw pozycję na szachownicy i obserwuj automatyczne sugestie.`,
      date: '2024-10-10',
      category: 'update',
      author: 'Zespół Chess Learning',
      readTime: 3
    },
    {
      id: '2',
      title: 'Mistrzostwa Świata 2024 - Podsumowanie',
      summary: 'Ding Liren obronił tytuł mistrza świata w emocjonującym finale',
      content: `Mistrzostwa Świata w Szachach 2024 dobiegły końca spektakularnym zwycięstwem Ding Lirena.

Kluczowe momenty turnieju:
• 14 partii klasycznych
• Niesamowita 11. partia z sacrificium hetmana
• Dogrywka w rapid, gdzie Ding pokazał swoją klasę
• Gukesh walczył dzielnie, ale doświadczenie przeważyło

To był jeden z najbardziej emocjonujących meczów o tytuł w ostatnich latach. Obie strony prezentowały najwyższy poziom szachowy.

Gratulujemy mistrzowi i dziękujemy za wspaniały spektakl szachowy!`,
      date: '2024-10-08',
      category: 'tournament',
      author: 'Redakcja Chess News',
      readTime: 5
    },
    {
      id: '3',
      title: '5 wskazówek na poprawę gry taktycznej',
      summary: 'Praktyczne rady jak rozwijać wzrok taktyczny i rozwiązywać kombinacje',
      content: `Taktyka to fundament każdej silnej gry szachowej. Oto 5 sprawdzonych metod na jej rozwój:

1. **Codzienne zadania taktyczne**
   Rozwiązuj minimum 10-15 zadań dziennie. Regularność to klucz.

2. **Analizuj bez poruszania figur**
   Trenuj obliczanie wariantów w głowie, nie na szachownicy.

3. **Ucz się podstawowych motywów**
   Widelec, związanie, odkrycie - poznaj je na pamięć.

4. **Studiuj partie mistrzów**
   Patrz jak wielcy gracze wykorzystują taktykę w praktyce.

5. **Graj szybkie partie**
   Blitz zmusza do szybkich decyzji taktycznych.

Pamiętaj: taktyka wygrawa partie, ale strategia wygrawa turnieje!`,
      date: '2024-10-05',
      category: 'tip',
      author: 'Mistrz FIDE Adam Kowalski',
      readTime: 4
    },
    {
      id: '4',
      title: 'Chess.com vs Lichess - które wybrać?',
      summary: 'Porównanie dwóch najpopularniejszych platform do gry online',
      content: `Ciągły dylemat każdego szachisty: gdzie grać online? Oto obiektywne porównanie:

**Chess.com**
✅ Profesjonalne lekcje i kursy
✅ Lepsze narzędzia analizy (premium)
✅ Większa baza użytkowników
❌ Większość funkcji płatna
❌ Reklamy w wersji darmowej

**Lichess**
✅ Całkowicie darmowy
✅ Open source
✅ Szybsze ładowanie
✅ Świetna analiza komputerowa
❌ Mniej funkcji edukacyjnych
❌ Prostszy interfejs

**Nasze zdanie:** Dla początkujących - Lichess. Dla zaawansowanych - Chess.com Premium.

A ty, gdzie grasz najchętniej?`,
      date: '2024-10-03',
      category: 'news',
      author: 'Zespół Chess Learning',
      readTime: 3
    },
    {
      id: '5',
      title: 'Turniej Candidates 2025 - harmonogram',
      summary: 'Poznaj daty i uczestników najbliższego turnieju pretendentów',
      content: `FIDE ogłosiła oficjalny harmonogram Turnieju Candidates 2025:

**Daty:** 3-25 kwietnia 2025
**Miejsce:** Toronto, Kanada
**Format:** Podwójny round-robin (14 rund)

**Potwierdzeni uczestnicy:**
• Fabiano Caruana (USA)
• Hikaru Nakamura (USA) 
• Ian Nepomniachtchi (CFR)
• Gukesh Dommaraju (Indie)
• Praggnanandhaa R. (Indie)
• Alireza Firouzja (Francja)
• Nodirbek Abdusattorov (Uzbekistan)
• Vidit Gujrathi (Indie)

Zwycięzca zmierzy się z aktualnym mistrzem świata Ding Lirenem w 2025 roku.

To będzie prawdopodobnie najsilniejszy turniej Candidates w historii!`,
      date: '2024-10-01',
      category: 'tournament',
      author: 'FIDE Communications',
      readTime: 2
    }
  ])

  const getCategoryIcon = (category: NewsItem['category']) => {
    switch (category) {
      case 'tournament': return '🏆'
      case 'update': return '🔄'
      case 'tip': return '💡'
      case 'news': return '📰'
      default: return '📄'
    }
  }

  const getCategoryName = (category: NewsItem['category']) => {
    switch (category) {
      case 'tournament': return 'Turnieje'
      case 'update': return 'Aktualizacje'
      case 'tip': return 'Poradniki'
      case 'news': return 'Wiadomości'
      default: return 'Inne'
    }
  }

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory)

  const openArticle = (article: NewsItem) => {
    setSelectedArticle(article)
  }

  const closeArticle = () => {
    setSelectedArticle(null)
  }

  if (selectedArticle) {
    return (
      <div className="tab-content">
        <div className="article-view">
          <div className="article-header">
            <button onClick={closeArticle} className="back-button">
              ← Powrót do aktualności
            </button>
            <div className="article-meta">
              <span className="article-category">
                {getCategoryIcon(selectedArticle.category)} {getCategoryName(selectedArticle.category)}
              </span>
              <span className="article-date">{selectedArticle.date}</span>
              <span className="read-time">⏱️ {selectedArticle.readTime} min</span>
            </div>
          </div>
          
          <article className="article-content">
            <h1>{selectedArticle.title}</h1>
            <p className="article-summary">{selectedArticle.summary}</p>
            <div className="article-body">
              {selectedArticle.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div className="article-footer">
              <p><strong>Autor:</strong> {selectedArticle.author}</p>
            </div>
          </article>
        </div>
      </div>
    )
  }

  return (
    <div className="tab-content">
      <h2>📰 Aktualności szachowe</h2>
      
      <div className="news-container">
        {/* Panel filtrów */}
        <div className="news-panel">
          <h3>🔍 Kategorie</h3>
          <div className="panel-content">
            <div className="category-filters">
              <button 
                className={selectedCategory === 'all' ? 'active' : ''}
                onClick={() => setSelectedCategory('all')}
              >
                📄 Wszystkie ({news.length})
              </button>
              {(['tournament', 'update', 'tip', 'news'] as const).map(category => {
                const count = news.filter(item => item.category === category).length
                return (
                  <button 
                    key={category}
                    className={selectedCategory === category ? 'active' : ''}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {getCategoryIcon(category)} {getCategoryName(category)} ({count})
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Panel artykułów */}
        <div className="news-panel">
          <h3>📄 Najnowsze artykuły</h3>
          <div className="panel-content">
            <div className="news-list">
              {filteredNews.length === 0 ? (
                <p className="no-news">Brak aktualności w wybranej kategorii</p>
              ) : (
                filteredNews.map(article => (
                  <div 
                    key={article.id}
                    className="news-item"
                    onClick={() => openArticle(article)}
                  >
                    <div className="news-header">
                      <div className="news-category">
                        {getCategoryIcon(article.category)} {getCategoryName(article.category)}
                      </div>
                      <div className="news-date">{article.date}</div>
                    </div>
                    
                    <h3 className="news-title">{article.title}</h3>
                    <p className="news-summary">{article.summary}</p>
                    
                    <div className="news-footer">
                      <span className="news-author">👤 {article.author}</span>
                      <span className="read-time">⏱️ {article.readTime} min</span>
                      <span className="read-more">Czytaj więcej →</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Panel popularne i wydarzenia */}
        <div className="news-panel">
          <h3>🔥 Popularne tematy</h3>
          <div className="panel-content">
            <div className="popular-topics">
              <div className="topic-item">📊 Analiza pozycji</div>
              <div className="topic-item">🏆 Turnieje online</div>
              <div className="topic-item">⚡ Taktyka szachowa</div>
              <div className="topic-item">📚 Otwarcia</div>
            </div>
          </div>
        </div>

        {/* Panel wydarzeń */}
        <div className="news-panel">
          <h3>📅 Nadchodzące wydarzenia</h3>
          <div className="panel-content">
            <div className="upcoming-events">
              <div className="event-item">
                <strong>15.10.2024</strong> - Turniej Błyskawiczny
              </div>
              <div className="event-item">
                <strong>20.10.2024</strong> - Webinar: Końcówki
              </div>
              <div className="event-item">
                <strong>25.10.2024</strong> - Liga Online
              </div>
            </div>
          </div>
        </div>

        {/* Panel wskazówki */}
        <div className="news-panel">
          <h3>💡 Wskazówka dnia</h3>
          <div className="panel-content">
            <div className="tip-of-day">
              <p>W końcówkach król staje się aktywną figurą. Centralizuj go i używaj do ataku na pionki przeciwnika!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}