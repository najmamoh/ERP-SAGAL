import express from 'express';
import { getReceivables } from '../controllers/receivableController';
import { decodeTokenOrMainToken } from '../middlewares';

const router = express.Router();
router.use(decodeTokenOrMainToken);
router.get('/', getReceivables);

export default router;
