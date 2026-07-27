import { Router } from 'express';
import { listContracts, getContract, signContract } from '../controllers/contractController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', listContracts);
router.get('/:id', getContract);
router.post('/:id/sign', signContract);

export default router;
