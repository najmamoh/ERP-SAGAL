import express from 'express';
import { globalSearch } from '../controllers/searchController';
import { decodeTokenOrMainToken } from '../middlewares';

const router = express.Router();
router.use(decodeTokenOrMainToken);
router.get('/', globalSearch);

export default router;
