import { Router } from 'express';
import { listNotifications, markRead } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', listNotifications);
router.patch('/:id/read', markRead);

export default router;
