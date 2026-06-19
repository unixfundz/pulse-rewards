import { Router } from 'express';
import { param, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { StellarService } from '../services/stellar';

export const walletRouter = Router();
const stellar = new StellarService();

// GET /api/wallet/:address/balance — fetch on-chain PULSE balance
walletRouter.get(
  '/:address/balance',
  authenticate,
  param('address').isLength({ min: 56, max: 56 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(400, 'Invalid Stellar address');

      const balance = await stellar.getPulseBalance(req.params.address);
      res.json({ address: req.params.address, balance });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/wallet/:address/transactions — recent PULSE transactions
walletRouter.get(
  '/:address/transactions',
  authenticate,
  param('address').isLength({ min: 56, max: 56 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(400, 'Invalid Stellar address');

      const transactions = await stellar.getRecentTransactions(req.params.address);
      res.json({ address: req.params.address, transactions });
    } catch (err) {
      next(err);
    }
  }
);
