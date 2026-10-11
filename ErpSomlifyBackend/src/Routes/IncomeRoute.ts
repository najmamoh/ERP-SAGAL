// src/routes/financialRoutes.ts
import express from 'express';

import { decodeToken } from '../middlewares/authJwtMiddleware';
import { getProfitLossReport } from '../controllers/IncomeControl';

const router = express.Router();

router.get('/profit-loss', decodeToken, getProfitLossReport);

export default router;