# 🎯 Supabase Configuration Guide

## 📝 Co musisz zrobić:

### 1. **Znajdź swoje dane Supabase:**
- Idź do: https://app.supabase.com/project/twoj-projekt-id/settings/api
- Skopiuj **Project URL** (np. `https://abcdefgh.supabase.co`)
- Skopiuj **anon/public** key (długi string)

### 2. **Edytuj plik konfiguracji:**
Otwórz: `src/config/supabase.ts`

Zastąp te linie:
```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL' 
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
```

Swoimi danymi:
```typescript
const supabaseUrl = 'https://twojprojekt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Twój klucz
```

### 3. **Sprawdź połączenie:**
Po konfiguracji, w konsoli przeglądarki powinieneś zobaczyć:
```
☁️ Supabase cache hit (depth 12)
☁️ Saved to Supabase (depth 14)
```

## 🚀 **Co się stanie:**

1. **Pierwsza analiza** → Zapisze się w Supabase
2. **Kolejni użytkownicy** → Błyskawiczny dostęp do tej samej pozycji
3. **Progresywna analiza** → Głębsze analizy zastępują płytsze
4. **Globalny cache** → Wszyscy użytkownicy korzystają z tych samych analiz

## 🔧 **Debug:**

Jeśli nie działa, sprawdź:
- Czy tabela `chess_positions` istnieje
- Czy RLS policies są włączone
- Czy w konsoli nie ma błędów CORS
- Czy URL i klucz są prawidłowe

Daj znać jak skonfigurujesz! 🎉