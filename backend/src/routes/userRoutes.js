import { Router } from 'express';
import { listUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { ROLES } from '../constants.js';

const router = Router();

router.use(authenticate, requireRole(ROLES.SUPER_ADMIN));

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
