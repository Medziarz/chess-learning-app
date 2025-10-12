import React, { useState, useEffect } from 'react';
import { voivodeshipTournamentsService } from '../services/voivodeshipTournamentsService';
import { tournamentLinksService } from '../services/tournamentLinksService';
import type { VoivodeshipTournaments } from '../services/voivodeshipTournamentsService';
import type { TournamentLinks } from '../services/tournamentLinksService';

export const VoivodeshipDemo: React.FC = () => {
  const [allVoivodeships, setAllVoivodeships] = useState<VoivodeshipTournaments[]>([]);
  const [selectedVoivodeship, setSelectedVoivodeship] = useState<VoivodeshipTournaments | null>(null);
  const [userLinks, setUserLinks] = useState<TournamentLinks | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Załaduj dane
    const voivodeships = voivodeshipTournamentsService.getAllVoivodeships();
    setAllVoivodeships(voivodeships);
    
    // Załaduj linki użytkownika jeśli istnieją
    const links = tournamentLinksService.getTournamentLinksForUser();
    setUserLinks(links);
    
    // Załaduj statystyki
    const serviceStats = tournamentLinksService.getServiceStats();
    setStats(serviceStats);
  }, []);

  const handleVoivodeshipSelect = (voivodeship: VoivodeshipTournaments) => {
    setSelectedVoivodeship(voivodeship);
  };

  const handleCitySelect = (cityName: string) => {
    const links = tournamentLinksService.updateUserCityAndGetLinks(cityName);
    setUserLinks(links);
  };

  const testLinks = tournamentLinksService.getExampleLinks();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🗺️ System województw i turniejów</h1>
      
      {/* Statystyki */}
      {stats && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div>
            <h4>📊 Statystyki systemu</h4>
            <p>Województw: {stats.totalVoivodeships}</p>
            <p>Miast: {stats.totalCities}</p>
            <p>Ma profil: {stats.userProfile.hasProfile ? '✅' : '❌'}</p>
            <p>Ma miasto: {stats.userProfile.hasCity ? '✅' : '❌'}</p>
          </div>
          
          {stats.userProfile.hasCity && (
            <div>
              <h4>👤 Twój profil</h4>
              <p>Miasto: {stats.userProfile.city}</p>
              <p>Promień: {stats.userProfile.radius} km</p>
              <p>Wiek profilu: {stats.userProfile.profileAge} dni</p>
            </div>
          )}
        </div>
      )}

      {/* Aktualne linki użytkownika */}
      {userLinks && (
        <div style={{ 
          background: '#e8f5e8', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <h3>🎯 Twoje linki do turniejów</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <h4>♔ ChessManager</h4>
              <p>Miasto: {userLinks.city}</p>
              <p>Promień: {userLinks.radius} km</p>
              <p>Województwo: {userLinks.voivodeship}</p>
              <a 
                href={userLinks.chessManager} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  background: '#007bff', 
                  color: 'white', 
                  padding: '8px 15px', 
                  textDecoration: 'none', 
                  borderRadius: '5px',
                  display: 'inline-block' 
                }}
              >
                🔗 Otwórz ChessManager
              </a>
            </div>
            
            <div>
              <h4>🏛️ ChessArbiter</h4>
              <p>Wszystkie turnieje w Polsce</p>
              <a 
                href={userLinks.chessArbiter} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  background: '#28a745', 
                  color: 'white', 
                  padding: '8px 15px', 
                  textDecoration: 'none', 
                  borderRadius: '5px',
                  display: 'inline-block' 
                }}
              >
                🔗 Otwórz ChessArbiter  
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Lista województw */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        <div>
          <h3>📍 Wybierz województwo</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {allVoivodeships.map(voivodeship => (
              <div 
                key={voivodeship.id}
                onClick={() => handleVoivodeshipSelect(voivodeship)}
                style={{
                  padding: '10px',
                  margin: '5px 0',
                  border: selectedVoivodeship?.id === voivodeship.id ? '2px solid #007bff' : '1px solid #ddd',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  background: selectedVoivodeship?.id === voivodeship.id ? '#e3f2fd' : 'white'
                }}
              >
                <strong>{voivodeship.name}</strong>
                <br />
                <small>{voivodeship.code} • {voivodeship.popularCities.length} miast</small>
              </div>
            ))}
          </div>
        </div>

        <div>
          {selectedVoivodeship ? (
            <div>
              <h3>🏙️ Miasta w województwie {selectedVoivodeship.name}</h3>
              <p>{selectedVoivodeship.description}</p>
              
              <h4>Popularne miasta:</h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '10px',
                marginBottom: '20px' 
              }}>
                {selectedVoivodeship.popularCities.map(city => (
                  <button 
                    key={city}
                    onClick={() => handleCitySelect(city)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      background: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f0f0f0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <h4>🔗 Linki dla województwa:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '5px' }}>
                  <h5>ChessManager</h5>
                  <a 
                    href={selectedVoivodeship.chessManagerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {selectedVoivodeship.chessManagerUrl}
                  </a>
                </div>
                
                <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '5px' }}>
                  <h5>ChessArbiter</h5>
                  <a 
                    href={selectedVoivodeship.chessArbiterUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {selectedVoivodeship.chessArbiterUrl}
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <h3>👈 Wybierz województwo z listy</h3>
              <p>Kliknij na województwo, aby zobaczyć miasta i linki do turniejów</p>
            </div>
          )}
        </div>
      </div>

      {/* Przykładowe linki */}
      <div style={{ marginTop: '30px' }}>
        <h3>🌟 Przykładowe linki dla największych miast</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
          {testLinks.map(example => (
            <div 
              key={example.city} 
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '15px',
                background: 'white'
              }}
            >
              <h4>{example.city}</h4>
              <p>Województwo: {example.links.voivodeship}</p>
              
              <div style={{ marginTop: '10px' }}>
                <a 
                  href={example.links.chessManager}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    background: '#007bff',
                    color: 'white',
                    padding: '6px 12px',
                    textDecoration: 'none',
                    borderRadius: '3px',
                    marginRight: '10px',
                    fontSize: '14px'
                  }}
                >
                  ChessManager
                </a>
                
                <a 
                  href={example.links.chessArbiter}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    background: '#28a745',
                    color: 'white',
                    padding: '6px 12px',
                    textDecoration: 'none',
                    borderRadius: '3px',
                    fontSize: '14px'
                  }}
                >
                  ChessArbiter
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoivodeshipDemo;