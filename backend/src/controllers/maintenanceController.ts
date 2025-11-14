import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getPaginationParams, createPaginatedResult } from '../utils/pagination';

const createMaintenanceSchema = z.object({
  type: z.enum(['scheduled', 'unscheduled']),
  entityType: z.enum(['tractor', 'trailer']),
  transportId: z.string().uuid(),
  date: z.string().datetime(),
  mileage: z.number().min(0),
  tasks: z.array(z.string()).default([]),
  materials: z.array(z.string()).default([]),
  cost: z.number().min(0),
  mechanicId: z.string().uuid(),
});

const updateMaintenanceSchema = createMaintenanceSchema.partial();

export const getMaintenanceRecords = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);

  const where: any = {};
  if (req.query.type) {
    where.type = req.query.type;
  }
  if (req.query.entityType) {
    where.entityType = req.query.entityType;
  }
  if (req.query.transportId) {
    where.transportId = req.query.transportId;
  }
  if (req.query.mechanicId) {
    where.mechanicId = req.query.mechanicId;
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

  const [records, total] = await Promise.all([
    prisma.maintenance.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        mechanic: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.maintenance.count({ where }),
  ]);

  res.json(createPaginatedResult(records, total, page, limit));
};

export const getMaintenanceById = async (req: AuthRequest, res: Response) => {
  const record = await prisma.maintenance.findUnique({
    where: { id: req.params.id },
    include: {
      mechanic: true,
    },
  });

  if (!record) {
    throw new AppError('Maintenance record not found', 404);
  }

  res.json(record);
};

export const createMaintenance = async (req: AuthRequest, res: Response) => {
  try {
    const data = createMaintenanceSchema.parse(req.body);

    // Verify mechanic exists
    const mechanic = await prisma.user.findUnique({
      where: { id: data.mechanicId },
    });

    if (!mechanic) {
      throw new AppError('Mechanic not found', 404);
    }

    // Verify transport exists
    if (data.entityType === 'tractor') {
      const tractor = await prisma.tractor.findUnique({
        where: { id: data.transportId },
      });
      if (!tractor) throw new AppError('Tractor not found', 404);
    } else {
      const trailer = await prisma.trailer.findUnique({
        where: { id: data.transportId },
      });
      if (!trailer) throw new AppError('Trailer not found', 404);
    }

    const record = await prisma.maintenance.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
      include: {
        mechanic: true,
      },
    });

    res.status(201).json(record);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const updateMaintenance = async (req: AuthRequest, res: Response) => {
  try {
    const data = updateMaintenanceSchema.parse(req.body);

    const record = await prisma.maintenance.findUnique({
      where: { id: req.params.id },
    });

    if (!record) {
      throw new AppError('Maintenance record not found', 404);
    }

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    const updatedRecord = await prisma.maintenance.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        mechanic: true,
      },
    });

    res.json(updatedRecord);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const deleteMaintenance = async (req: AuthRequest, res: Response) => {
  const record = await prisma.maintenance.findUnique({
    where: { id: req.params.id },
  });

  if (!record) {
    throw new AppError('Maintenance record not found', 404);
  }

  await prisma.maintenance.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
};



