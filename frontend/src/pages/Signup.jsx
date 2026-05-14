import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setToken, setUserInfo } from '../auth'

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
    if (!name.trim()) {
      setError('이름을 입력해주세요.')
      return
    }
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
      setUserInfo(data.user)
      nav('/')
    } catch (e) {
      setError(e.message || '회원가입 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form-container">
      <h2>회원가입</h2>
      <form onSubmit={onSubmit} className="auth-form">
        <div style={{ textAlign: 'left' }}>
          <input 
            placeholder="이름 (실명 입력)" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0 4px' }}>
            ※ 반드시 본인의 <b>실명</b>을 입력해주세요.
          </p>
          <p style={{ fontSize: '0.8rem', color: '#ff4d4d', fontWeight: '700', margin: '2px 0 0 4px' }}>
            실명과 다를 경우 상금 지급이 불가능하며, 이 경우에는 모든 상금을 서버 관리자가 갖게 됩니다.
          </p>
        </div>
        <input placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          placeholder="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button disabled={loading}>{loading ? '처리 중...' : '가입하기'}</button>
      </form>
      {error && <p className="status-msg" style={{ color: '#e53e3e' }}>{error}</p>}
    </div>
  )
}
