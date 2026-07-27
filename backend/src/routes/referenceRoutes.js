import { Router } from 'express';
import { listDistricts, listZones, listPurposes, currentTariff } from '../controllers/referenceController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/districts', listDistricts);
router.get('/zones', listZones);
router.get('/purposes', listPurposes);
router.get('/tariff', currentTariff);

export default router;
