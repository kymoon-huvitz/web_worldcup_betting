# Web Worldcup Betting

프론트엔드(React + Vite)와 백엔드(Express + Prisma + SQLite)를 하나의 저장소(monorepo)로 관리하는 프로젝트입니다.

---

## 📁 프로젝트 구조
```
web_worldcup_betting/
├─ frontend/          # React (Vite)
├─ backend/           # Express + Prisma
├─ .gitignore
└─ README.md
```

---

## 🧩 기술 스택
- **Frontend**: React, Vite
- **Backend**: Node.js, Express
- **Auth**: JWT
- **DB**: SQLite
- **ORM**: Prisma

---

## ✅ Git에 포함 / 제외
### 포함
- `frontend/` 소스 코드
- `backend/` 소스 코드
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/**`

### 제외 (`.gitignore`)
- `node_modules/`
- `.env`
- `*.db` (SQLite DB 파일)
- `frontend/dist/`

---

## 🚀 새 PC에서 실행하기 (개발 모드)

### 1) 사전 설치
- Git
- Node.js **18 또는 20 LTS**

확인:
```bash
node -v
npm -v
git --version
```

---

### 2) 저장소 클론
```bash
git clone <REPO_URL>
cd web_worldcup_betting
```

---

### 3) 백엔드 세팅
```bash
cd backend
npm install
```

#### 3-1) 환경 변수 설정
`backend/.env` 파일 생성:
```env
PORT=3000
JWT_SECRET=dev-secret
DATABASE_URL="file:./dev.db"
```

#### 3-2) DB 생성 및 마이그레이션
```bash
npx prisma migrate dev
```

#### 3-3) 백엔드 실행
```bash
node index.js
```

API 테스트:
- http://localhost:3000/api/predictions

---

### 4) 프론트엔드 세팅
새 터미널에서:
```bash
cd frontend
npm install
npm run dev
```

접속:
- http://localhost:5173

---

## 📦 배포처럼 실행하기 (단일 포트 3000)

### 1) 프론트 빌드
```bash
cd frontend
npm run build
```

### 2) 백엔드 실행 (정적 파일 서빙)
```bash
cd ../backend
node index.js
```

접속:
- http://localhost:3000/

---

## 🌐 LAN에서 다른 기기 접속
- 서버 PC의 내부 IP 확인: `ipconfig`
- 접속: `http://<서버IP>:3000`
- Windows 방화벽: TCP 3000 포트 (Private) 허용

---

## 🧪 DB 확인 (선택)
```bash
cd backend
npx prisma studio
```

---

## 🐳 Docker 배포 (요약)
- Windows에서도 **Linux 컨테이너**로 배포 가능 (Docker Desktop + WSL2)
- 접속은 **호스트 IP:PORT**로 접근
- SQLite는 Docker Volume으로 데이터 유지

자세한 Docker 설정은 별도 문서 또는 Dockerfile / docker-compose.yml 참고.

---

## 🔧 트러블슈팅
- Prisma 오류 시 Node 버전 확인 (18/20 권장)
- `migrations/` 폴더가 Git에 있는지 확인
- `.env` 누락 여부 확인

---

## ✨ 실행 요약 (최소)
```bash
git clone <REPO_URL>
cd web_worldcup_betting

cd backend
npm install
# .env 생성
npx prisma migrate dev
node index.js

cd ../frontend
npm install
npm run dev
```

---

필요 시 Docker, HTTPS, 외부 공개 배포로 확장 가능합니다.

