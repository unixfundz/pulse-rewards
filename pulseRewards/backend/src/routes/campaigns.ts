import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const campaignsRouter = Router();

// GET /api/campaigns — list active campaigns (public)
campaignsRouter.get('/', async (_req, res, next) => {
  try {
    const campaigns = await db('campaigns')
      .where({ status: 'active' })
      .orderBy('created_at', 'desc')
      .select(['id', 'merchant_id', 'name', 'description', 'reward_rate', 'starts_at', 'ends_at']);
    res.json({ campaigns });
  } catch (err) {
    next(err);
  }
});

// GET /api/campaigns/:id
campaignsRouter.get('/:id', param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(400, 'Invalid campaign ID');

    const campaign = await db('campaigns').where({ id: req.params.id }).first();
    if (!campaign) throw new AppError(404, 'Campaign not found');
    res.json({ campaign });
  } catch (err) {
    next(err);
  }
});

// POST /api/campaigns — merchants only
campaignsRouter.post(
  '/',
  authenticate,
  requireRole('merchant'),
  [
    body('name').trim().isLength({ min: 1, max: 120 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('reward_rate').isFloat({ min: 0.0001 }),
    body('starts_at').isISO8601(),
    body('ends_at').isISO8601(),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(400, errors.array().map((e) => e.msg).join(', '));
      }

      const { name, description, reward_rate, starts_at, ends_at } = req.body as {
        name: string;
        description?: string;
        reward_rate: number;
        starts_at: string;
        ends_at: string;
      };

      if (new Date(ends_at) <= new Date(starts_at)) {
        throw new AppError(400, 'ends_at must be after starts_at');
      }

      const [campaign] = await db('campaigns')
        .insert({
          id: uuidv4(),
          merchant_id: req.user!.sub,
          name,
          description,
          reward_rate,
          starts_at,
          ends_at,
          status: 'active',
        })
        .returning('*');

      res.status(201).json({ campaign });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/campaigns/:id/deactivate
campaignsRouter.patch(
  '/:id/deactivate',
  authenticate,
  requireRole('merchant'),
  param('id').isUUID(),
  async (req: AuthRequest, res, next) => {
    try {
      const campaign = await db('campaigns').where({ id: req.params.id }).first();
      if (!campaign) throw new AppError(404, 'Campaign not found');
      if (campaign.merchant_id !== req.user!.sub) throw new AppError(403, 'Forbidden');

      await db('campaigns').where({ id: req.params.id }).update({ status: 'inactive' });
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
);
