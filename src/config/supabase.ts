// Supabase Configuration
import { createClient } from '@supabase/supabase-js'

// TODO: Replace with your actual Supabase credentials
const supabaseUrl = 'https://xiosbqllozmykxkdwalv.supabase.co' // e.g., 'https://abcdefghijklmnop.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpb3NicWxsb3pteWt4a2R3YWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTM5MzgsImV4cCI6MjA3NTYyOTkzOH0.lwm-wyJ6Dd00JTKAmi3w34LI5-wcW5aJfXKnCY_7Vwc' // Your public anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for chess positions
export interface DatabasePosition {
  id?: number
  fen: string
  evaluation: number
  best_move: string
  depth: number
  nodes: number
  pv?: string[]
  created_at?: string
  updated_at?: string
  analysis_count?: number
}