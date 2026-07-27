import { Router } from 'express';
import { dashboardSummary, myDashboard } from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { ROLES } from '../constants.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', requireRole(ROLES.SUPER_ADMIN), dashboardSummary);
router.get('/my-dashboard', requireRole(ROLES.TADBIRKOR), myDashboard);

export default router;
