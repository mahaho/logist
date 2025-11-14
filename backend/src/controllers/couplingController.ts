import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getPaginationParams, createPaginatedResult } from '../utils/pagination';

const createCouplingSchema = z.object({
  tractorId: z.string().uuid(),
  trailerId: z.string().uuid(),
  driverId: z.string().uuid(),
  isActive: z.boolean().default(true),
});

const updateCouplingSchema = z.object({
  isActive: z.boolean().optional(),
});

export const getCouplings = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);

  const where: any = {};
  if (req.query.isActive !== undefined) {
    where.isActive = req.query.isActive === 'true';
  }
  if (req.query.driverId) {
    where.driverId = req.query.driverId;
  }
  if (req.query.tractorId) {
    where.tractorId = req.query.tractorId;
  }

  const [couplings, total] = await Promise.all([
    prisma.coupling.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        tractor: {
          select: {
            id: true,
            brand: true,
            model: true,
            plateNumber: true,
          },
        },
        trailer: {
          select: {
            id: true,
            type: true,
            model: true,
            plateNumber: true,
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    }),
    prisma.coupling.count({ where }),
  ]);

  res.json(createPaginatedResult(couplings, total, page, limit));
};

export const getCouplingById = async (req: AuthRequest, res: Response) => {
  const coupling = await prisma.coupling.findUnique({
    where: { id: req.params.id },
    include: {
      tractor: true,
      trailer: true,
      driver: true,
      trips: {
        orderBy: { departureDate: 'desc' },
        take: 10,
      },
    },
  });

  if (!coupling) {
    throw new AppError('Coupling not found', 404);
  }

  res.json(coupling);
};

export const createCoupling = async (req: AuthRequest, res: Response) => {
  try {
    const data = createCouplingSchema.parse(req.body);

    // Verify entities exist
    const [tractor, trailer, driver] = await Promise.all([
      prisma.tractor.findUnique({ where: { id: data.tractorId } }),
      prisma.trailer.findUnique({ where: { id: data.trailerId } }),
      prisma.driver.findUnique({ where: { id: data.driverId } }),
    ]);

    if (!tractor) throw new AppError('Tractor not found', 404);
    if (!trailer) throw new AppError('Trailer not found', 404);
    if (!driver) throw new AppError('Driver not found', 404);

    const coupling = await prisma.coupling.create({
      data,
      include: {
        tractor: true,
        trailer: true,
        driver: true,
      },
    });

    res.status(201).json(coupling);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const updateCoupling = async (req: AuthRequest, res: Response) => {
  try {
    const data = updateCouplingSchema.parse(req.body);

    const coupling = await prisma.coupling.findUnique({
      where: { id: req.params.id },
    });

    if (!coupling) {
      throw new AppError('Coupling not found', 404);
    }

    const updatedCoupling = await prisma.coupling.update({
      where: { id: req.params.id },
      data,
      include: {
        tractor: true,
        trailer: true,
        driver: true,
      },
    });

    res.json(updatedCoupling);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const deleteCoupling = async (req: AuthRequest, res: Response) => {
  const coupling = await prisma.coupling.findUnique({
    where: { id: req.params.id },
  });

  if (!coupling) {
    throw new AppError('Coupling not found', 404);
  }

  await prisma.coupling.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
};



