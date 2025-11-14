import { Router } from 'express';
import {
  getMaintenanceRecords,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from '../controllers/maintenanceController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRole(UserRole.admin, UserRole.mechanic));

router.get('/', getMaintenanceRecords);
router.get('/:id', getMaintenanceById);
router.post('/', createMaintenance);
router.put('/:id', updateMaintenance);
router.delete('/:id', deleteMaintenance);

export default router;



