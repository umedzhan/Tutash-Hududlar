import { Router } from 'express';
import {
  listRestrictedAreas,
  createRestrictedArea,
  deleteRestrictedArea,
  exportRestrictedAreasExcel,
} from '../controllers/restrictedAreaController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { ROLES } from '../constants.js';

const router = Router();

router.use(authenticate);

router.get('/', listRestrictedAreas);
router.get('/export/excel', exportRestrictedAreasExcel);
router.post('/', requireRole(ROLES.ARXITEKTURA, ROLES.SUPER_ADMIN), createRestrictedArea);
router.delete('/:id', requireRole(ROLES.ARXITEKTURA, ROLES.SUPER_ADMIN), deleteRestrictedArea);

export default router;
