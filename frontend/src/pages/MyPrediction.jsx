import { useEffect, useState } from 'react'
import { getToken } from '../auth'
import { useNavigate } from 'react-router-dom'
import { MATCH } from '../constants'

export default function MyPrediction() {
  const nav = useNavigate()
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function loadMyPrediction() {
    setLoading(true)
    setError('')
    try {
      const token = getToken()
      const res = await fetch('/api/predictions/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Load failed')

      if (data) {
        setHomeScore(data.homeScore)
        setAwayScore(data.awayScore)
      }
    } catch (e) {
      setError(e.message || '불러오기 실패')
    } finally {
      setLoading(false)
    }
  }

  async function save() {
    setMsg('')
    setError('')
    try {
      const token = getToken()
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          homeScore: Number(homeScore),
          awayScore: Number(awayScore),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Save failed')

      setMsg('저장 완료! 메인으로 이동합니다.')
      setTimeout(() => nav('/'), 600)
    } catch (e) {
      setError(e.message || '저장 실패')
    }
  }

  useEffect(() => {
    loadMyPrediction()
  }, [])

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>내 스코어 등록</h2>
      <p>
        대상 경기: <b>{MATCH.label}</b>
      </p>

      {loading ? (
        <p>불러오는 중...</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="number"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              style={{ width: 80 }}
            />
            <span>:</span>
            <input
              type="number"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              style={{ width: 80 }}
            />
            <button onClick={save}>저장</button>
          </div>

          <button onClick={loadMyPrediction} style={{ marginTop: 10 }}>
            내 예측 다시 불러오기
          </button>
        </>
      )}

      {msg && <p>{msg}</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </div>
  )
}
