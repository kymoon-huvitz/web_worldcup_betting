import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setToken, setUserInfo } from '../auth'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Login failed')

      setToken(data.token)
      setUserInfo(data.user)
      nav('/')
    } catch (e) {
      setError(e.message || '로그인 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form-container">
      <h2>로그인</h2>
      <form onSubmit={onSubmit} className="auth-form">
        <input placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          placeholder="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button disabled={loading}>{loading ? '처리 중...' : '로그인'}</button>
      </form>
      {error && <p className="status-msg" style={{ color: '#e53e3e' }}>{error}</p>}
    </div>
  )
}
