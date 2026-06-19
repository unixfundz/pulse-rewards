import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client';
import { redis } from '../db/redis';
import { signAccess, signRefresh, verifyToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('role').optional().isIn(['user', 'merchant']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(400, 'Validation failed: ' + errors.array().map((e) => e.msg).join(', '));
      }

      const { email, password, role = 'user' } = req.body as {
        email: string;
        password: string;
        role?: string;
      };

      const existing = await db('users').where({ email }).first();
      if (existing) throw new AppError(409, 'Email already registered');

      const passwordHash = await bcrypt.hash(password, 12);
      const [user] = await db('users')
        .insert({ id: uuidv4(), email, password_hash: passwordHash, role })
        .returning(['id', 'email', 'role', 'created_at']);

      const accessToken = signAccess({ sub: user.id, role: user.role });
      const refreshToken = signRefresh({ sub: user.id, role: user.role, jti: uuidv4() });

      res.status(201).json({ user, accessToken, refreshToken });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
authRouter.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(400, 'Invalid input');

      const { email, password } = req.body as { email: string; password: string };

      const user = await db('users').where({ email }).first();
      if (!user) throw new AppError(401, 'Invalid credentials');

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) throw new AppError(401, 'Invalid credentials');

      const accessToken = signAccess({ sub: user.id, role: user.role });
      const refreshJti = uuidv4();
      const refreshToken = signRefresh({ sub: user.id, role: user.role, jti: refreshJti });

      // store refresh token id in redis for revocation
      await redis.setex(`refresh:${refreshJti}`, 7 * 24 * 3600, user.id);

      res.json({
        user: { id: user.id, email: user.email, role: user.role },
        accessToken,
        refreshToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/refresh
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) throw new AppError(400, 'refreshToken required');

    const payload = verifyToken(refreshToken);
    if (!payload.jti) throw new AppError(401, 'Invalid token');

    const stored = await redis.get(`refresh:${payload.jti}`);
    if (!stored) throw new AppError(401, 'Token revoked or expired');

    // rotate
    await redis.del(`refresh:${payload.jti}`);
    const newJti = uuidv4();
    const newRefresh = signRefresh({ sub: payload.sub, role: payload.role, jti: newJti });
    const newAccess = signAccess({ sub: payload.sub, role: payload.role });
    await redis.setex(`refresh:${newJti}`, 7 * 24 * 3600, payload.sub);

    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
authRouter.post('/logout', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) {
      const payload = verifyToken(refreshToken);
      if (payload.jti) await redis.del(`refresh:${payload.jti}`);
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
