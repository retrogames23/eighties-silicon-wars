import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create supabase client only if environment variables are available
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseKey)
}

// Database types
export interface SaveGame {
  id: string
  user_id: string
  slot_number: number
  save_name: string
  game_state: any
  created_at: string
  updated_at: string
}