import { useEffect, useState } from 'react'
import { MATCH } from '../constants'

export default function Home() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/predictions')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setRows(await res.json())
    } catch {
      setError('목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <h1>월드컵 스코어 맞추기</h1>
      <p style={{ marginTop: 4, color: '#555' }}>
        대상 경기: <b>{MATCH.label}</b>
      </p>
      <button onClick={load} style={{ marginBottom: 12 }}>
        새로고침
      </button>

      {loading && <p>불러오는 중...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!loading && !error && rows.length === 0 && <p>아직 등록된 스코어가 없습니다.</p>}

      {!loading && !error && rows.length > 0 && (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>유저</th>
              <th>스코어</th>
              <th>업데이트</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.userId}>
                <td>{r.name}</td>
                <td>
                  {r.homeScore} : {r.awayScore}
                </td>
                <td>{new Date(r.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
