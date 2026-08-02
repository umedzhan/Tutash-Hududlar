import { Router } from 'express';
import {
  dashboardSummary,
  myDashboard,
  applicationFunnel,
  paymentTrend,
  expiringContracts,
  districtRanking,
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { ROLES } from '../constants.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', requireRole(ROLES.SUPER_ADMIN), dashboardSummary);
router.get('/my-dashboard', requireRole(ROLES.TADBIRKOR), myDashboard);
router.get('/application-funnel', requireRole(ROLES.SUPER_ADMIN), applicationFunnel);
router.get('/payment-trend', requireRole(ROLES.SUPER_ADMIN), paymentTrend);
router.get('/expiring-contracts', requireRole(ROLES.SUPER_ADMIN), expiringContracts);
router.get('/district-ranking', requireRole(ROLES.SUPER_ADMIN), districtRanking);

export default router;
