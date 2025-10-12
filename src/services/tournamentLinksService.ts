// Główny serwis turniejów - łączy profil użytkownika z linkami do turniejów
import { voivodeshipTournamentsService } from './voivodeshipTournamentsService';
import { userProfileService } from './userProfileService';

export interface TournamentLinks {
  chessManager: string;
  chessArbiter: string;
  city: string;
  radius: number;
  voivodeship?: string;
}

export class TournamentLinksService {
  
  /**
   * Pobiera linki do turniejów dla aktualnie zalogowanego użytkownika
   */
  getTournamentLinksForUser(): TournamentLinks | null {
    const userCity = userProfileService.getUserCity();
    const userRadius = userProfileService.getUserRadius();

    if (!userCity) {
      return null;
    }

    return this.getTournamentLinksForCity(userCity, userRadius);
  }

  /**
   * Pobiera linki do turniejów dla konkretnego miasta
   */
  getTournamentLinksForCity(cityName: string, radius: number = 100): TournamentLinks {
    const voivodeship = voivodeshipTournamentsService.findVoivodeshipByCity(cityName);
    
    return {
      chessManager: voivodeshipTournamentsService.getChessManagerLinkForCity(cityName, radius),
      chessArbiter: voivodeshipTournamentsService.getChessArbiterLinkForCity(cityName),
      city: cityName,
      radius: radius,
      voivodeship: voivodeship?.name
    };
  }

  /**
   * Pobiera linki do turniejów dla wszystkich popularnych miast
   */
  getAllCityTournamentLinks(): TournamentLinks[] {
    const cities = userProfileService.getDefaultCities();
    
    return cities.map(city => this.getTournamentLinksForCity(city));
  }

  /**
   * Pobiera linki do turniejów dla wszystkich miast w danym województwie
   */
  getTournamentLinksForVoivodeship(voivodeshipId: string): TournamentLinks[] {
    const cities = voivodeshipTournamentsService.getCitiesInVoivodeship(voivodeshipId);
    
    return cities.map(city => this.getTournamentLinksForCity(city));
  }

  /**
   * Aktualizuje miasto użytkownika i zwraca nowe linki
   */
  updateUserCityAndGetLinks(cityName: string, radius: number = 100): TournamentLinks {
    // Znajdź województwo na podstawie miasta
    const voivodeship = voivodeshipTournamentsService.findVoivodeshipByCity(cityName);
    
    // Aktualizuj profil użytkownika
    userProfileService.updateCity(cityName, voivodeship?.name);
    userProfileService.updateRadius(radius);

    // Zwróć linki dla nowego miasta
    return this.getTournamentLinksForCity(cityName, radius);
  }

  /**
   * Pobiera linki z opisami dla interfejsu użytkownika
   */
  getTournamentLinksWithDescriptions(): Array<{
    platform: string;
    url: string;
    description: string;
    icon: string;
  }> | null {
    const links = this.getTournamentLinksForUser();
    
    if (!links) {
      return null;
    }

    return [
      {
        platform: 'ChessManager',
        url: links.chessManager,
        description: `Turnieje w ${links.city} i okolicy (${links.radius} km)`,
        icon: '♔'
      },
      {
        platform: 'ChessArbiter',
        url: links.chessArbiter,
        description: `Wszystkie turnieje w Polsce`,
        icon: '🏛️'
      }
    ];
  }

  /**
   * Generuje linki z różnymi promieniami wyszukiwania
   */
  getTournamentLinksWithMultipleRadius(cityName: string): Array<{
    radius: number;
    description: string;
    links: TournamentLinks;
  }> {
    const radiusOptions = [25, 50, 100, 200];
    
    return radiusOptions.map(radius => ({
      radius,
      description: `W promieniu ${radius} km od ${cityName}`,
      links: this.getTournamentLinksForCity(cityName, radius)
    }));
  }

  /**
   * Waliduje czy miasto jest poprawne
   */
  validateCity(cityName: string): { isValid: boolean; suggestion?: string } {
    if (!cityName || cityName.trim().length < 2) {
      return { isValid: false };
    }

    const trimmedCity = cityName.trim();
    const defaultCities = userProfileService.getDefaultCities();
    
    // Sprawdź czy miasto jest w liście popularnych miast
    const exactMatch = defaultCities.find(city => 
      city.toLowerCase() === trimmedCity.toLowerCase()
    );

    if (exactMatch) {
      return { isValid: true };
    }

    // Szukaj podobnego miasta
    const suggestion = defaultCities.find(city =>
      city.toLowerCase().includes(trimmedCity.toLowerCase()) ||
      trimmedCity.toLowerCase().includes(city.toLowerCase())
    );

    return {
      isValid: true, // Akceptujemy wszystkie miasta, ale sugerujemy popularne
      suggestion: suggestion
    };
  }

  /**
   * Pobiera statistyki użycia serwisu
   */
  getServiceStats() {
    const profile = userProfileService.getProfileStats();
    const allVoivodeships = voivodeshipTournamentsService.getAllVoivodeships();
    
    return {
      userProfile: profile,
      totalVoivodeships: allVoivodeships.length,
      totalCities: allVoivodeships.reduce((sum, v) => sum + v.popularCities.length, 0),
      hasUserLinks: !!this.getTournamentLinksForUser(),
      defaultCitiesCount: userProfileService.getDefaultCities().length
    };
  }

  /**
   * Pobiera przykładowe linki dla demonstracji
   */
  getExampleLinks() {
    return [
      {
        city: 'Warszawa',
        links: this.getTournamentLinksForCity('Warszawa')
      },
      {
        city: 'Kraków', 
        links: this.getTournamentLinksForCity('Kraków')
      },
      {
        city: 'Gdańsk',
        links: this.getTournamentLinksForCity('Gdańsk')
      }
    ];
  }
}

// Eksportuj singleton
export const tournamentLinksService = new TournamentLinksService();