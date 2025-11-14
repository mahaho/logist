import { Router } from 'express';
import {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
} from '../controllers/tripController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRole(UserRole.admin, UserRole.dispatcher));

router.get('/', getTrips);
router.get('/:id', getTripById);
router.post('/', createTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

export default router;



