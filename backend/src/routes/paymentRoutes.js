import { Router } from 'express';
import { listPayments, createPayment, markPaid, paymentStats } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { ROLES } from '../constants.js';

const router = Router();

router.use(authenticate);

router.get('/stats', requireRole(ROLES.SUPER_ADMIN), paymentStats);
router.get('/', listPayments);
router.post('/', requireRole(ROLES.SUPER_ADMIN), createPayment);
router.post('/:id/mark-paid', markPaid);

export default router;
