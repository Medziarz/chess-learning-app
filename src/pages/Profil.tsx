import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabase } from '../hooks/useSupabase'

export function Profil() {
  const supabase = useSupabase()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [stats, setStats] = useState({
    puzzles_rating: 1600,
    puzzles_solved: 0,
    puzzles_solved_correct: 0,
    personality: ''
  })

  // Załaduj dane użytkownika
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setError('Musisz być zalogowany')
          setLoading(false)
          return
        }

        // Pobierz dane z tabeli users
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('email, first_name, last_name, avatar, puzzles_rating, puzzles_solved, puzzles_solved_correct, personality')
          .eq('id', user.id)
          .single()

        if (fetchError) {
          setError('Błąd przy pobieraniu danych: ' + fetchError.message)
          setLoading(false)
          return
        }

        setEmail(data?.email || user.email || '')
        setFirstName(data?.first_name || '')
        setLastName(data?.last_name || '')
        setAvatar(data?.avatar || null)
        setStats({
          puzzles_rating: data?.puzzles_rating || 1600,
          puzzles_solved: data?.puzzles_solved || 0,
          puzzles_solved_correct: data?.puzzles_solved_correct || 0,
          personality: data?.personality || ''
        })
      } catch (err) {
        setError('Błąd: ' + (err as Error).message)
      }

      setLoading(false)
    }

    loadUserData()
  }, [])

  // Zapisz zmiany
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Musisz być zalogowany')
        setSaving(false)
        return
      }

      // Zaktualizuj dane w tabeli users
      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: firstName,
          last_name: lastName,
          avatar: avatar,
        })
        .eq('id', user.id)

      if (updateError) {
        setError('Błąd przy zapisywaniu: ' + updateError.message)
        setSaving(false)
        return
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Błąd: ' + (err as Error).message)
    }

    setSaving(false)
  }

  // Wyloguj użytkownika
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setError('Błąd przy wylogowaniu: ' + error.message)
        return
      }
      navigate('/login')
    } catch (err) {
      setError('Błąd: ' + (err as Error).message)
    }
  }

  // Obsługa wgrania avatara
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Konwertuj do base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setAvatar(base64)
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="profil-container">
        <div className="loading">⏳ Ładowanie...</div>
      </div>
    )
  }

  return (
    <>
      <div className="profil-container">
        <h1 className="profil-title">👤 Mój Profil</h1>
        <div className="profil-card">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">✅ Zmiany zapisane!</div>}

          <form onSubmit={handleSave} className="profil-form">
            <div className="form-section">
              <div className="avatar-section">
                <div className="avatar-preview">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="avatar-image" />
                  ) : (
                    <div className="avatar-placeholder">📷</div>
                  )}
                </div>
                <label htmlFor="avatar-upload" className="avatar-upload-label">
                  📸 Zmień avatar
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="avatar-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled={true}
                  className="input-disabled"
                />
                <small>Email nie może być zmieniony</small>
              </div>

              <div className="form-group">
                <label htmlFor="firstName">Imię</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Wpisz swoje imię"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Nazwisko</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Wpisz swoje nazwisko"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="button-group">
              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >
                {saving ? '⏳ Zapisywanie...' : '💾 Zapisz zmiany'}
              </button>
            </div>

            <div className="button-group logout-group">
              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                🚪 Wyloguj się
              </button>
            </div>
          </form>

          <div className="profile-stats">
            <div className="stat-box">
              <div className="stat-label">Puzzle Rating</div>
              <div className="stat-value">{stats.puzzles_rating}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Zadań rozwiązanych</div>
              <div className="stat-value">{stats.puzzles_solved_correct}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Skuteczność</div>
              <div className="stat-value">
                {stats.puzzles_solved > 0 
                  ? Math.round((stats.puzzles_solved_correct / stats.puzzles_solved) * 100) 
                  : 0}%
              </div>
            </div>
            {stats.personality && (
              <div className="stat-box">
                <div className="stat-label">Osobowość szachowa</div>
                <div className="stat-value">{stats.personality}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .profil-container {
          width: 100%;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .profil-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 30px;
          display: flex;
          gap: 30px;
          margin: 0 20px 40px 20px;
          max-width: 1200px;
        }

        .profil-title {
          color: #333;
          text-align: center;
          font-size: 28px;
          margin: 40px 20px 20px 20px;
        }

        .profile-stats {
          flex: 0 0 280px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          padding-top: 50px;
        }

        .stat-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .profil-form {
          display: flex;
          flex-direction: column;
          gap: 30px;
          flex: 1;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
        }

        .avatar-preview {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #667eea;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #e8eaf6;
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          font-size: 48px;
        }

        .avatar-upload-label {
          padding: 10px 20px;
          background-color: #667eea;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: background-color 0.3s;
        }

        .avatar-upload-label:hover {
          background-color: #764ba2;
        }

        .avatar-input {
          display: none;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .form-group input {
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
          color: #999;
        }

        .input-disabled {
          background-color: #f5f5f5 !important;
          color: #666 !important;
        }

        .form-group small {
          color: #999;
          font-size: 12px;
        }

        .button-group {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 10px;
        }

        .edit-button,
        .save-button,
        .cancel-button {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          flex: 1;
        }

        .save-button {
          background-color: #4caf50;
          color: white;
        }

        .save-button:hover:not(:disabled) {
          background-color: #45a049;
          transform: translateY(-2px);
        }

        .save-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .logout-group {
          margin-top: 30px;
          border-top: 2px solid #e0e0e0;
          padding-top: 20px;
        }

        .logout-button {
          padding: 12px 24px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          width: 100%;
        }

        .logout-button:hover {
          background-color: #da190b;
          transform: translateY(-2px);
        }

        .stat-label {
          font-size: 11px;
          font-weight: 600;
          opacity: 0.9;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .profil-card {
            flex-direction: column;
          }

          .profile-stats {
            flex: none;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            width: 100%;
            padding-top: 0;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
          }
        }

        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 14px;
          text-align: center;
        }

        .success-message {
          background-color: #e8f5e9;
          color: #2e7d32;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 14px;
          text-align: center;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 16px;
          color: #666;
        }
      `}</style>
    </>
  )
}