import { Router } from 'express';
import { listCompanies, createCompany } from '../controllers/companyController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { ROLES } from '../constants.js';

const router = Router();

router.use(authenticate);

router.get('/', listCompanies);
router.post('/', requireRole(ROLES.SUPER_ADMIN), createCompany);

export default router;
