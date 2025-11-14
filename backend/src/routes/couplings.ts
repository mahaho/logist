import { Router } from 'express';
import {
  getCouplings,
  getCouplingById,
  createCoupling,
  updateCoupling,
  deleteCoupling,
} from '../controllers/couplingController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRole(UserRole.admin, UserRole.dispatcher));

router.get('/', getCouplings);
router.get('/:id', getCouplingById);
router.post('/', createCoupling);
router.put('/:id', updateCoupling);
router.delete('/:id', deleteCoupling);

export default router;



