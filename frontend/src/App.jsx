import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MyPrediction from './pages/MyPrediction'
import { getToken, clearToken } from './auth'

function NavBar() {
  const navigate = useNavigate()
  const token = getToken()

  return (
    <div style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #ddd' }}>
      <Link to="/">메인</Link>
      <Link to="/myprediction">내 스코어 등록</Link>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
        {!token ? (
          <>
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
          </>
        ) : (
          <button
            onClick={() => {
              clearToken()
              navigate('/')
            }}
          >
            로그아웃
          </button>
        )}
      </div>
    </div>
  )
}

function RequireAuth({ children }) {
  const token = getToken()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/myprediction"
            element={
              <RequireAuth>
                <MyPrediction />
              </RequireAuth>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
