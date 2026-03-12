const TOKEN_KEY = 'token'
const USER_KEY = 'user_info'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getUserInfo() {
  const data = localStorage.getItem(USER_KEY)
  try {
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function setUserInfo(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
