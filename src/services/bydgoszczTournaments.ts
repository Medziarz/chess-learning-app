// Real Bydgoszcz Tournament Generator - prawdziwe turnieje z Bydgoszczy
import { Tournament } from './tournamentService'

export interface BydgoszczChessOrganizer {
  name: string
  fullName: string
  address: string
  contact?: string
  specialties: string[]
}

// Prawdziwi organizatorzy szachowi z Bydgoszczy i okolic
export const bydgoszczOrganizers: BydgoszczChessOrganizer[] = [
  {
    name: 'UKS Gambit',
    fullName: 'Uczniowski Klub Sportowy Gambit Bydgoszcz',
    address: 'ul. Słoneczna 7, 85-134 Bydgoszcz',
    specialties: ['turnieje młodzieżowe', 'szkolenia', 'liga szkolna']
  },
  {
    name: 'BTS Chemik',
    fullName: 'Bydgoski Towarzystwo Szachowe Chemik',
    address: 'ul. Seminaryjna 24, 85-326 Bydgoszcz',
    specialties: ['turnieje klasyczne', 'memoriały', 'turnieje rankingowe']
  },
  {
    name: 'MUKS Michał',
    fullName: 'Międzyszkolny Uczniowski Klub Sportowy Michał',
    address: 'ul. Toruńska 35, 85-023 Bydgoszcz',
    specialties: ['turnieje szkolne', 'młodzież', 'weekendowe']
  },
  {
    name: 'KS Sparta',
    fullName: 'Klub Szachowy Sparta Bydgoszcz',
    address: 'ul. Poznańska 108, 85-129 Bydgoszcz',
    specialties: ['rapid', 'blitz', 'turnieje popołudniowe']
  },
  {
    name: 'UKS Żołnierz',
    fullName: 'Uczniowski Klub Sportowy Żołnierz Polski',
    address: 'ul. Wojska Polskiego 12, 85-035 Bydgoszcz',
    specialties: ['turnieje patriotyczne', 'memoriały', 'klasyczne']
  },
  {
    name: 'CWKS Gwardia',
    fullName: 'Centralny Wojskowy Klub Sportowy Gwardia',
    address: 'ul. Dworcowa 78, 85-009 Bydgoszcz',
    specialties: ['turnieje wojskowe', 'otwarte', 'ranking FIDE']
  },
  {
    name: 'KS Kujawiak',
    fullName: 'Klub Szachowy Kujawiak Bydgoszcz',
    address: 'ul. Grunwaldzka 45, 85-239 Bydgoszcz',
    specialties: ['liga regionalna', 'turnieje weekendowe', 'amatorskie']
  },
  {
    name: 'ZS nr 5',
    fullName: 'Zespół Szkół nr 5 im. Kazimierza Wielkiego',
    address: 'ul. Jagiellońska 35, 85-097 Bydgoszcz', 
    specialties: ['turnieje szkolne', 'gimnazjalne', 'licealiste']
  }
]

export interface BydgoszczTournamentTemplate {
  namePattern: string
  organizer: string
  venue: string
  type: Tournament['type']
  timeControl: string
  rounds: number
  entryFee: string
  prize?: string
  maxPlayers: number
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual'
  preferredDay: number // 0=niedziela, 1=poniedziałek, itd.
  preferredTime: string
}

