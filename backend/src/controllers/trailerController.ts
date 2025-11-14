import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getPaginationParams, createPaginatedResult } from '../utils/pagination';

const createTrailerSchema = z.object({
  type: z.enum(['tent', 'refrigerator', 'curtain', 'board']),
  model: z.string().min(1),
  plateNumber: z.string().min(1),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.number().default(0),
  payload: z.number().positive(),
});

const updateTrailerSchema = createTrailerSchema.partial();

export const getTrailers = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);

  const where: any = {};
  if (req.query.type) {
    where.type = req.query.type;
  }
  if (req.query.search) {
    where.OR = [
      { model: { contains: req.query.search as string, mode: 'insensitive' } },
      { plateNumber: { contains: req.query.search as string, mode: 'insensitive' } },
    ];
  }

  const [trailers, total] = await Promise.all([
    prisma.trailer.findMany({
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
    prisma.trailer.count({ where }),
  ]);

  res.json(createPaginatedResult(trailers, total, page, limit));
};

export const getTrailerById = async (req: AuthRequest, res: Response) => {
  const trailer = await prisma.trailer.findUnique({
    where: { id: req.params.id },
    include: {
      documents: true,
      maintenanceRecords: {
        orderBy: { date: 'desc' },
        take: 10,
      },
    },
  });

  if (!trailer) {
    throw new AppError('Trailer not found', 404);
  }

  res.json(trailer);
};

export const createTrailer = async (req: AuthRequest, res: Response) => {
  try {
    const data = createTrailerSchema.parse(req.body);

    const existingPlate = await prisma.trailer.findUnique({
      where: { plateNumber: data.plateNumber },
    });

    if (existingPlate) {
      throw new AppError('Trailer with this plate number already exists', 400);
    }

    const trailer = await prisma.trailer.create({
      data,
    });

    res.status(201).json(trailer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const updateTrailer = async (req: AuthRequest, res: Response) => {
  try {
    const data = updateTrailerSchema.parse(req.body);

    const trailer = await prisma.trailer.findUnique({
      where: { id: req.params.id },
    });

    if (!trailer) {
      throw new AppError('Trailer not found', 404);
    }

    if (data.plateNumber && data.plateNumber !== trailer.plateNumber) {
      const existingPlate = await prisma.trailer.findUnique({
        where: { plateNumber: data.plateNumber },
      });
      if (existingPlate) {
        throw new AppError('Trailer with this plate number already exists', 400);
      }
    }

    const updatedTrailer = await prisma.trailer.update({
      where: { id: req.params.id },
      data,
    });

    res.json(updatedTrailer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const deleteTrailer = async (req: AuthRequest, res: Response) => {
  const trailer = await prisma.trailer.findUnique({
    where: { id: req.params.id },
  });

  if (!trailer) {
    throw new AppError('Trailer not found', 404);
  }

  await prisma.trailer.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
};



