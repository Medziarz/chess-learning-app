// Serwis profilu użytkownika - przechowuje preferencje i miasto
export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  city: string;
  voivodeship?: string;
  preferredRadius: number; // w km dla wyszukiwania turniejów
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserProfileService {
  private readonly STORAGE_KEY = 'chess-learning-app-profile';
  private currentProfile: UserProfile | null = null;

  /**
   * Pobiera profil użytkownika z localStorage
   */
  getProfile(): UserProfile | null {
    if (this.currentProfile) {
      return this.currentProfile;
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.currentProfile = JSON.parse(stored);
        return this.currentProfile;
      }
    } catch (error) {
      console.error('Błąd odczytu profilu:', error);
    }

    return null;
  }

  /**
   * Zapisuje profil użytkownika do localStorage
   */
  saveProfile(profile: UserProfile): void {
    try {
      profile.updatedAt = new Date();
      if (!profile.createdAt) {
        profile.createdAt = new Date();
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
      this.currentProfile = profile;
      
      console.log('✅ Profil zapisany:', profile.city);
    } catch (error) {
      console.error('❌ Błąd zapisu profilu:', error);
    }
  }

  /**
   * Aktualizuje miasto użytkownika
   */
  updateCity(city: string, voivodeship?: string): void {
    const profile = this.getProfile() || {
      city: '',
      preferredRadius: 100
    };

    profile.city = city;
    if (voivodeship) {
      profile.voivodeship = voivodeship;
    }

    this.saveProfile(profile);
  }

  /**
   * Aktualizuje promień wyszukiwania
   */
  updateRadius(radius: number): void {
    const profile = this.getProfile() || {
      city: '',
      preferredRadius: 100
    };

    profile.preferredRadius = radius;
    this.saveProfile(profile);
  }

  /**
   * Sprawdza czy użytkownik ma ustawione miasto
   */
  hasCity(): boolean {
    const profile = this.getProfile();
    return !!(profile && profile.city && profile.city.trim().length > 0);
  }

  /**
   * Pobiera miasto użytkownika
   */
  getUserCity(): string | null {
    const profile = this.getProfile();
    return profile?.city || null;
  }

  /**
   * Pobiera promień wyszukiwania użytkownika
   */
  getUserRadius(): number {
    const profile = this.getProfile();
    return profile?.preferredRadius || 100;
  }

  /**
   * Resetuje profil użytkownika
   */
  clearProfile(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.currentProfile = null;
      console.log('🗑️ Profil wyczyszczony');
    } catch (error) {
      console.error('❌ Błąd czyszczenia profilu:', error);
    }
  }

  /**
   * Pobiera domyślne miasta dla użytkowników bez ustawionego profilu
   */
  getDefaultCities(): string[] {
    return [
      'Warszawa', 'Kraków', 'Łódź', 'Wrocław', 'Poznań',
      'Gdańsk', 'Szczecin', 'Bydgoszcz', 'Lublin', 'Białystok',
      'Katowice', 'Częstochowa', 'Gdynia', 'Radom', 'Sosnowiec',
      'Toruń', 'Kielce', 'Gliwice', 'Zabrze', 'Bytom'
    ];
  }

  /**
   * Waliduje dane profilu
   */
  validateProfile(profile: Partial<UserProfile>): string[] {
    const errors: string[] = [];

    if (!profile.city || profile.city.trim().length === 0) {
      errors.push('Miasto jest wymagane');
    } else if (profile.city.length < 2) {
      errors.push('Nazwa miasta musi mieć co najmniej 2 znaki');
    } else if (profile.city.length > 50) {
      errors.push('Nazwa miasta nie może być dłuższa niż 50 znaków');
    }

    if (profile.preferredRadius !== undefined) {
      if (profile.preferredRadius < 10) {
        errors.push('Promień wyszukiwania musi być co najmniej 10 km');
      } else if (profile.preferredRadius > 500) {
        errors.push('Promień wyszukiwania nie może być większy niż 500 km');
      }
    }

    if (profile.name && profile.name.length > 100) {
      errors.push('Imię nie może być dłuższe niż 100 znaków');
    }

    if (profile.email && profile.email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profile.email)) {
        errors.push('Niepoprawny format adresu email');
      }
    }

    return errors;
  }

  /**
   * Pobiera statistyki profilu
   */
  getProfileStats() {
    const profile = this.getProfile();
    
    return {
      hasProfile: !!profile,
      hasCity: this.hasCity(),
      city: this.getUserCity(),
      radius: this.getUserRadius(),
      profileAge: profile?.createdAt ? 
        Math.floor((new Date().getTime() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)) 
        : 0,
      lastUpdate: profile?.updatedAt ? new Date(profile.updatedAt) : null
    };
  }
}

// Eksportuj singleton
export const userProfileService = new UserProfileService();