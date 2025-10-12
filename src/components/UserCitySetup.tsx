import React, { useState, useEffect } from 'react';
import { userProfileService } from '../services/userProfileService';
import { tournamentLinksService } from '../services/tournamentLinksService';
import type { TournamentLinks } from '../services/tournamentLinksService';
import './UserCitySetup.css';

interface UserCitySetupProps {
  onCitySet?: (links: TournamentLinks) => void;
}

export const UserCitySetup: React.FC<UserCitySetupProps> = ({ onCitySet }) => {
  const [city, setCity] = useState('');
  const [radius, setRadius] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [currentLinks, setCurrentLinks] = useState<TournamentLinks | null>(null);

  // Wczytaj istniejące dane użytkownika
  useEffect(() => {
    const existingLinks = tournamentLinksService.getTournamentLinksForUser();
    if (existingLinks) {
      setCity(existingLinks.city);
      setRadius(existingLinks.radius);
      setCurrentLinks(existingLinks);
    }
  }, []);

  const handleCityChange = (value: string) => {
    setCity(value);
    setError(null);
    setSuggestion(null);

    if (value.length >= 2) {
      const validation = tournamentLinksService.validateCity(value);
      if (validation.suggestion) {
        setSuggestion(validation.suggestion);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!city.trim()) {
      setError('Podaj nazwę miasta');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Waliduj profil
      const errors = userProfileService.validateProfile({ city: city.trim(), preferredRadius: radius });
      
      if (errors.length > 0) {
        setError(errors[0]);
        return;
      }

      // Aktualizuj miasto i pobierz linki
      const links = tournamentLinksService.updateUserCityAndGetLinks(city.trim(), radius);
      setCurrentLinks(links);
      
      // Powiadom rodzica o nowych linkach
      onCitySet?.(links);

      console.log('✅ Miasto ustawione:', city.trim());
    } catch (err) {
      setError('Błąd podczas zapisywania miasta');
      console.error('❌ Błąd ustawiania miasta:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = () => {
    if (suggestion) {
      setCity(suggestion);
      setSuggestion(null);
    }
  };

  const handleClearCity = () => {
    userProfileService.clearProfile();
    setCity('');
    setRadius(100);
    setCurrentLinks(null);
    setError(null);
    setSuggestion(null);
  };

  const defaultCities = userProfileService.getDefaultCities();

  return (
    <div className="user-city-setup">
      <div className="setup-header">
        <h3>📍 Ustawienia lokalizacji</h3>
        <p>Podaj swoje miasto, aby otrzymać linki do turniejów w okolicy</p>
      </div>

      <form onSubmit={handleSubmit} className="city-form">
        <div className="form-group">
          <label htmlFor="city">Twoje miasto:</label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            placeholder="np. Warszawa, Kraków, Gdańsk..."
            disabled={isLoading}
            className="city-input"
          />
          
          {suggestion && (
            <div className="suggestion">
              <span>Czy chodziło Ci o: </span>
              <button
                type="button"
                onClick={handleSuggestionClick}
                className="suggestion-btn"
              >
                {suggestion}
              </button>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="radius">Promień wyszukiwania:</label>
          <select
            id="radius"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            disabled={isLoading}
            className="radius-select"
          >
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
            <option value={100}>100 km</option>
            <option value={200}>200 km</option>
          </select>
        </div>

        {error && (
          <div className="error-message">
            ⚠ {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={isLoading || !city.trim()}
            className="save-btn"
          >
            {isLoading ? '⌛ Zapisuję...' : '✓ Zapisz miasto'}
          </button>

          {currentLinks && (
            <button
              type="button"
              onClick={handleClearCity}
              className="clear-btn"
            >
              ✕ Wyczyść
            </button>
          )}
        </div>
      </form>

      {/* Popularne miasta */}
      <div className="popular-cities">
        <h4>Popularne miasta:</h4>
        <div className="cities-grid">
          {defaultCities.slice(0, 8).map(cityName => (
            <button
              key={cityName}
              onClick={() => setCity(cityName)}
              className="city-chip"
              disabled={isLoading}
            >
              {cityName}
            </button>
          ))}
        </div>
      </div>

      {/* Aktualne linki */}
      {currentLinks && (
        <div className="current-links">
          <h4>� Twoje linki do turniejów:</h4>
          <div className="links-container">
            <div className="link-card">
              <h5>♟️ ChessManager</h5>
              <p>Turnieje w {currentLinks.city} ({currentLinks.radius} km)</p>
              <a 
                href={currentLinks.chessManager} 
                target="_blank" 
                rel="noopener noreferrer"
                className="tournament-link"
              >
                → Otwórz ChessManager
              </a>
            </div>

            <div className="link-card">
              <h5>� ChessArbiter</h5>
              <p>Wszystkie turnieje w Polsce</p>
              <a 
                href={currentLinks.chessArbiter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="tournament-link"
              >
                → Otwórz ChessArbiter
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCitySetup;