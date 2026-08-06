import { Router } from 'express';
import { listDistricts, listZones, listPurposes, updatePurpose, currentTariff, updateTariff } from '../controllers/referenceController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { ROLES } from '../constants.js';

const router = Router();

// Tuman/mahalla ro'yxati ochiq — ro'yxatdan o'tish formasi (login talab qilinmaydi) shundan foydalanadi.
router.get('/districts', listDistricts);
router.get('/zones', listZones);

router.use(authenticate);

router.get('/purposes', listPurposes);
router.patch('/purposes/:id', requireRole(ROLES.SUPER_ADMIN), updatePurpose);
router.get('/tariff', currentTariff);
router.patch('/tariff', requireRole(ROLES.SUPER_ADMIN), updateTariff);

export default router;
