// 🧪 Prosty test Supabase - wklej w konsolę przeglądarki
console.log('🔌 Testing Supabase...')

// Import supabase
import('./src/config/supabase.js').then(({ supabase }) => {
  console.log('📦 Supabase imported:', !!supabase)
  
  // Test 1: Sprawdź połączenie
  async function testConnection() {
    try {
      console.log('🔍 Testing connection...')
      
      const { data, error } = await supabase
        .from('chess_positions')
        .select('count', { count: 'exact', head: true })
      
      if (error) {
        console.error('❌ Connection error:', error)
        console.error('Code:', error.code)
        console.error('Message:', error.message)
        console.error('Details:', error.details)
        return false
      }
      
      console.log('✅ Connection OK! Total records:', data)
      return true
    } catch (e) {
      console.error('💥 Exception:', e)
      return false
    }
  }
  
  // Test 2: Próba INSERT
  async function testInsert() {
    const testPosition = {
      fen: `test_${Date.now()}`,
      evaluation: 0.25,
      best_move: 'e2e4',
      depth: 12,
      nodes: 5000,
      pv: ['e2e4', 'e7e5']
    }
    
    try {
      console.log('📝 Testing insert...', testPosition)
      
      const { data, error } = await supabase
        .from('chess_positions')
        .insert(testPosition)
        .select()
      
      if (error) {
        console.error('❌ Insert error:', error)
        return false
      }
      
      console.log('✅ Insert successful:', data)
      return true
    } catch (e) {
      console.error('💥 Insert exception:', e)
      return false
    }
  }
  
  // Uruchom testy
  testConnection().then(connected => {
    if (connected) {
      console.log('🎯 Connection OK, testing insert...')
      testInsert()
    } else {
      console.log('💔 Connection failed - check database setup')
    }
  })
  
}).catch(err => {
  console.error('❌ Failed to import supabase:', err)
})