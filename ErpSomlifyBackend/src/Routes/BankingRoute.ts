import express, { Router } from 'express';
import { 
  getBankingAccounts,
  createBankingAccount,
  deleteBankingAccount,
  addMoney,
  removeMoney
} from '../controllers/bankingController';
import { decodeTokenOrMainToken, requirePermission } from '../middlewares';

const router = Router();

// Public route - no token required (verify registration / health check)
router.get('/test', (req, res) => {
  res.json({ message: 'Banking route is working!', path: '/api/banking/test' });
});

// Protected routes - require token and permissions
router.use(decodeTokenOrMainToken);
router.get('/', requirePermission('banking', 'read'), getBankingAccounts);
router.post('/accounts', requirePermission('banking', 'create'), createBankingAccount);
router.delete('/accounts/:account_id', requirePermission('banking', 'delete'), deleteBankingAccount);
router.post('/deposit', requirePermission('banking', 'create'), addMoney);
router.post('/withdraw', requirePermission('banking', 'update'), removeMoney);

console.log('✅Banking routes loaded:');
console.log('  GET /api/banking/');
console.log('  POST /api/banking/accounts');
console.log('  DELETE /api/banking/accounts/:account_id');
console.log('  POST /api/banking/deposit');
console.log('  POST /api/banking/withdraw');
console.log('  GET /api/banking/test (debug)');

export default router;
