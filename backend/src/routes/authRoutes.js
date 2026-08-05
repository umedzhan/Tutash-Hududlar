import { Router } from 'express';
import { login, me, updateMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.get('/me', authenticate, me);
router.patch('/me', authenticate, updateMe);

export default router;
