// Serwis turniejów szachowych z podziałem na województwa
export interface VoivodeshipTournaments {
  id: string;
  name: string;
  code: string;
  chessArbiterUrl: string;
  chessManagerUrl: string;
  description: string;
  popularCities: string[];
}

export class VoivodeshipTournamentsService {
  
  /**
   * Pobiera wszystkie województwa z linkami do turniejów
   */
  getAllVoivodeships(): VoivodeshipTournaments[] {
    return [
      {
        id: 'dolnoslaskie',
        name: 'Dolnośląskie',
        code: 'DS',
        chessArbiterUrl: 'https://www.chessarbiter.com/turnieje.php',
        chessManagerUrl: 'https://www.chessmanager.com/pl-pl/tournaments?region=dolnoslaskie',
        description: 'Turnieje szachowe w województwie dolnośląskim',
        popularCities: ['Wrocław', 'Legnica', 'Wałbrzych', 'Jelenia Góra', 'Lubin']
      },
      {
        id: 'kujawsko-pomorskie',
        name: 'Kujawsko-Pomorskie',
        code: 'KP',
        chessArbiterUrl: 'https://www.chessarbiter.com/turnieje.php',
        chessManagerUrl: 'https://www.chessmanager.com/pl-pl/tournaments?region=kujawsko-pomorskie',
        description: 'Turnieje szachowe w województwie kujawsko-pomorskim',
        popularCities: ['Bydgoszcz', 'Toruń', 'Włocławek', 'Grudziądz', 'Inowrocław']
      },
      {
        id: 'lubelskie',
        name: 'Lubelskie',
        code: 'LU',
        chessArbiterUrl: 'https://www.chessarbiter.com/turnieje.php',
        chessManagerUrl: 'https://www.chessmanager.com/pl-pl/tournaments?region=lubelskie',
        description: 'Turnieje szachowe w województwie lubelskim',
        popularCities: ['Lublin', 'Chełm', 'Zamość', 'Biała Podlaska', 'Puławy']
      },
      {
        id: 'lubuskie',
        name: 'Lubuskie',
        code: 'LB',
        chessArbiterUrl: 'https://www.chessarbiter.com/turnieje.php',
        chessManagerUrl: 'https://www.chessmanager.com/pl-pl/tournaments?region=lubuskie',
        description: 'Turnieje szachowe w województwie lubuskim',
        popularCities: ['Gorzów Wielkopolski', 'Zielona Góra', 'Żary', 'Żagań', 'Nowa Sól']
      },
      {
        id: 'lodzkie',
        name: 'Łódzkie',
        code: 'LD',
        chessArbiterUrl: 'https://www.chessarbiter.com/turnieje.php',
        chessManagerUrl: 'https://www.chessmanager.com/pl-pl/tournaments?region=lodzkie',
        description: 'Turnieje szachowe w województwie łódzkim',
        popularCities: ['Łódź', 'Piotrków Trybunalski', 'Pabianice', 'Tomaszów Mazowiecki', 'Zgierz']
      },
      {
        id: 'malopolskie',
        name: 'Małopolskie',
        code: 'MP',
        chessArbiterUrl: 'https://www.chessarbiter.com/turnieje.php',
        chessManagerUrl: 'https://www.chessmanager.com/pl-pl/tournaments?region=malopolskie',
        description: 'Turnieje szachowe w województwie małopolskim',
        popularCities: ['Kraków', 'Tarnów', 'Nowy Sącz', 'Oświęcim', 'Chrzanów']
      },
      {
        id: 'mazowieckie',
        name: 'Mazowieckie',
        code: 'MA',
        chessArbiterUrl: 'https://www.chessarbiter.com/turnieje.php',
        chessManagerUrl: 'https://www.chessmanager.com/pl-pl/tournaments?region=mazowieckie',
        description: 'Turnieje szachowe w województwie mazowieckim',
        popularCities: ['Warszawa', 'Radom', 'Płock', 'Siedlce', 'Pruszków']
      },
      {
        id: 'opolskie',
        name: 'Opolskie',
        code: 'OP',
        chessArbiterUrl: 'https://www.chessarbiter.com/turnieje.php',
        chessManagerUrl: 'https://www.chessmanager.com/pl-pl/tournaments?region=opolskie',
        description: 'Turnieje szachowe w województwie opolskim',
        popularCities: ['Opole', 'Kędzierzyn-Koźle', 'Nysa', 'Brzeg', 'Kluczbork']
      },
      {
        id: 'podkarpackie',
        name: 'Podkarpackie',
        code: 'PK',
        chessArbiterUrl: 'https://www.chessarbiter.com/turnieje.php',
        chessManagerUrl: 'https://www.chessmanager.com/pl-pl/tournaments?region=podkarpackie',
        description: 'Turnieje szachowe w województwie podkarpackim',
        popularCities: ['Rzeszów', 'Przemyśl', 'Stalowa Wola', 'Mielec', 'Tarnobrzeg']
      },
      {
        id: 'podlaskie',
        name: 'Podlaskie',
        code: 'PL',
        chessArbiterUrl: 'https://www.chessarbiter.com/turnieje.php',
        chessManagerUrl: 'https://www.chessmanager.com/pl-pl/tournaments?region=podlaskie',
        description: 'Turnieje szachowe w województwie podlaskim',
        popularCities: ['Białystok', 'Suwałki', 'Łomża', 'Augustów', 'Sokółka']
      },
      {
        id: 'pomorskie',
        name: 'Pomorskie',
        code: 'PO',
        chessArbiterUrl: 'https://www.chessarbiter.com/turnieje.php',
        chessManagerUrl: 'https://www.chessmanager.com/pl-pl/tournaments?region=pomorskie',
        description: 'Turnieje szachowe w województwie pomorskim',
        popularCities: ['Gdańsk', 'Gdynia', 'Sopot', 'Słupsk', 'Tczew']
      },
      {
        id: 'slaskie',
        name: 'Śląskie',
        code: 'SL',
        chessArbiterUrl: 'https://www.chessarbiter.com/turnieje.php',
        chessManagerUrl: 'https://www.chessmanager.com/pl-pl/tournaments?region=slaskie',
        description: 'Turnieje szachowe w województwie śląskim',
        popularCities: ['Katowice', 'Częstochowa', 'Sosnowiec', 'Gliwice', 'Zabrze', 'Bytom', 'Bielsko-Biała', 'Ruda Śląska', 'Rybnik', 'Tychy']
      },
      {
        id: 'swietokrzyskie',
        name: 'Świętokrzyskie',
        code: 'SK',
        chessArbiterUrl: 'https://www.chessarbiter.com/turnieje.php',
        chessManagerUrl: 'https://www.chessmanager.com/pl-pl/tournaments?region=swietokrzyskie',
        description: 'Turnieje szachowe w województwie świętokrzyskim',
        popularCities: ['Kielce', 'Ostrowiec Świętokrzyski', 'Starachowice', 'Skarżysko-Kamienna', 'Końskie']
      },
      {
        id: 'warminsko-mazurskie',
        name: 'Warmińsko-Mazurskie',
        code: 'WM',
        chessArbiterUrl: 'https://www.chessarbiter.com/turnieje.php',
        chessManagerUrl: 'https://www.chessmanager.com/pl-pl/tournaments?region=warminsko-mazurskie',
        description: 'Turnieje szachowe w województwie warmińsko-mazurskim',
        popularCities: ['Olsztyn', 'Elbląg', 'Ełk', 'Ostróda', 'Iława']
      },
      {
        id: 'wielkopolskie',
        name: 'Wielkopolskie',
        code: 'WP',
        chessArbiterUrl: 'https://www.chessarbiter.com/turnieje.php',
        chessManagerUrl: 'https://www.chessmanager.com/pl-pl/tournaments?region=wielkopolskie',
        description: 'Turnieje szachowe w województwie wielkopolskim',
        popularCities: ['Poznań', 'Kalisz', 'Konin', 'Piła', 'Ostrów Wielkopolski']
      },
      {
        id: 'zachodniopomorskie',
        name: 'Zachodniopomorskie',
        code: 'ZP',
        chessArbiterUrl: 'https://www.chessarbiter.com/turnieje.php',
        chessManagerUrl: 'https://www.chessmanager.com/pl-pl/tournaments?region=zachodniopomorskie',
        description: 'Turnieje szachowe w województwie zachodniopomorskim',
        popularCities: ['Szczecin', 'Koszalin', 'Stargard', 'Kołobrzeg', 'Świnoujście']
      }
    ];
  }

