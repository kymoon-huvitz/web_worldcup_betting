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

## 🐳 Docker 배포 (리눅스 컨테이너) - 상세

### 개요
- **목표**: 컨테이너 1개에서 **Backend(Express)** 가 **Frontend 빌드 결과(dist)** 를 같이 서빙
- **DB**: SQLite 파일은 **Docker Volume** 으로 보존(컨테이너 재생성해도 데이터 유지)
- **Windows에서도 가능**: Docker Desktop + WSL2 사용 시 **Linux 컨테이너** 실행 가능

> 접속은 도커 “내부 IP”가 아니라, **호스트(PC/서버) IP:PORT** 로 합니다.  
> 예) `http://<호스트IP>:3000` 또는 포트를 80으로 매핑하면 `http://<호스트IP>/`

---

### 1) (권장) 루트에 .dockerignore 추가
**이유**: `node_modules`, `.env`, `*.db` 같은 큰/민감 파일이 빌드 컨텍스트에 들어가면 느리고 꼬일 수 있음.

루트에 `.dockerignore` 생성:
```gitignore
**/node_modules
**/.env
**/*.db
frontend/dist
.git
```

---

### 2) 루트에 Dockerfile 생성
> 멀티 스테이지 빌드:  
> (1) frontend 빌드 → (2) backend 설치 + prisma generate → (3) 실행 이미지

루트 `Dockerfile`:
```dockerfile
FROM node:20-alpine AS frontend_builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS backend_builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npx prisma generate

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=backend_builder /app/backend /app/backend
COPY --from=frontend_builder /app/frontend/dist /app/frontend/dist
EXPOSE 3000
CMD ["node", "backend/index.js"]
```

---

### 3) 루트에 docker-compose.yml 생성
> **DB 유지가 핵심**이라서, `/data`를 볼륨으로 잡고 `DATABASE_URL`을 그쪽으로 둡니다.

루트 `docker-compose.yml`:
```yaml
services:
  worldcup:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - JWT_SECRET=CHANGE_ME_TO_LONG_RANDOM_STRING
      - DATABASE_URL=file:/data/prod.db
    volumes:
      - worldcup_data:/data
    restart: unless-stopped

volumes:
  worldcup_data:
```

- 동료들이 `:3000`을 치기 불편하면 아래처럼 바꿀 수 있음(80 포트 충돌 주의):
```yaml
ports:
  - "80:3000"
```

---

### 4) 컨테이너 빌드 + 실행
루트에서:
```bash
docker compose up -d --build
```

---

### 5) (최초 1회) Prisma 마이그레이션 적용
테이블이 아직 없으면 기능이 안 되므로 최초 1회 실행:
```bash
docker compose exec worldcup sh -c "cd /app/backend && npx prisma migrate deploy"
```

---

### 6) 접속 확인
- 내 PC: `http://localhost:3000`
- 같은 LAN 다른 PC: `http://<내부IP>:3000` (예: `http://172.20.x.x:3000`)
- API: `http://<호스트>:3000/api/predictions`

---

### 7) 코드 수정 후 “재배포(업데이트)”는 어떻게?
결론: **코드가 바뀌면(프론트/백엔드) 컨테이너를 다시 빌드해서 올리는 게 일반적**입니다.

#### A) 소스 코드만 변경(프론트/백엔드 로직 변경)
1) 코드 수정 후 커밋/푸시(선택)
2) 배포 머신(또는 내 PC)에서:
```bash
docker compose up -d --build
```
- `--build`가 새 이미지로 다시 만들어서 컨테이너를 교체합니다.
- DB는 `worldcup_data` 볼륨에 남아있어 **데이터는 유지**됩니다.

#### B) Prisma 스키마 변경(테이블/컬럼 변경)
1) 개발 PC에서:
   - `schema.prisma` 수정
   - `npx prisma migrate dev --name <변경명>` 로 **migrations 생성**
   - `prisma/migrations/**` 를 Git에 커밋
2) 배포 머신에서 업데이트:
```bash
docker compose up -d --build
docker compose exec worldcup sh -c "cd /app/backend && npx prisma migrate deploy"
```
- **핵심**: 운영/배포 환경에서는 `migrate dev`가 아니라 `migrate deploy`

#### C) 재배포 시 자주 쓰는 명령어
- 상태 확인:
```bash
docker compose ps
```
- 로그 보기:
```bash
docker compose logs -f worldcup
```
- 재시작(이미지 재빌드 없이):
```bash
docker compose restart worldcup
```

> 참고: 개발 중에는 매번 Docker로 돌리기보다,  
> `frontend: npm run dev` + `backend: node index.js` 방식이 더 빠릅니다.  
> Docker는 “동료에게 보여주는 버전/배포 버전”을 만들 때 쓰는 것이 일반적입니다.

---

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

