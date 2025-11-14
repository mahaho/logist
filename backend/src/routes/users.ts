import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRole(UserRole.admin));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;



