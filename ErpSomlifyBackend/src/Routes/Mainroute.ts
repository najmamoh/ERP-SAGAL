import express from 'express';
import {
  signup,
  signin,
  refreshToken,
  logout,
  whoami,
  getAllMainUsers,
  getOneMainUser,
  updateMainUser,
  deleteMainUser,
} from '../controllers/MainAuthControl';
import { decodeMainToken, isSuperAdmin, isMainAdmin } from '../middlewares/main.jwt';

const router = express.Router();

// Public routes
router.post('/signin', signin);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Protected routes
router.post('/signup', decodeMainToken, isSuperAdmin, signup);
router.get('/whoami', decodeMainToken, isMainAdmin, whoami); // Admin dashboard requires admin role
router.get('/', decodeMainToken, isMainAdmin, getAllMainUsers);
router.get('/:id', decodeMainToken, isMainAdmin, getOneMainUser);
router.put('/:id', decodeMainToken, isSuperAdmin, updateMainUser);
router.delete('/:id', decodeMainToken, isSuperAdmin, deleteMainUser);

export default router;