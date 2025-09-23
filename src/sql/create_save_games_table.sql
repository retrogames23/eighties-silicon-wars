-- Create save_games table
CREATE TABLE IF NOT EXISTS save_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_number INTEGER NOT NULL CHECK (slot_number >= 1 AND slot_number <= 5),
  save_name TEXT NOT NULL,
  game_state JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure each user can only have one save per slot
  UNIQUE(user_id, slot_number)
);

-- Enable RLS
ALTER TABLE save_games ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saves" ON save_games
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saves" ON save_games
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saves" ON save_games
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saves" ON save_games
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_save_games_user_id ON save_games(user_id);
CREATE INDEX IF NOT EXISTS idx_save_games_slot ON save_games(user_id, slot_number);