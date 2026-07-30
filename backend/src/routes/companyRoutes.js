import { Router } from 'express';
import { listCompanies, createCompany, getMyCompany, updateMyCompany } from '../controllers/companyController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { uploadRegistrationDocument } from '../middleware/upload.js';
import { ROLES } from '../constants.js';

const router = Router();

router.use(authenticate);

router.get('/me', requireRole(ROLES.TADBIRKOR), getMyCompany);
router.patch('/me', requireRole(ROLES.TADBIRKOR), uploadRegistrationDocument, updateMyCompany);
router.get('/', listCompanies);
router.post('/', requireRole(ROLES.SUPER_ADMIN), createCompany);

export default router;
