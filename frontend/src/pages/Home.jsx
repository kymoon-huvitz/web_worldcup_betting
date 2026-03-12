import { useEffect, useState } from 'react'
import { MATCHES } from '../constants'
import { getToken } from '../auth'

export default function Home() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Multi-match state
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const currentMatch = MATCHES[currentMatchIndex]

  // My prediction states
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [myLoading, setMyLoading] = useState(false)
  const [myMsg, setMyMsg] = useState('')
  const [myError, setMyError] = useState('')
  const token = getToken()

  // Countdown timer states
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const deadline = new Date(currentMatch.matchStartTime).getTime() - 10 * 60 * 1000

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = deadline - now

      if (distance < 0) {
        clearInterval(timer)
        setTimeLeft('예측이 마감되었습니다')
        setIsExpired(true)
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        setTimeLeft(`${days}일 ${hours}시간 ${minutes}분 ${seconds}초 남음`)
        setIsExpired(false)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [currentMatch])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/predictions?matchId=${currentMatch.id}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setRows(await res.json())
    } catch {
      setError('목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function loadMyPrediction() {
    if (!token) return
    setMyLoading(true)
    setMyError('')
    try {
      const res = await fetch(`/api/predictions/me?matchId=${currentMatch.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("서버 응답 오류");
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Load failed')

      if (data) {
        setHomeScore(data.homeScore)
        setAwayScore(data.awayScore)
      } else {
        setHomeScore(0)
        setAwayScore(0)
      }
    } catch (e) {
      setMyError(e.message || '불러오기 실패')
    } finally {
      setMyLoading(false)
    }
  }

  async function save() {
    setMyMsg('')
    setMyError('')
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId: currentMatch.id,
          homeScore: Number(homeScore),
          awayScore: Number(awayScore),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Save failed')

      setMyMsg('저장 완료!')
      load() 
      setTimeout(() => setMyMsg(''), 2000)
    } catch (e) {
      setMyError(e.message || '저장 실패')
    }
  }

  async function deleteMyPrediction() {
    if (!window.confirm('정말로 참여를 취소하고 예측 스코어를 삭제하시겠습니까?')) return
    
    setMyMsg('')
    setMyError('')
    try {
      const res = await fetch(`/api/predictions/me?matchId=${currentMatch.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("서버 응답이 올바르지 않습니다.");
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || '삭제 요청 처리에 실패했습니다.')

      setMyMsg('삭제되었습니다.')
      setHomeScore(0)
      setAwayScore(0)
      load() 
      setTimeout(() => setMyMsg(''), 2000)
    } catch (e) {
      setMyError(e.message || '삭제 중 오류가 발생했습니다.')
    }
  }

  useEffect(() => {
    load()
    if (token) {
      loadMyPrediction()
    }
  }, [token, currentMatchIndex])

  const nextMatch = () => setCurrentMatchIndex((prev) => (prev + 1) % MATCHES.length)
  const prevMatch = () => setCurrentMatchIndex((prev) => (prev - 1 + MATCHES.length) % MATCHES.length)

  return (
    <div className="home-content">
      {/* Slim Match Bar at the Top */}
      <div className="match-bar">
        {currentMatchIndex > 0 ? (
          <button className="match-nav-btn prev" onClick={prevMatch}>&lt;</button>
        ) : (
          <div style={{ width: 45 }}></div> /* Placeholder to maintain center alignment */
        )}
        
        <div className="match-bar-info">
          <div className="match-bar-tournament">{currentMatch.tournament}</div>
          <div className="match-bar-teams">
            <div className="match-bar-team">
              <img src={currentMatch.homeFlag} alt="" className="match-bar-flag" />
              <span>{currentMatch.home}</span>
            </div>
            <div className="match-bar-vs">VS</div>
            <div className="match-bar-team">
              <img src={currentMatch.awayFlag} alt="" className="match-bar-flag" />
              <span>{currentMatch.away}</span>
            </div>
          </div>
        </div>
        
        <div className="match-bar-details">
          <div>{currentMatch.date}</div>
          <div style={{ opacity: 0.8 }}>{currentMatch.stadium}</div>
        </div>

        {currentMatchIndex < MATCHES.length - 1 ? (
          <button className="match-nav-btn next" onClick={nextMatch}>&gt;</button>
        ) : (
          <div style={{ width: 45 }}></div> /* Placeholder to maintain center alignment */
        )}
      </div>

      <div className="home-grid">
        {/* Left Main: Title & Leaderboard */}
        <div className="right-main">
          <h1>Who will be the lucky winner?</h1>
          
          <div className="leaderboard-section">
            <div className="section-header">
              <div className="section-title">
                <h2>{currentMatch.label} 예측 목록</h2>
                <p>실시간 참가자 예측 현황</p>
              </div>
              <button onClick={load} className="refresh-btn">
                새로고침
              </button>
            </div>

            {loading && <p>데이터를 불러오는 중입니다...</p>}
            {error && <p style={{ color: '#e53e3e' }}>{error}</p>}
            {!loading && !error && rows.length === 0 && (
              <p style={{ padding: '2rem', opacity: 0.5 }}>아직 등록된 예측이 없습니다.</p>
            )}

            {!loading && !error && rows.length > 0 && (
              <div className="table-container" style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>참가자</th>
                      <th style={{ textAlign: 'center' }}>예측 스코어 ({currentMatch.home} : {currentMatch.away})</th>
                      <th style={{ textAlign: 'right' }}>수정일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, index) => (
                      <tr key={r.userId}>
                        <td>
                          <div className="user-name-cell">
                            <span>{r.name}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className={`score-display ${index < 3 ? 'highlight' : ''}`}>
                            {r.homeScore} : {r.awayScore}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                          {new Date(r.updatedAt).toLocaleDateString()} {new Date(r.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Score Input & Prize Info */}
        <div className="left-sidebar">
          <div className="score-card">
            <h3>내 예측 스코어</h3>
            {myLoading ? (
              <p>불러오는 중...</p>
            ) : (
              <>
                <div className="score-input-group">
                  <div className="score-inputs-row">
                    <div className="score-input-wrapper">
                      <div className="score-input-label">
                        <img src={currentMatch.homeFlag} alt="" className="score-input-flag" />
                        <span>{currentMatch.home}</span>
                      </div>
                      <input
                        type="number"
                        className="score-input"
                        value={homeScore}
                        min="0"
                        onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                        disabled={isExpired}
                      />
                      </div>

                      <span className="score-separator">:</span>

                      <div className="score-input-wrapper">
                      <div className="score-input-label">
                        <img src={currentMatch.awayFlag} alt="" className="score-input-flag" />
                        <span>{currentMatch.away}</span>
                      </div>
                      <input
                        type="number"
                        className="score-input"
                        value={awayScore}
                        min="0"
                        onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                        disabled={isExpired}
                      />
                      </div>

                  </div>
                  
                  {token ? (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <button 
                        onClick={save} 
                        disabled={isExpired}
                      >
                        {isExpired ? '등록 마감' : '스코어 등록'}
                      </button>
                      
                      {token && (
                        <button 
                          onClick={deleteMyPrediction}
                          disabled={isExpired}
                          className="delete-btn"
                          style={{ 
                            backgroundColor: 'transparent', 
                            border: isExpired ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 77, 77, 0.4)', 
                            color: isExpired ? 'rgba(255, 255, 255, 0.3)' : '#ff4d4d',
                            fontSize: '0.85rem',
                            padding: '0.6rem',
                            boxShadow: 'none',
                            marginTop: '0',
                            cursor: isExpired ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isExpired ? '취소 불가' : '내 예측 삭제 (참여 취소)'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => window.location.href = '/login'} 
                      disabled={isExpired}
                      style={{ backgroundColor: isExpired ? '#6c757d' : '#ffd700', color: '#000', boxShadow: isExpired ? 'none' : '0 4px 0 #b8860b' }}
                    >
                      {isExpired ? '마감됨' : '로그인 후 등록'}
                    </button>
                  )}
                </div>

                <div className={`countdown-timer ${isExpired ? 'expired' : ''}`}>
                  <div className="timer-label">{isExpired ? '접수 마감' : '예측 마감까지'}</div>
                  <div className="timer-value">{timeLeft}</div>
                </div>
                
                <p style={{ marginTop: '0.8rem', marginBottom: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>
                  ※ 마감 이후에는 예측 스코어 등록 및 취소가 불가합니다.
                </p>

                {!isExpired && !token && <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>로그인하면 당신의 예측이 목록에 등록됩니다!</p>}
                {isExpired && <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.9rem', color: '#ff4d4d', fontWeight: 700 }}>경기 시작 10분 전으로 예측이 마감되었습니다.</p>}

                {myMsg && <p className="status-msg" style={{ color: '#38a169' }}>{myMsg}</p>}
                {myError && <p className="status-msg" style={{ color: '#e53e3e' }}>{myError}</p>}
              </>
            )}
          </div>

          <div className="prize-pool-card">
            <div className="prize-pool-label">참가비: 10,000원</div>
            <div className="prize-pool-amount">
              총 상금: <span>{(rows.length * 10000).toLocaleString()}</span> 원
            </div>
            <div className="prize-pool-disclaimer">※ 스코어를 맞힌 당첨자가 여러 명일 경우 상금은 1/n로 지급됩니다.</div>
            <div className="prize-pool-stats">현재 {rows.length}명 참여 중</div>
          </div>
        </div>
      </div>
    </div>
  )
}
