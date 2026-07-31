import { Router } from 'express';
import {
  createRegistrationRequest,
  listRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest,
} from '../controllers/registrationRequestController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { ROLES } from '../constants.js';

const router = Router();

router.post('/', createRegistrationRequest);
router.get('/', authenticate, requireRole(ROLES.SUPER_ADMIN), listRegistrationRequests);
router.post('/:id/approve', authenticate, requireRole(ROLES.SUPER_ADMIN), approveRegistrationRequest);
router.post('/:id/reject', authenticate, requireRole(ROLES.SUPER_ADMIN), rejectRegistrationRequest);

export default router;
