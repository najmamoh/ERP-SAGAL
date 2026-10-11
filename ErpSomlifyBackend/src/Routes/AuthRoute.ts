import express from 'express';
import { deleteUser, getAllUsers, getOneUser, refreshToken, signin, signup, updateUser, whoami, logout } from '../controllers/AuthController';
import { decodeToken } from '../middlewares/authJwtMiddleware';
import { decodeTokenOrMainToken } from '../middlewares/decodeTokenOrMainToken';

const router = express.Router();

// Public routes
router.post('/signin', signin);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

// Company user self-service (company token only)
router.get('/whoami', decodeToken, whoami);

// Admin-accessible routes (main user OR company user)
router.post('/signup', decodeTokenOrMainToken, signup);
router.get('/All', decodeTokenOrMainToken, getAllUsers);
router.get('/getOne/:user_id', decodeTokenOrMainToken, getOneUser);
router.put('/:id', decodeTokenOrMainToken, updateUser);
router.delete('/:id', decodeTokenOrMainToken, deleteUser);

export default router;
  