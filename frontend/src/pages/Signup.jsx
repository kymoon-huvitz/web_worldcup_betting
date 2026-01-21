import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setToken } from '../auth'

export default function Signup() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Signup failed')

      setToken(data.token)
      nav('/myprediction')
    } catch (e) {
      setError(e.message || '회원가입 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 360 }}>
      <h2>회원가입</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
        <input placeholder="이름(선택)" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          placeholder="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button disabled={loading}>{loading ? '처리 중...' : '가입하기'}</button>
      </form>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </div>
  )
}
