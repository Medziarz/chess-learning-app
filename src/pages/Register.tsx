import { useState } from 'react'
import { useSupabase } from '../hooks/useSupabase'

export function Register() {
  const supabase = useSupabase()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Wszystkie pola są wymagane')
      return
    }

    if (name.length < 3) {
      setError('Nazwa użytkownika musi mieć co najmniej 3 znaki')
      return
    }

    if (password !== confirmPassword) {
      setError('Hasła nie są zgodne')
      return
    }

    if (password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków')
      return
    }

    setLoading(true)

    try {
      // Supabase Auth - rejestracja
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Dodaj użytkownika do tabeli users
        // Hasło jest już zahashowane przez Supabase Auth, nie przechowujemy go tutaj
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id, // UUID z auth.users
              email: email,
              name: name, // Unikalna nazwa użytkownika
              puzzles_rating: 1600,
              puzzles_solved: 0,
              puzzles_solved_correct: 0,
            }
          ])

        if (insertError) {
          setError('Błąd przy tworzeniu profilu: ' + insertError.message)
          setLoading(false)
          return
        }

        setSuccess(true)
        setName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      setError('Błąd rejestracji: ' + (err as Error).message)
    }

    setLoading(false)
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>♟️ Rejestracja</h1>
        <p className="register-subtitle">Stwórz konto i zacznij rozwiązywać puzzle szachowe</p>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            <p>✅ Rejestracja udana!</p>
            <p>Sprawdź swoją skrzynkę email, aby potwierdzić konto.</p>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">Nazwa użytkownika</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Twoja unikalna nazwa"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Hasło</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 znaków"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Potwierdź hasło</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Powtórz hasło"
              disabled={loading}
            />
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? '⏳ Rejestrowanie...' : '📝 Zarejestruj się'}
          </button>
        </form>

        <p className="register-footer">
          Masz już konto? <a href="/login">Zaloguj się tutaj</a>
        </p>
      </div>

      <style>{`
        .register-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .register-card {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          max-width: 400px;
          width: 100%;
        }

        .register-card h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
          color: #333;
          text-align: center;
        }

        .register-subtitle {
          text-align: center;
          color: #666;
          margin: 0 0 25px 0;
          font-size: 14px;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 14px;
          border-left: 4px solid #c62828;
        }

        .success-message {
          background: #e8f5e9;
          color: #2e7d32;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 14px;
          border-left: 4px solid #2e7d32;
        }

        .success-message p {
          margin: 6px 0;
        }

        .register-button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 8px;
        }

        .register-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .register-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .register-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: #666;
        }

        .register-footer a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s;
        }

        .register-footer a:hover {
          color: #764ba2;
        }
      `}</style>
    </div>
  )
}
