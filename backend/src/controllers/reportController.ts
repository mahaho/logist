import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { getPaginationParams, createPaginatedResult } from '../utils/pagination';

export const getTripProfitLoss = async (req: AuthRequest, res: Response) => {
  const tripId = req.params.tripId;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      financeOperations: true,
    },
  });

  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  const expenses = trip.financeOperations.reduce((sum, op) => sum + op.amount, 0);
  const profit = trip.amount - expenses;

  res.json({
    trip: {
      id: trip.id,
      number: trip.number,
      amount: trip.amount,
    },
    expenses,
    profit,
    profitMargin: trip.amount > 0 ? (profit / trip.amount) * 100 : 0,
  });
};

export const getDriverFinanceReport = async (req: AuthRequest, res: Response) => {
  const driverId = req.params.driverId;
  const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
  const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

  const where: any = { driverId };
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = dateFrom;
    if (dateTo) where.date.lte = dateTo;
  }

  const operations = await prisma.financeOperation.findMany({
    where,
    include: {
      trip: {
        select: {
          id: true,
          number: true,
          amount: true,
        },
      },
    },
  });

  const totalExpenses = operations.reduce((sum, op) => sum + op.amount, 0);
  const trips = await prisma.trip.findMany({
    where: {
      driverId,
      ...(dateFrom || dateTo
        ? {
            departureDate: {
              ...(dateFrom ? { gte: dateFrom } : {}),
              ...(dateTo ? { lte: dateTo } : {}),
            },
          }
        : {}),
    },
  });

  const totalIncome = trips.reduce((sum, trip) => sum + trip.amount, 0);
  const balance = totalIncome - totalExpenses;

  res.json({
    driverId,
    period: { dateFrom, dateTo },
    income: totalIncome,
    expenses: totalExpenses,
    balance,
    operations: operations.length,
    trips: trips.length,
  });
};

export const getTractorExpenses = async (req: AuthRequest, res: Response) => {
  const tractorId = req.params.tractorId;
  const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
  const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

  const where: any = { tractorId };
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = dateFrom;
    if (dateTo) where.date.lte = dateTo;
  }

  const operations = await prisma.financeOperation.findMany({
    where,
    groupBy: ['type'],
  });

  const expensesByType = await prisma.financeOperation.groupBy({
    by: ['type'],
    where,
    _sum: {
      amount: true,
    },
  });

  const totalExpenses = await prisma.financeOperation.aggregate({
    where,
    _sum: {
      amount: true,
    },
  });

  res.json({
    tractorId,
    period: { dateFrom, dateTo },
    totalExpenses: totalExpenses._sum.amount || 0,
    expensesByType: expensesByType.map((item) => ({
      type: item.type,
      amount: item._sum.amount || 0,
    })),
  });
};

export const getTrailerExpenses = async (req: AuthRequest, res: Response) => {
  const trailerId = req.params.trailerId;
  const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
  const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

  const where: any = { trailerId };
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = dateFrom;
    if (dateTo) where.date.lte = dateTo;
  }

  const expensesByType = await prisma.financeOperation.groupBy({
    by: ['type'],
    where,
    _sum: {
      amount: true,
    },
  });

  const totalExpenses = await prisma.financeOperation.aggregate({
    where,
    _sum: {
      amount: true,
    },
  });

  res.json({
    trailerId,
    period: { dateFrom, dateTo },
    totalExpenses: totalExpenses._sum.amount || 0,
    expensesByType: expensesByType.map((item) => ({
      type: item.type,
      amount: item._sum.amount || 0,
    })),
  });
};

export const getCompanyFinanceReport = async (req: AuthRequest, res: Response) => {
  const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
  const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

  const tripWhere: any = {};
  const financeWhere: any = {};

  if (dateFrom || dateTo) {
    const dateFilter: any = {};
    if (dateFrom) dateFilter.gte = dateFrom;
    if (dateTo) dateFilter.lte = dateTo;
    tripWhere.departureDate = dateFilter;
    financeWhere.date = dateFilter;
  }

  const [trips, operations] = await Promise.all([
    prisma.trip.findMany({
      where: tripWhere,
    }),
    prisma.financeOperation.findMany({
      where: financeWhere,
    }),
  ]);

  const totalIncome = trips.reduce((sum, trip) => sum + trip.amount, 0);
  const totalExpenses = operations.reduce((sum, op) => sum + op.amount, 0);
  const profit = totalIncome - totalExpenses;

  const expensesByType = await prisma.financeOperation.groupBy({
    by: ['type'],
    where: financeWhere,
    _sum: {
      amount: true,
    },
  });

  res.json({
    period: { dateFrom, dateTo },
    income: totalIncome,
    expenses: totalExpenses,
    profit,
    profitMargin: totalIncome > 0 ? (profit / totalIncome) * 100 : 0,
    trips: trips.length,
    expensesByType: expensesByType.map((item) => ({
      type: item.type,
      amount: item._sum.amount || 0,
    })),
  });
};

export const getTripRegister = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);

  const where: any = {};
  if (req.query.status) {
    where.status = req.query.status;
  }
  if (req.query.dateFrom) {
    where.departureDate = { gte: new Date(req.query.dateFrom as string) };
  }
  if (req.query.dateTo) {
    where.departureDate = {
      ...where.departureDate,
      lte: new Date(req.query.dateTo as string),
    };
  }

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        driver: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        tractor: {
          select: {
            plateNumber: true,
          },
        },
        trailer: {
          select: {
            plateNumber: true,
          },
        },
      },
    }),
    prisma.trip.count({ where }),
  ]);

  res.json(createPaginatedResult(trips, total, page, limit));
};

export const getMaintenanceHistory = async (req: AuthRequest, res: Response) => {
  const transportId = req.query.transportId as string;
  const entityType = req.query.entityType as string;

  if (!transportId || !entityType) {
    return res.status(400).json({ error: 'transportId and entityType are required' });
  }

  const records = await prisma.maintenance.findMany({
    where: {
      transportId,
      entityType,
    },
    orderBy: { date: 'desc' },
    include: {
      mechanic: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  res.json(records);
};

export const getUpcomingMaintenance = async (req: AuthRequest, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() + days);

  // This would require additional logic based on mileage intervals
  // For now, return recent maintenance records
  const records = await prisma.maintenance.findMany({
    where: {
      date: {
        gte: new Date(),
        lte: dateThreshold,
      },
    },
    include: {
      mechanic: true,
    },
    orderBy: { date: 'asc' },
  });

  res.json(records);
};

export const getDriverWorkload = async (req: AuthRequest, res: Response) => {
  const driverId = req.query.driverId as string;
  const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
  const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

  const where: any = {};
  if (driverId) {
    where.driverId = driverId;
  }
  if (dateFrom || dateTo) {
    where.departureDate = {};
    if (dateFrom) where.departureDate.gte = dateFrom;
    if (dateTo) where.departureDate.lte = dateTo;
  }

  const trips = await prisma.trip.findMany({
    where,
    include: {
      driver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const driverStats = trips.reduce((acc, trip) => {
    const driverId = trip.driverId;
    if (!acc[driverId]) {
      acc[driverId] = {
        driver: trip.driver,
        trips: 0,
        totalMileage: 0,
        totalAmount: 0,
      };
    }
    acc[driverId].trips += 1;
    acc[driverId].totalMileage += trip.mileage;
    acc[driverId].totalAmount += trip.amount;
    return acc;
  }, {} as any);

  res.json(Object.values(driverStats));
};

export const getExpiringDocuments = async (req: AuthRequest, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);

  const documents = await prisma.document.findMany({
    where: {
      expiryDate: {
        lte: expiryDate,
        gte: new Date(),
      },
    },
    orderBy: { expiryDate: 'asc' },
  });

  res.json(documents);
};

export const getExpiredDocuments = async (req: AuthRequest, res: Response) => {
  const documents = await prisma.document.findMany({
    where: {
      expiryDate: {
        lt: new Date(),
      },
    },
    orderBy: { expiryDate: 'asc' },
  });

  res.json(documents);
};

