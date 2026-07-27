import { Router } from 'express';
import { listMonitoring, createMonitoring } from '../controllers/monitoringController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { ROLES } from '../constants.js';

const router = Router();

router.use(authenticate);

router.get('/', listMonitoring);
router.post('/', requireRole(ROLES.SUPER_ADMIN), createMonitoring);

export default router;
