import { Router } from 'express';
import {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
} from '../controllers/driverController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRole(UserRole.admin, UserRole.dispatcher));

router.get('/', getDrivers);
router.get('/:id', getDriverById);
router.post('/', createDriver);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);

export default router;