  /**
   * Pobiera województwo po ID
   */
  getVoivodeshipById(id: string): VoivodeshipTournaments | undefined {
    return this.getAllVoivodeships().find(v => v.id === id);
  }

  /**
   * Pobiera województwo po kodzie (np. 'MA' dla mazowieckiego)
   */
  getVoivodeshipByCode(code: string): VoivodeshipTournaments | undefined {
    return this.getAllVoivodeships().find(v => v.code === code);
  }

  /**
   * Szuka województw po nazwie miasta
   */
  findVoivodeshipByCity(cityName: string): VoivodeshipTournaments | undefined {
    const city = cityName.toLowerCase();
    return this.getAllVoivodeships().find(v => 
      v.popularCities.some(c => c.toLowerCase().includes(city))
    );
  }

  /**
   * Pobiera popularne miasta w danym województwie
   */
  getCitiesInVoivodeship(voivodeshipId: string): string[] {
    const voivodeship = this.getVoivodeshipById(voivodeshipId);
    return voivodeship ? voivodeship.popularCities : [];
  }

  /**
   * Generuje link do turniejów w danym mieście na ChessManager
   * Przykład: https://www.chessmanager.com/pl-pl/tournaments/upcoming?name=&date_start=&date_end=&country=POL&city=Bydgoszcz&city_radius=100
   */
  getChessManagerLinkForCity(cityName: string, radius: number = 100): string {
    const encodedCity = encodeURIComponent(cityName);
    return `https://www.chessmanager.com/pl-pl/tournaments/upcoming?name=&date_start=&date_end=&country=POL&city=${encodedCity}&city_radius=${radius}`;
  }

