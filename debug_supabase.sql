-- 🔍 Debug Supabase Connection
-- Wykonaj te zapytania w SQL Editor w panelu Supabase

-- 1. Sprawdź czy tabela istnieje
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chess_positions'
ORDER BY ordinal_position;

-- 2. Sprawdź RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'chess_positions';

-- 3. Sprawdź obecne dane
SELECT COUNT(*) as total_positions, 
       MIN(created_at) as first_entry, 
       MAX(created_at) as last_entry
FROM chess_positions;

-- 4. Test prostego INSERT
INSERT INTO chess_positions (fen, evaluation, best_move, depth, nodes, pv) 
VALUES ('test_fen_123', 0.5, 'e2e4', 10, 1000, '["e2e4"]')
ON CONFLICT (fen) DO UPDATE SET 
evaluation = EXCLUDED.evaluation,
best_move = EXCLUDED.best_move,
depth = EXCLUDED.depth;

-- 5. Sprawdź uprawnienia dla anon użytkownika
SELECT * FROM chess_positions WHERE fen = 'test_fen_123';

-- 6. Usuń test
DELETE FROM chess_positions WHERE fen = 'test_fen_123';