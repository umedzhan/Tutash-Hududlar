import { Router } from 'express';
import { listInspections, createInspection } from '../controllers/inspectionController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { uploadInspectionFiles } from '../middleware/upload.js';
import { ROLES } from '../constants.js';

const router = Router();

router.use(authenticate);

const STAFF = [ROLES.KADASTR, ROLES.SOLIQ, ROLES.SUPER_ADMIN];

router.get('/', requireRole(...STAFF), listInspections);
router.post('/', requireRole(...STAFF), uploadInspectionFiles, createInspection);

export default router;
