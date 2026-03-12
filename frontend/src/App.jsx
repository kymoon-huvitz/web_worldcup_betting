import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { getToken, clearToken } from './auth'
import './App.css'

function NavBar() {
  const navigate = useNavigate()
  const token = getToken()

  return (
    <div className="navbar">
      <div className="navbar-right">
        {!token ? (
          <>
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
          </>
        ) : (
          <button
            onClick={() => {
              clearToken()
              window.location.href = '/'
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
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
