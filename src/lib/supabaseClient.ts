import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key not configured in environment variables')
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

export async function fetchPuzzles(limit = 100) {
  try {
    const { data, error } = await supabase
      .from('puzzles')
      .select('PuzzleId, FEN, Moves, Rating, RatingDeviation, Popularity, NbPlays, Themes, GameUrl, OpeningTags')
      .limit(limit)

    if (error) {
      console.error('Error fetching puzzles:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Puzzle fetch exception:', err)
    return []
  }
}

export type Puzzle = {
  PuzzleId: string
  FEN: string
  Moves: string
  Rating?: number
  RatingDeviation?: number
  Popularity?: number
  NbPlays?: number
  Themes?: string | string[]
  GameUrl?: string
  OpeningTags?: string | string[]
}