  /**
   * Generuje link do turniejów w danym mieście na ChessArbiter
   */
  getChessArbiterLinkForCity(_cityName: string): string {
    // ChessArbiter nie filtruje po mieście, zwraca główną stronę turniejów
    return `https://www.chessarbiter.com/turnieje.php`;
  }

  /**
   * Generuje oba linki (ChessManager i ChessArbiter) dla danego miasta
   */
  getTournamentLinksForCity(cityName: string, radius: number = 100) {
    return {
      chessManager: this.getChessManagerLinkForCity(cityName, radius),
      chessArbiter: this.getChessArbiterLinkForCity(cityName),
      city: cityName,
      radius: radius
    };
  }

  /**
   * Pobiera statystyki województw (ile ma miast)
   */
  getVoivodeshipStats() {
    const voivodeships = this.getAllVoivodeships();
    
    return {
      totalVoivodeships: voivodeships.length,
      totalCities: voivodeships.reduce((sum, v) => sum + v.popularCities.length, 0),
      averageCitiesPerVoivodeship: Math.round(
        voivodeships.reduce((sum, v) => sum + v.popularCities.length, 0) / voivodeships.length
      ),
      largestVoivodeship: voivodeships.reduce((max, v) => 
        v.popularCities.length > max.popularCities.length ? v : max
      ),
      voivodeshipsByCitiesCount: voivodeships
        .sort((a, b) => b.popularCities.length - a.popularCities.length)
        .map(v => ({ name: v.name, citiesCount: v.popularCities.length }))
    };
  }
}

// Eksportuj singleton
export const voivodeshipTournamentsService = new VoivodeshipTournamentsService();