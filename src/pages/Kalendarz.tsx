import { useState } from 'react'

interface CalendarEvent {
  id: string
  date: string
  time: string
  title: string
  type: 'tournament' | 'training' | 'analysis' | 'study'
  description?: string
  completed?: boolean
}

export function Kalendarz() {
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      date: '2024-10-15',
      time: '18:00',
      title: 'Turniej Błyskawiczny',
      type: 'tournament',
      description: 'Turniej online 3+2 na Lichess'
    },
    {
      id: '2',
      date: '2024-10-16',
      time: '19:30',
      title: 'Analiza Partii',
      type: 'analysis',
      description: 'Analiza ostatnich partii z treningu'
    },
    {
      id: '3',
      date: '2024-10-18',
      time: '17:00',
      title: 'Trening Taktyczny',
      type: 'training',
      description: 'Ćwiczenia z rozwiązywania zadań taktycznych',
      completed: true
    }
  ])

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    date: selectedDate,
    time: '18:00',
    type: 'training'
  })

  const addEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      const event: CalendarEvent = {
        id: Date.now().toString(),
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        type: newEvent.type as CalendarEvent['type'],
        description: newEvent.description
      }
      setEvents([...events, event])
      setNewEvent({ date: selectedDate, time: '18:00', type: 'training' })
      setShowAddForm(false)
    }
  }

  const toggleEventCompletion = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, completed: !event.completed }
        : event
    ))
  }

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId))
  }

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date)
  }

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'tournament': return '🏆'
      case 'training': return '💪'
      case 'analysis': return '🔍'
      case 'study': return '📚'
      default: return '📅'
    }
  }

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'tournament': return '#FFD700'
      case 'training': return '#4CAF50'
      case 'analysis': return '#2196F3'
      case 'study': return '#9C27B0'
      default: return '#666'
    }
  }

  return (
    <div className="tab-content">
      <h2>📅 Kalendarz treningowy</h2>
      
      <div className="calendar-container">
        <div className="calendar-header">
          <div className="date-picker">
            <label>Wybierz datę:</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          
          <button 
            className="add-event-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            ➕ Dodaj wydarzenie
          </button>
        </div>

        {showAddForm && (
          <div className="add-event-form">
            <h3>Nowe wydarzenie</h3>
            <div className="form-row">
              <input
                type="text"
                placeholder="Tytuł wydarzenia"
                value={newEvent.title || ''}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              />
            </div>
            <div className="form-row">
              <input
                type="date"
                value={newEvent.date || selectedDate}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
              />
              <input
                type="time"
                value={newEvent.time || '18:00'}
                onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
              />
            </div>
            <div className="form-row">
              <select
                value={newEvent.type || 'training'}
                onChange={(e) => setNewEvent({...newEvent, type: e.target.value as CalendarEvent['type']})}
              >
                <option value="training">💪 Trening</option>
                <option value="tournament">🏆 Turniej</option>
                <option value="analysis">🔍 Analiza</option>
                <option value="study">📚 Nauka</option>
              </select>
            </div>
            <div className="form-row">
              <textarea
                placeholder="Opis (opcjonalny)"
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              />
            </div>
            <div className="form-actions">
              <button onClick={addEvent} className="save-btn">Zapisz</button>
              <button onClick={() => setShowAddForm(false)} className="cancel-btn">Anuluj</button>
            </div>
          </div>
        )}

        <div className="events-for-date">
          <h3>Wydarzenia na {new Date(selectedDate).toLocaleDateString('pl-PL')}</h3>
          
          {getEventsForDate(selectedDate).length === 0 ? (
            <p className="no-events">Brak wydarzeń na wybrany dzień</p>
          ) : (
            <div className="events-list">
              {getEventsForDate(selectedDate).map(event => (
                <div 
                  key={event.id} 
                  className={`event-item ${event.completed ? 'completed' : ''}`}
                  style={{ borderLeft: `4px solid ${getEventTypeColor(event.type)}` }}
                >
                  <div className="event-header">
                    <span className="event-icon">{getEventTypeIcon(event.type)}</span>
                    <h4>{event.title}</h4>
                    <span className="event-time">{event.time}</span>
                  </div>
                  
                  {event.description && (
                    <p className="event-description">{event.description}</p>
                  )}
                  
                  <div className="event-actions">
                    <button 
                      onClick={() => toggleEventCompletion(event.id)}
                      className={event.completed ? 'uncomplete-btn' : 'complete-btn'}
                    >
                      {event.completed ? '↩️ Cofnij' : '✅ Oznacz jako ukończone'}
                    </button>
                    <button 
                      onClick={() => deleteEvent(event.id)}
                      className="delete-btn"
                    >
                      🗑️ Usuń
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="calendar-stats">
          <h3>Statystyki</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{events.length}</span>
              <span className="stat-label">Wszystkich wydarzeń</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{events.filter(e => e.completed).length}</span>
              <span className="stat-label">Ukończonych</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{events.filter(e => e.type === 'tournament').length}</span>
              <span className="stat-label">Turniejów</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{events.filter(e => e.type === 'training').length}</span>
              <span className="stat-label">Treningów</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}