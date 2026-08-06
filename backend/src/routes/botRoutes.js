import { Router } from 'express';
import { botRegister, botSession } from '../controllers/botController.js';
import { requireBotSecret } from '../middleware/botAuth.js';

const router = Router();

router.use(requireBotSecret);
router.post('/register', botRegister);
router.post('/session', botSession);

export default router;
