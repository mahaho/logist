import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getPaginationParams, createPaginatedResult } from '../utils/pagination';

const createTractorSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  vin: z.string().min(1),
  plateNumber: z.string().min(1),
  mileage: z.number().default(0),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  status: z.enum(['active', 'maintenance', 'inactive']).default('active'),
  fuelType: z.enum(['diesel', 'gasoline', 'gas']),
  consumption: z.number().positive(),
});

const updateTractorSchema = createTractorSchema.partial();

export const getTractors = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);

  const where: any = {};
  if (req.query.status) {
    where.status = req.query.status;
  }
  if (req.query.search) {
    where.OR = [
      { brand: { contains: req.query.search as string, mode: 'insensitive' } },
      { model: { contains: req.query.search as string, mode: 'insensitive' } },
      { plateNumber: { contains: req.query.search as string, mode: 'insensitive' } },
      { vin: { contains: req.query.search as string, mode: 'insensitive' } },
    ];
  }

  const [tractors, total] = await Promise.all([
    prisma.tractor.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        documents: {
          select: {
            id: true,
            type: true,
            expiryDate: true,
          },
        },
      },
    }),
    prisma.tractor.count({ where }),
  ]);

  res.json(createPaginatedResult(tractors, total, page, limit));
};

export const getTractorById = async (req: AuthRequest, res: Response) => {
  const tractor = await prisma.tractor.findUnique({
    where: { id: req.params.id },
    include: {
      documents: true,
      maintenanceRecords: {
        orderBy: { date: 'desc' },
        take: 10,
      },
    },
  });

  if (!tractor) {
    throw new AppError('Tractor not found', 404);
  }

  res.json(tractor);
};

export const createTractor = async (req: AuthRequest, res: Response) => {
  try {
    const data = createTractorSchema.parse(req.body);

    const existingVin = await prisma.tractor.findUnique({
      where: { vin: data.vin },
    });

    if (existingVin) {
      throw new AppError('Tractor with this VIN already exists', 400);
    }

    const existingPlate = await prisma.tractor.findUnique({
      where: { plateNumber: data.plateNumber },
    });

    if (existingPlate) {
      throw new AppError('Tractor with this plate number already exists', 400);
    }

    const tractor = await prisma.tractor.create({
      data,
    });

    res.status(201).json(tractor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const updateTractor = async (req: AuthRequest, res: Response) => {
  try {
    const data = updateTractorSchema.parse(req.body);

    const tractor = await prisma.tractor.findUnique({
      where: { id: req.params.id },
    });

    if (!tractor) {
      throw new AppError('Tractor not found', 404);
    }

    if (data.vin && data.vin !== tractor.vin) {
      const existingVin = await prisma.tractor.findUnique({
        where: { vin: data.vin },
      });
      if (existingVin) {
        throw new AppError('Tractor with this VIN already exists', 400);
      }
    }

    if (data.plateNumber && data.plateNumber !== tractor.plateNumber) {
      const existingPlate = await prisma.tractor.findUnique({
        where: { plateNumber: data.plateNumber },
      });
      if (existingPlate) {
        throw new AppError('Tractor with this plate number already exists', 400);
      }
    }

    const updatedTractor = await prisma.tractor.update({
      where: { id: req.params.id },
      data,
    });

    res.json(updatedTractor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const deleteTractor = async (req: AuthRequest, res: Response) => {
  const tractor = await prisma.tractor.findUnique({
    where: { id: req.params.id },
  });

  if (!tractor) {
    throw new AppError('Tractor not found', 404);
  }

  await prisma.tractor.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
};



