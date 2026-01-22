# ---------- build frontend ----------
FROM node:20-alpine AS frontend_builder
WORKDIR /app/frontend

# frontend deps
COPY frontend/package*.json ./
RUN npm ci

# frontend build
COPY frontend/ ./
RUN npm run build


# ---------- build backend ----------
FROM node:20-alpine AS backend_builder
WORKDIR /app/backend

# backend deps
COPY backend/package*.json ./
RUN npm ci

# backend source
COPY backend/ ./

# prisma generate (client 생성)
RUN npx prisma generate


# ---------- runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# backend runtime files
COPY --from=backend_builder /app/backend /app/backend

# frontend dist into frontend folder so backend can serve it
COPY --from=frontend_builder /app/frontend/dist /app/frontend/dist

# (중요) Prisma가 사용하는 엔진/클라이언트 포함
COPY --from=backend_builder /app/backend/node_modules /app/backend/node_modules

EXPOSE 3000

# backend 실행
CMD ["node", "backend/index.js"]
