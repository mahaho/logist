import { Router } from 'express';
import {
  getTrailers,
  getTrailerById,
  createTrailer,
  updateTrailer,
  deleteTrailer,
} from '../controllers/trailerController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRole(UserRole.admin, UserRole.dispatcher, UserRole.mechanic));

router.get('/', getTrailers);
router.get('/:id', getTrailerById);
router.post('/', createTrailer);
router.put('/:id', updateTrailer);
router.delete('/:id', deleteTrailer);

export default router;



