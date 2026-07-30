import { Router } from 'express';
import {
  listApplications,
  getApplication,
  previewApplication,
  createApplication,
  decideStageController,
  geometryConsentController,
  provideInfoController,
} from '../controllers/applicationController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { uploadLandPhotos } from '../middleware/upload.js';
import { ROLES, STAGE_ROLE_MAP } from '../constants.js';

const router = Router();

router.use(authenticate);

function requireStageRole(req, res, next) {
  const allowedRole = STAGE_ROLE_MAP[req.params.stage];
  if (!allowedRole || (req.user.role !== allowedRole && req.user.role !== ROLES.SUPER_ADMIN)) {
    return res.status(403).json({ message: 'Ushbu bosqich uchun ruxsatingiz yo\'q' });
  }
  next();
}

router.get('/', listApplications);
router.post('/preview', requireRole(ROLES.TADBIRKOR), previewApplication);
router.get('/:id', getApplication);
router.post('/', requireRole(ROLES.TADBIRKOR), uploadLandPhotos, createApplication);
router.post('/:id/stages/:stage/decide', requireStageRole, decideStageController);
router.post('/:id/geometry-consent', requireRole(ROLES.TADBIRKOR), geometryConsentController);
router.post('/:id/provide-info', requireRole(ROLES.TADBIRKOR), provideInfoController);

export default router;
