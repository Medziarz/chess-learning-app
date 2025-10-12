// 🧪 Test Supabase Connection
// Wklej to do konsoli przeglądarki żeby przetestować

import { supabase } from './src/config/supabase.js'

// Test 1: Podstawowe połączenie
console.log('🔌 Testing Supabase connection...')
console.log('URL:', supabase.supabaseUrl)
console.log('Key length:', supabase.supabaseKey?.length)

// Test 2: Sprawdź czy tabela istnieje
async function testConnection() {
  try {
    console.log('📊 Testing table access...')
    
    const { data, error, count } = await supabase
      .from('chess_positions')
      .select('*', { count: 'exact' })
      .limit(0)
    
    if (error) {
      console.error('❌ Table access failed:', error)
      return false
    }
    
    console.log('✅ Table exists! Record count:', count)
    return true
  } catch (e) {
    console.error('💥 Connection failed:', e)
    return false
  }
}

// Test 3: Próba prostego INSERT
async function testInsert() {
  try {
    console.log('📝 Testing insert...')
    
    const testData = {
      fen: 'test_position_' + Date.now(),
      evaluation: 0.5,
      best_move: 'e2e4',
      depth: 10,
      nodes: 1000,
      pv: ['e2e4']
    }
    
    const { data, error } = await supabase
      .from('chess_positions')
      .insert(testData)
      .select()
    
    if (error) {
      console.error('❌ Insert failed:', error)
      return false
    }
    
    console.log('✅ Insert successful:', data)
    return true
  } catch (e) {
    console.error('💥 Insert error:', e)
    return false
  }
}

// Uruchom testy
testConnection().then(success => {
  if (success) {
    testInsert()
  }
})