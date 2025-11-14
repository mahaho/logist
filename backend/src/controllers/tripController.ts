import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getPaginationParams, createPaginatedResult } from '../utils/pagination';

const createTripSchema = z.object({
  number: z.string().min(1),
  couplingId: z.string().uuid().optional(),
  tractorId: z.string().uuid(),
  trailerId: z.string().uuid(),
  driverId: z.string().uuid(),
  routeFrom: z.string().min(1),
  routeTo: z.string().min(1),
  departureDate: z.string().datetime(),
  arrivalDate: z.string().datetime().optional(),
  mileage: z.number().default(0),
  customer: z.string().min(1),
  cargoType: z.string().min(1),
  weight: z.number().positive(),
  ratePerTon: z.number().positive(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']).default('planned'),
});

const updateTripSchema = createTripSchema.partial().extend({
  number: z.string().min(1).optional(),
});

export const getTrips = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);

  const where: any = {};
  if (req.query.status) {
    where.status = req.query.status;
  }
  if (req.query.driverId) {
    where.driverId = req.query.driverId;
  }
  if (req.query.tractorId) {
    where.tractorId = req.query.tractorId;
  }
  if (req.query.search) {
    where.OR = [
      { number: { contains: req.query.search as string, mode: 'insensitive' } },
      { customer: { contains: req.query.search as string, mode: 'insensitive' } },
      { routeFrom: { contains: req.query.search as string, mode: 'insensitive' } },
      { routeTo: { contains: req.query.search as string, mode: 'insensitive' } },
    ];
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
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
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
      },
    }),
    prisma.trip.count({ where }),
  ]);

  res.json(createPaginatedResult(trips, total, page, limit));
};

export const getTripById = async (req: AuthRequest, res: Response) => {
  const trip = await prisma.trip.findUnique({
    where: { id: req.params.id },
    include: {
      driver: true,
      tractor: true,
      trailer: true,
      coupling: true,
      documents: true,
      financeOperations: true,
    },
  });

  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  res.json(trip);
};

export const createTrip = async (req: AuthRequest, res: Response) => {
  try {
    const data = createTripSchema.parse(req.body);

    // Check if trip number already exists
    const existingTrip = await prisma.trip.findUnique({
      where: { number: data.number },
    });

    if (existingTrip) {
      throw new AppError('Trip with this number already exists', 400);
    }

    // Verify entities exist
    const [tractor, trailer, driver] = await Promise.all([
      prisma.tractor.findUnique({ where: { id: data.tractorId } }),
      prisma.trailer.findUnique({ where: { id: data.trailerId } }),
      prisma.driver.findUnique({ where: { id: data.driverId } }),
    ]);

    if (!tractor) throw new AppError('Tractor not found', 404);
    if (!trailer) throw new AppError('Trailer not found', 404);
    if (!driver) throw new AppError('Driver not found', 404);

    // Auto-calculate amount
    const amount = data.weight * data.ratePerTon;

    const trip = await prisma.trip.create({
      data: {
        ...data,
        amount,
        departureDate: new Date(data.departureDate),
        arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : null,
      },
      include: {
        driver: true,
        tractor: true,
        trailer: true,
      },
    });

    res.status(201).json(trip);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const updateTrip = async (req: AuthRequest, res: Response) => {
  try {
    const data = updateTripSchema.parse(req.body);

    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
    });

    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    if (data.number && data.number !== trip.number) {
      const existingTrip = await prisma.trip.findUnique({
        where: { number: data.number },
      });
      if (existingTrip) {
        throw new AppError('Trip with this number already exists', 400);
      }
    }

    // Auto-recalculate amount if weight or ratePerTon changed
    const weight = data.weight ?? trip.weight;
    const ratePerTon = data.ratePerTon ?? trip.ratePerTon;
    const amount = weight * ratePerTon;

    const updateData: any = {
      ...data,
      amount,
    };

    if (data.departureDate) {
      updateData.departureDate = new Date(data.departureDate);
    }
    if (data.arrivalDate !== undefined) {
      updateData.arrivalDate = data.arrivalDate ? new Date(data.arrivalDate) : null;
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        driver: true,
        tractor: true,
        trailer: true,
      },
    });

    res.json(updatedTrip);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const deleteTrip = async (req: AuthRequest, res: Response) => {
  const trip = await prisma.trip.findUnique({
    where: { id: req.params.id },
  });

  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  await prisma.trip.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
};



