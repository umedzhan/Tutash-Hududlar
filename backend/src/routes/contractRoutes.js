import { Router } from 'express';
import {
  listContracts,
  getContract,
  signContract,
  exportContractsExcel,
  exportContractWord,
} from '../controllers/contractController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', listContracts);
router.get('/export/excel', exportContractsExcel);
router.get('/:id', getContract);
router.get('/:id/export/word', exportContractWord);
router.post('/:id/sign', signContract);

export default router;
