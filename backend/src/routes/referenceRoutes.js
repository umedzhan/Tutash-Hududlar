import { Router } from 'express';
import { listDistricts, listZones, listPurposes, currentTariff } from '../controllers/referenceController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Tuman/mahalla ro'yxati ochiq — ro'yxatdan o'tish formasi (login talab qilinmaydi) shundan foydalanadi.
router.get('/districts', listDistricts);
router.get('/zones', listZones);

router.use(authenticate);

router.get('/purposes', listPurposes);
router.get('/tariff', currentTariff);

export default router;
