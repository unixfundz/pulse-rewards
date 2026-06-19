import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { StellarService } from '../services/stellar';

export const rewardsRouter = Router();
const stellar = new StellarService();

// GET /api/rewards — user's reward history
rewardsRouter.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const rewards = await db('rewards')
      .where({ user_id: req.user!.sub })
      .orderBy('created_at', 'desc')
      .select(['id', 'campaign_id', 'amount', 'tx_hash', 'status', 'created_at']);
    res.json({ rewards });
  } catch (err) {
    next(err);
  }
});

// POST /api/rewards/claim — claim reward for a campaign
rewardsRouter.post(
  '/claim',
  authenticate,
  [body('campaign_id').isUUID(), body('wallet_address').isLength({ min: 56, max: 56 })],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(400, errors.array().map((e) => e.msg).join(', '));

      const { campaign_id, wallet_address } = req.body as {
        campaign_id: string;
        wallet_address: string;
      };

      const campaign = await db('campaigns').where({ id: campaign_id, status: 'active' }).first();
      if (!campaign) throw new AppError(404, 'Active campaign not found');

      const now = new Date();
      if (now < new Date(campaign.starts_at) || now > new Date(campaign.ends_at)) {
        throw new AppError(400, 'Campaign is not currently active');
      }

      // Prevent double claims (one per user per campaign)
      const existing = await db('rewards')
        .where({ user_id: req.user!.sub, campaign_id })
        .first();
      if (existing) throw new AppError(409, 'Reward already claimed for this campaign');

      const amount = campaign.reward_rate;

      // Create pending record first
      const [reward] = await db('rewards')
        .insert({
          id: uuidv4(),
          user_id: req.user!.sub,
          campaign_id,
          amount,
          wallet_address,
          status: 'pending',
        })
        .returning('*');

      // Attempt on-chain transfer (non-blocking — update status async)
      stellar
        .transferPulseToken(wallet_address, amount.toString())
        .then((txHash) =>
          db('rewards').where({ id: reward.id }).update({ status: 'confirmed', tx_hash: txHash })
        )
        .catch(async (err) => {
          await db('rewards').where({ id: reward.id }).update({ status: 'failed' });
          throw err;
        });

      res.status(202).json({ reward });
    } catch (err) {
      next(err);
    }
  }
);
