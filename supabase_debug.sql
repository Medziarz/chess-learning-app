-- 🛠️ Supabase Debug Queries
-- Uruchom te komendy w Supabase SQL Editor

-- 1. Sprawdź czy tabela istnieje
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'chess_positions';

-- 2. Sprawdź strukturę tabeli
\d chess_positions;

-- 3. Sprawdź polityki RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'chess_positions';

-- 4. Sprawdź czy RLS jest włączony
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'chess_positions';

-- 5. Test prostego query
SELECT COUNT(*) FROM chess_positions;

-- 6. Jeśli tabela nie istnieje, stwórz ją:
CREATE TABLE IF NOT EXISTS chess_positions (
  id BIGSERIAL PRIMARY KEY,
  fen TEXT UNIQUE NOT NULL,
  evaluation REAL NOT NULL,
  best_move TEXT NOT NULL,
  depth INTEGER NOT NULL,
  nodes BIGINT NOT NULL,
  pv TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analysis_count INTEGER DEFAULT 1
);

-- 7. Włącz RLS
ALTER TABLE chess_positions ENABLE ROW LEVEL SECURITY;

-- 8. Dodaj polityki (usuń stare jeśli istnieją)
DROP POLICY IF EXISTS "Anyone can read positions" ON chess_positions;
DROP POLICY IF EXISTS "Anyone can insert positions" ON chess_positions;  
DROP POLICY IF EXISTS "Anyone can update better analysis" ON chess_positions;

CREATE POLICY "Anyone can read positions" ON chess_positions
FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can insert positions" ON chess_positions  
FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can update better analysis" ON chess_positions
FOR UPDATE TO public USING (true) WITH CHECK (true);

-- 9. Index dla wydajności
CREATE INDEX IF NOT EXISTS idx_chess_positions_fen ON chess_positions(fen);
CREATE INDEX IF NOT EXISTS idx_chess_positions_depth ON chess_positions(depth);