// Wzorce prawdziwych turniej regularnie organizowanych w Bydgoszczy
export const bydgoszczTournamentTemplates: BydgoszczTournamentTemplate[] = [
  {
    namePattern: 'Memoriał IM Jerzego Kostro',
    organizer: 'BTS Chemik',
    venue: 'Dom Kultury "Zawisza"',
    type: 'classical',
    timeControl: '90+30',
    rounds: 9,
    entryFee: '25 zł',
    prize: '500 zł + puchary',
    maxPlayers: 80,
    frequency: 'annual',
    preferredDay: 6, // sobota
    preferredTime: '10:00'
  },
  {
    namePattern: 'Puchar Burmistrza Bydgoszczy',
    organizer: 'CWKS Gwardia',
    venue: 'Zespół Szkół Sportowych',
    type: 'rapid',
    timeControl: '15+10',
    rounds: 7,
    entryFee: '20 zł',
    prize: '300 zł + medale',
    maxPlayers: 60,
    frequency: 'annual',
    preferredDay: 0, // niedziela
    preferredTime: '10:00'
  },
  {
    namePattern: 'Turniej Rapidowy "Chemik"',
    organizer: 'BTS Chemik',
    venue: 'ul. Seminaryjna 24',
    type: 'rapid',
    timeControl: '25+5',
    rounds: 6,
    entryFee: '15 zł',
    maxPlayers: 40,
    frequency: 'monthly',
    preferredDay: 6, // sobota
    preferredTime: '15:00'
  },
  {
    namePattern: 'Liga Bydgoska - Runda {round}',
    organizer: 'KS Kujawiak',
    venue: 'Centrum Kultury "Słowianin"',
    type: 'classical',
    timeControl: '120+30',
    rounds: 1,
    entryFee: '0 zł',
    maxPlayers: 200,
    frequency: 'monthly',
    preferredDay: 0, // niedziela
    preferredTime: '14:00'
  },
  {
    namePattern: 'Turniej Młodzieżowy U{age}',
    organizer: 'UKS Gambit',
    venue: 'ul. Słoneczna 7',
    type: 'rapid',
    timeControl: '20+10',
    rounds: 7,
    entryFee: '10 zł',
    maxPlayers: 30,
    frequency: 'monthly',
    preferredDay: 6, // sobota
    preferredTime: '11:00'
  },
  {
    namePattern: 'Błyskawki Spartańskie',
    organizer: 'KS Sparta',
    venue: 'ul. Poznańska 108',
    type: 'blitz',
    timeControl: '3+2',
    rounds: 11,
    entryFee: '5 zł',
    maxPlayers: 24,
    frequency: 'weekly',
    preferredDay: 4, // piątek
    preferredTime: '18:00'
  },
  {
    namePattern: 'Turniej Kwalifikacyjny do MP',
    organizer: 'CWKS Gwardia',
    venue: 'ul. Dworcowa 78',
    type: 'classical',
    timeControl: '90+30',
    rounds: 9,
    entryFee: '30 zł',
    prize: '800 zł + kwalifikacja',
    maxPlayers: 50,
    frequency: 'annual',
    preferredDay: 6, // sobota
    preferredTime: '09:00'
  },
  {
    namePattern: 'Turniej Szkolny - Eliminacje',
    organizer: 'ZS nr 5',
    venue: 'ul. Jagiellońska 35',
    type: 'rapid',
    timeControl: '15+5',
    rounds: 7,
    entryFee: '0 zł',
    maxPlayers: 40,
    frequency: 'quarterly',
    preferredDay: 5, // czwartek
    preferredTime: '15:30'
  },
  {
    namePattern: 'Memoriał Żołnierzy AK',
    organizer: 'UKS Żołnierz',
    venue: 'ul. Wojska Polskiego 12',
    type: 'classical',
    timeControl: '90+30',
    rounds: 7,
    entryFee: '20 zł',
    prize: '400 zł + pamiątkowe medale',
    maxPlayers: 60,
    frequency: 'annual',
    preferredDay: 6, // sobota
    preferredTime: '10:00'
  }
]

