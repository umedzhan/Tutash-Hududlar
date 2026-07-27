import { Router } from 'express';
import {
  listRegions,
  getRegion,
  listMyRegions,
  createRegion,
  updateRegion,
  regionStats,
} from '../controllers/regionController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { ROLES } from '../constants.js';

const router = Router();

router.use(authenticate);

router.get('/stats', requireRole(ROLES.SUPER_ADMIN), regionStats);
router.get('/mine', requireRole(ROLES.TADBIRKOR), listMyRegions);
router.get('/', listRegions);
router.get('/:id', getRegion);
router.post('/', requireRole(ROLES.SUPER_ADMIN), createRegion);
router.patch('/:id', requireRole(ROLES.SUPER_ADMIN), updateRegion);

export default router;
