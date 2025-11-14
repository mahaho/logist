import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getPaginationParams, createPaginatedResult } from '../utils/pagination';

const createFinanceOperationSchema = z.object({
  type: z.enum([
    'fuel',
    'carWash',
    'parking',
    'perDiem',
    'advance',
    'salary',
    'repair',
    'maintenance',
    'tolls',
    'misc',
  ]),
  amount: z.number().positive(),
  date: z.string().datetime().optional(),
  driverId: z.string().uuid().optional(),
  tripId: z.string().uuid().optional(),
  tractorId: z.string().uuid().optional(),
  trailerId: z.string().uuid().optional(),
  description: z.string().optional(),
});

const updateFinanceOperationSchema = createFinanceOperationSchema.partial();

export const getFinanceOperations = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);

  const where: any = {};
  if (req.query.type) {
    where.type = req.query.type;
  }
  if (req.query.driverId) {
    where.driverId = req.query.driverId;
  }
  if (req.query.tripId) {
    where.tripId = req.query.tripId;
  }
  if (req.query.tractorId) {
    where.tractorId = req.query.tractorId;
  }
  if (req.query.trailerId) {
    where.trailerId = req.query.trailerId;
  }
  if (req.query.dateFrom) {
    where.date = { gte: new Date(req.query.dateFrom as string) };
  }
  if (req.query.dateTo) {
    where.date = {
      ...where.date,
      lte: new Date(req.query.dateTo as string),
    };
  }

  const [operations, total] = await Promise.all([
    prisma.financeOperation.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        trip: {
          select: {
            id: true,
            number: true,
          },
        },
        tractor: {
          select: {
            id: true,
            plateNumber: true,
          },
        },
        trailer: {
          select: {
            id: true,
            plateNumber: true,
          },
        },
      },
    }),
    prisma.financeOperation.count({ where }),
  ]);

  res.json(createPaginatedResult(operations, total, page, limit));
};

export const getFinanceOperationById = async (req: AuthRequest, res: Response) => {
  const operation = await prisma.financeOperation.findUnique({
    where: { id: req.params.id },
    include: {
      driver: true,
      trip: true,
      tractor: true,
      trailer: true,
    },
  });

  if (!operation) {
    throw new AppError('Finance operation not found', 404);
  }

  res.json(operation);
};

export const createFinanceOperation = async (req: AuthRequest, res: Response) => {
  try {
    const data = createFinanceOperationSchema.parse(req.body);

    // Verify related entities exist if provided
    if (data.driverId) {
      const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
      if (!driver) throw new AppError('Driver not found', 404);
    }
    if (data.tripId) {
      const trip = await prisma.trip.findUnique({ where: { id: data.tripId } });
      if (!trip) throw new AppError('Trip not found', 404);
    }
    if (data.tractorId) {
      const tractor = await prisma.tractor.findUnique({ where: { id: data.tractorId } });
      if (!tractor) throw new AppError('Tractor not found', 404);
    }
    if (data.trailerId) {
      const trailer = await prisma.trailer.findUnique({ where: { id: data.trailerId } });
      if (!trailer) throw new AppError('Trailer not found', 404);
    }

    const operation = await prisma.financeOperation.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
        userId: req.user!.id,
      },
      include: {
        driver: true,
        trip: true,
        tractor: true,
        trailer: true,
      },
    });

    res.status(201).json(operation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const updateFinanceOperation = async (req: AuthRequest, res: Response) => {
  try {
    const data = updateFinanceOperationSchema.parse(req.body);

    const operation = await prisma.financeOperation.findUnique({
      where: { id: req.params.id },
    });

    if (!operation) {
      throw new AppError('Finance operation not found', 404);
    }

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    const updatedOperation = await prisma.financeOperation.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        driver: true,
        trip: true,
        tractor: true,
        trailer: true,
      },
    });

    res.json(updatedOperation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const deleteFinanceOperation = async (req: AuthRequest, res: Response) => {
  const operation = await prisma.financeOperation.findUnique({
    where: { id: req.params.id },
  });

  if (!operation) {
    throw new AppError('Finance operation not found', 404);
  }

  await prisma.financeOperation.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
};