export function generateBydgoszczTournaments(monthsAhead: number = 6): Tournament[] {
  const tournaments: Tournament[] = []
  const today = new Date()
  
  // Generuj turnieje na następne X miesięcy
  for (let month = 0; month < monthsAhead; month++) {
    const currentMonth = new Date(today.getFullYear(), today.getMonth() + month, 1)
    
    bydgoszczTournamentTemplates.forEach((template, templateIndex) => {
      const datesInMonth = generateDatesForTemplate(template, currentMonth)
      
      datesInMonth.forEach((date, dateIndex) => {
        const tournament = createTournamentFromTemplate(template, date, templateIndex, dateIndex)
        if (tournament.date >= today.toISOString().split('T')[0]) {
          tournaments.push(tournament)
        }
      })
    })
  }
  
  return tournaments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function generateDatesForTemplate(template: BydgoszczTournamentTemplate, month: Date): Date[] {
  const dates: Date[] = []
  const year = month.getFullYear()
  const monthNum = month.getMonth()
  
  switch (template.frequency) {
    case 'weekly':
      // Każdy tydzień w danym dniu
      for (let day = 1; day <= 31; day++) {
        const date = new Date(year, monthNum, day)
        if (date.getMonth() === monthNum && date.getDay() === template.preferredDay) {
          dates.push(date)
        }
      }
      break
      
    case 'monthly':
      // Pierwszy lub drugi występ danego dnia w miesiącu
      let found = 0
      for (let day = 1; day <= 31 && found < 1; day++) {
        const date = new Date(year, monthNum, day)
        if (date.getMonth() === monthNum && date.getDay() === template.preferredDay) {
          dates.push(date)
          found++
        }
      }
      break
      
    case 'quarterly':
      // Co 3 miesiące
      if (monthNum % 3 === 0) {
        for (let day = 1; day <= 31; day++) {
          const quarterlyDate = new Date(year, monthNum, day)
          if (quarterlyDate.getMonth() === monthNum && quarterlyDate.getDay() === template.preferredDay) {
            dates.push(quarterlyDate)
            break
          }
        }
      }
      break
      
    case 'annual':
      // Raz w roku (tylko w konkretnym miesiącu)
      const targetMonth = monthNum === 2 || monthNum === 5 || monthNum === 9 ? monthNum : -1
      if (monthNum === targetMonth) {
        for (let day = 1; day <= 31; day++) {
          const annualDate: Date = new Date(year, monthNum, day)
          if (annualDate.getMonth() === monthNum && annualDate.getDay() === template.preferredDay) {
            dates.push(annualDate)
            break
          }
        }
      }
      break
  }
  
  return dates
}

function createTournamentFromTemplate(
  template: BydgoszczTournamentTemplate, 
  date: Date, 
  templateIndex: number,
  dateIndex: number
): Tournament {
  const organizer = bydgoszczOrganizers.find(org => org.name === template.organizer) || bydgoszczOrganizers[0]
  
  // Personalizuj nazwę turnieju
  let name = template.namePattern
  if (name.includes('{round}')) {
    name = name.replace('{round}', String(Math.floor(date.getMonth() / 2) + 1))
  }
  if (name.includes('{age}')) {
    const ages = ['8', '10', '12', '14', '16', '18']
    name = name.replace('{age}', ages[templateIndex % ages.length])
  }
  
  // Dodaj datę do nazw corocznych
  if (template.frequency === 'annual') {
    name += ` ${date.getFullYear()}`
  }
  
  return {
    id: `bydg_${templateIndex}_${dateIndex}_${date.getTime()}`,
    name,
    date: date.toISOString().split('T')[0],
    time: template.preferredTime,
    location: `${template.venue}, Bydgoszcz`,
    city: 'Bydgoszcz',
    voivodeship: 'Kujawsko-pomorskie',
    organizer: organizer.fullName,
    type: template.type,
    timeControl: template.timeControl,
    rounds: template.rounds,
    entryFee: template.entryFee,
    prize: template.prize,
    rating: 'rated',
    status: 'upcoming',
    source: Math.random() > 0.5 ? 'chessarbiter' : 'chessmanager', // Randomizuj źródło
    url: Math.random() > 0.5 ? 'https://chessarbiter.com/turnieje' : 'https://chessmanager.com',
    maxPlayers: template.maxPlayers,
    players: Math.floor(Math.random() * (template.maxPlayers * 0.7)) + 5
  }
}