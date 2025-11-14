import { Router } from 'express';
import {
  getFinanceOperations,
  getFinanceOperationById,
  createFinanceOperation,
  updateFinanceOperation,
  deleteFinanceOperation,
} from '../controllers/financeController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRole(UserRole.admin, UserRole.accountant));

router.get('/', getFinanceOperations);
router.get('/:id', getFinanceOperationById);
router.post('/', createFinanceOperation);
router.put('/:id', updateFinanceOperation);
router.delete('/:id', deleteFinanceOperation);

export default router;



