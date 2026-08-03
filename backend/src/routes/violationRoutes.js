import { Router } from 'express';
import { listViolations, createViolation, updateViolationStatus, violationAct } from '../controllers/violationController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { uploadInspectionFiles } from '../middleware/upload.js';
import { ROLES } from '../constants.js';

const router = Router();

router.use(authenticate);

const WRITE_ROLES = [ROLES.KADASTR, ROLES.SOLIQ, ROLES.SUPER_ADMIN];
// Arxitektura ham "yagona ma'lumot maqoni" doirasida reestrni ko'ra oladi (o'qish uchun).
const READ_ROLES = [...WRITE_ROLES, ROLES.ARXITEKTURA];

router.get('/', requireRole(...READ_ROLES), listViolations);
router.post('/', requireRole(...WRITE_ROLES), uploadInspectionFiles, createViolation);
router.patch('/:id/status', requireRole(...WRITE_ROLES), updateViolationStatus);
router.get('/:id/act', requireRole(...READ_ROLES), violationAct);

export default router;
