import { Router } from 'express';
import { listInspections, createInspection, exportInspectionsExcel } from '../controllers/inspectionController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { uploadInspectionFiles } from '../middleware/upload.js';
import { ROLES } from '../constants.js';

const router = Router();

router.use(authenticate);

const STAFF = [ROLES.KADASTR, ROLES.SOLIQ, ROLES.SUPER_ADMIN];

router.get('/', requireRole(...STAFF), listInspections);
router.get('/export/excel', requireRole(...STAFF), exportInspectionsExcel);
router.post('/', requireRole(...STAFF), uploadInspectionFiles, createInspection);

export default router;
