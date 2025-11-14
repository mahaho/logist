import { Router } from 'express';
import {
  getTractors,
  getTractorById,
  createTractor,
  updateTractor,
  deleteTractor,
} from '../controllers/tractorController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRole(UserRole.admin, UserRole.dispatcher, UserRole.mechanic));

router.get('/', getTractors);
router.get('/:id', getTractorById);
router.post('/', createTractor);
router.put('/:id', updateTractor);
router.delete('/:id', deleteTractor);

export default router;



