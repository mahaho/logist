import { Router } from 'express';
import {
  getTripProfitLoss,
  getDriverFinanceReport,
  getTractorExpenses,
  getTrailerExpenses,
  getCompanyFinanceReport,
  getTripRegister,
  getMaintenanceHistory,
  getUpcomingMaintenance,
  getDriverWorkload,
  getExpiringDocuments,
  getExpiredDocuments,
} from '../controllers/reportController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { getPaginationParams, createPaginatedResult } from '../utils/pagination';

const router = Router();

router.use(authenticate);

// Financial reports
router.get('/finance/trip/:tripId', requireRole(UserRole.admin, UserRole.accountant), getTripProfitLoss);
router.get('/finance/driver/:driverId', requireRole(UserRole.admin, UserRole.accountant), getDriverFinanceReport);
router.get('/finance/tractor/:tractorId', requireRole(UserRole.admin, UserRole.accountant), getTractorExpenses);
router.get('/finance/trailer/:trailerId', requireRole(UserRole.admin, UserRole.accountant), getTrailerExpenses);
router.get('/finance/company', requireRole(UserRole.admin, UserRole.accountant), getCompanyFinanceReport);

// Trip reports
router.get('/trips/register', requireRole(UserRole.admin, UserRole.dispatcher), getTripRegister);

// Maintenance reports
router.get('/maintenance/history', requireRole(UserRole.admin, UserRole.mechanic), getMaintenanceHistory);
router.get('/maintenance/upcoming', requireRole(UserRole.admin, UserRole.mechanic), getUpcomingMaintenance);

// Driver reports
router.get('/drivers/workload', requireRole(UserRole.admin, UserRole.dispatcher), getDriverWorkload);

// Document reports
router.get('/documents/expiring', getExpiringDocuments);
router.get('/documents/expired', getExpiredDocuments);

export default router;



