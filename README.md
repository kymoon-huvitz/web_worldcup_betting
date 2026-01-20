새 환경에서 본 저장소에서 pull 받은 후

-> frontend 폴더 내에서 npm install
-> backend 폴더 내에서 npm install

하여 개발 환경 구축 완료


아래 내용은 처음 환경 구축하는 법 

Frontend -> React + vite
Backend -> Express


Frontend Setting

1️⃣ Node.js 설치 확인

Vite는 Node.js가 필요해요.

node -v
npm -v


안 나오면 → https://nodejs.org

LTS 버전 추천

2️⃣ Vite로 React 프로젝트 생성

이미 만든 프로젝트 폴더 안에서 실행하세요.

npm create vite@latest .


끝에 . 이 중요합니다 → 현재 폴더에 생성

설문이 나오면 이렇게 선택하세요:

✔ Select a framework: › React
✔ Select a variant: › JavaScript   (또는 TypeScript)


💡 TypeScript 고민되면:

JS 처음이면 → JavaScript

나중에 TS 써도 됨

3️⃣ 의존성 설치
npm install

이 단계에서 node_modules가 생깁니다.

4️⃣ 개발 서버 실행
npm run dev


터미널에 보통 이렇게 나옵니다:

Local:   http://localhost:5173/


👉 브라우저에서 열면 Vite + React 화면이 보일 거예요 🎉



Backend Setting


🔥 제일 많이 쓰는 3가지 패턴
✅ 1️⃣ 프론트(Vite) + 백엔드(Node.js / Express) 👉 입문 & 실무 최다

개발할 때 가장 무난하고, React랑 궁합이 최고

[ React (Vite) ]  ←→  [ Node.js + Express ]

언제 쓰나?

API 서버 필요

로그인, DB, 파일 업로드

프론트/백 분리 개발

👉 추천 루트

✅ 2️⃣ 프론트(Vite) + 백엔드(Spring / Django / FastAPI)

회사에서 이미 백엔드가 있는 경우

[ React ]  ←→  [ Java / Python 서버 ]


API만 JSON으로 통신

React는 화면 전용

⚠️ 3️⃣ Vite + 서버리스 / BaaS (Firebase, Supabase)

빠르지만 개념이 한 번에 많이 나옴

초반엔 비추천

🎯 추천 루트: Express 백엔드 직접 붙이기

아래는 **“지금 당장 돌아가는 최소 세팅”**입니다.

1️⃣ 백엔드 폴더 생성

프론트랑 완전히 분리합니다.

project/
├─ frontend/   ← React + Vite
└─ backend/    ← Express


이미 React 프로젝트가 있다면:

mkdir backend
cd backend
npm init -y

2️⃣ Express 설치
npm install express cors


express → 서버

cors → 프론트에서 API 호출 허용

3️⃣ 서버 코드 작성 (backend/index.js)
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend' })
})

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000')
})


실행:

node index.js


👉 브라우저에서
http://localhost:3000/api/hello
확인

4️⃣ 프론트에서 API 호출 (React)

App.jsx에서 테스트:

import { useEffect, useState } from 'react'

function App() {
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('http://localhost:3000/api/hello')
      .then(res => res.json())
      .then(data => setMsg(data.message))
  }, [])

  return <h1>{msg}</h1>
}

export default App


👉 화면에
“Hello from backend”
뜨면 성공 🎉

5️⃣ 개발할 때 꼭 필요한 설정 (Proxy)

매번 localhost:3000 쓰기 귀찮죠?
Vite proxy 설정하면 깔끔해집니다.

vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})


이제 프론트에서는:

fetch('/api/hello')
