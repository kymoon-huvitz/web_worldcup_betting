console.log("Starting backend...");
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import { PrismaClient, Prisma } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// ---------- helpers ----------
function signToken(user: { id: number }) {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
}

interface AuthRequest extends Request {
  userId?: number;
}

function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ---------- routes ----------

// 회원가입
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name: name || null },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const token = signToken(user);
    res.json({ user, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// 로그인
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      token,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 예측 등록/수정 (유저당 1개, upsert)
app.post('/api/predictions', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { homeScore, awayScore } = req.body;
    if (homeScore === undefined || awayScore === undefined) {
      return res.status(400).json({ error: 'homeScore and awayScore are required' });
    }
    if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore)) {
      return res.status(400).json({ error: 'Scores must be integers' });
    }
    if (homeScore < 0 || awayScore < 0) {
      return res.status(400).json({ error: 'Scores must be >= 0' });
    }

    const prediction = await prisma.prediction.upsert({
      where: { userId: req.userId },
      update: { homeScore, awayScore },
      create: { userId: req.userId!, homeScore, awayScore },
    });

    res.json(prediction);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Save prediction failed' });
  }
});

// 메인: 모든 유저 예측 목록
app.get('/api/predictions', async (req: Request, res: Response) => {
  try {
    const list = await prisma.prediction.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    const result = list.map((p: (Prisma.PredictionGetPayload<{include: {user: {select: {id: true, email: true, name: true}}}}>)) => ({
      userId: p.user.id,
      name: p.user.name || p.user.email,
      email: p.user.email,
      homeScore: p.homeScore,
      awayScore: p.awayScore,
      updatedAt: p.updatedAt,
    }));

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Fetch predictions failed' });
  }
});

// 내 예측 조회
app.get('/api/predictions/me', auth, async (req: AuthRequest, res: Response) => {
  try {
    const p = await prisma.prediction.findUnique({
      where: { userId: req.userId },
    });
    res.json(p);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Fetch my prediction failed' });
  }
});

/**
 * ---------- frontend static serving (production-like) ----------
 * 먼저 프론트를 빌드해야 함: (frontend) npm run build
 */
const distPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distPath));

// /api 제외한 모든 요청은 React로
app.get(/^(?!\/api).*/, (req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// 마지막에 listen
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
