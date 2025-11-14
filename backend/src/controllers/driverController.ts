import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getPaginationParams, createPaginatedResult } from '../utils/pagination';

const createDriverSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  middleName: z.string().optional(),
  phone: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseExpiry: z.string().datetime(),
});

const updateDriverSchema = createDriverSchema.partial();

export const getDrivers = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);

  const where: any = {};
  if (req.query.search) {
    where.OR = [
      { firstName: { contains: req.query.search as string, mode: 'insensitive' } },
      { lastName: { contains: req.query.search as string, mode: 'insensitive' } },
      { phone: { contains: req.query.search as string, mode: 'insensitive' } },
      { licenseNumber: { contains: req.query.search as string, mode: 'insensitive' } },
    ];
  }

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({
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
    prisma.driver.count({ where }),
  ]);

  res.json(createPaginatedResult(drivers, total, page, limit));
};

export const getDriverById = async (req: AuthRequest, res: Response) => {
  const driver = await prisma.driver.findUnique({
    where: { id: req.params.id },
    include: {
      documents: true,
      trips: {
        orderBy: { departureDate: 'desc' },
        take: 10,
      },
    },
  });

  if (!driver) {
    throw new AppError('Driver not found', 404);
  }

  res.json(driver);
};

export const createDriver = async (req: AuthRequest, res: Response) => {
  try {
    const data = createDriverSchema.parse(req.body);

    const driver = await prisma.driver.create({
      data: {
        ...data,
        licenseExpiry: new Date(data.licenseExpiry),
      },
    });

    res.status(201).json(driver);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const updateDriver = async (req: AuthRequest, res: Response) => {
  try {
    const data = updateDriverSchema.parse(req.body);

    const driver = await prisma.driver.findUnique({
      where: { id: req.params.id },
    });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    const updateData: any = { ...data };
    if (data.licenseExpiry) {
      updateData.licenseExpiry = new Date(data.licenseExpiry);
    }

    const updatedDriver = await prisma.driver.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(updatedDriver);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const deleteDriver = async (req: AuthRequest, res: Response) => {
  const driver = await prisma.driver.findUnique({
    where: { id: req.params.id },
  });

  if (!driver) {
    throw new AppError('Driver not found', 404);
  }

  await prisma.driver.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
};



