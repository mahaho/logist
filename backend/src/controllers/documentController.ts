import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getPaginationParams, createPaginatedResult } from '../utils/pagination';
import path from 'path';
import fs from 'fs';

const createDocumentSchema = z.object({
  type: z.enum([
    'driver_license',
    'medical_certificate',
    'passport',
    'driver_insurance',
    'sts',
    'pts',
    'transport_insurance',
    'diagnostic_card',
    'service_book',
    'certificate',
    'contract',
    'ttn',
    'waybill',
    'act',
    'attachment',
  ]),
  entityType: z.enum(['tractor', 'trailer', 'driver', 'trip']),
  entityId: z.string().uuid(),
  number: z.string().optional(),
  issueDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  description: z.string().optional(),
});

const updateDocumentSchema = createDocumentSchema.partial();

export const getDocuments = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);

  const where: any = {};
  if (req.query.type) {
    where.type = req.query.type;
  }
  if (req.query.entityType) {
    where.entityType = req.query.entityType;
  }
  if (req.query.entityId) {
    where.entityId = req.query.entityId;
  }
  if (req.query.expiring) {
    const days = parseInt(req.query.expiring as string) || 30;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    where.expiryDate = { lte: expiryDate, gte: new Date() };
  }
  if (req.query.expired) {
    where.expiryDate = { lt: new Date() };
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.document.count({ where }),
  ]);

  res.json(createPaginatedResult(documents, total, page, limit));
};

export const getDocumentById = async (req: AuthRequest, res: Response) => {
  const document = await prisma.document.findUnique({
    where: { id: req.params.id },
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  res.json(document);
};

export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const data = createDocumentSchema.parse(req.body);

    if (!req.file) {
      throw new AppError('File is required', 400);
    }

    // Verify entity exists
    if (data.entityType === 'driver') {
      const driver = await prisma.driver.findUnique({ where: { id: data.entityId } });
      if (!driver) throw new AppError('Driver not found', 404);
    } else if (data.entityType === 'tractor') {
      const tractor = await prisma.tractor.findUnique({ where: { id: data.entityId } });
      if (!tractor) throw new AppError('Tractor not found', 404);
    } else if (data.entityType === 'trailer') {
      const trailer = await prisma.trailer.findUnique({ where: { id: data.entityId } });
      if (!trailer) throw new AppError('Trailer not found', 404);
    } else if (data.entityType === 'trip') {
      const trip = await prisma.trip.findUnique({ where: { id: data.entityId } });
      if (!trip) throw new AppError('Trip not found', 404);
    }

    const document = await prisma.document.create({
      data: {
        ...data,
        filePath: req.file.path,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        issueDate: data.issueDate ? new Date(data.issueDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    });

    res.status(201).json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const updateDocument = async (req: AuthRequest, res: Response) => {
  try {
    const data = updateDocumentSchema.parse(req.body);

    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    const updateData: any = { ...data };
    if (data.issueDate) {
      updateData.issueDate = new Date(data.issueDate);
    }
    if (data.expiryDate) {
      updateData.expiryDate = new Date(data.expiryDate);
    }
    if (req.file) {
      // Delete old file
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
      updateData.filePath = req.file.path;
      updateData.fileName = req.file.originalname;
      updateData.mimeType = req.file.mimetype;
      updateData.size = req.file.size;
    }

    const updatedDocument = await prisma.document.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(updatedDocument);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  const document = await prisma.document.findUnique({
    where: { id: req.params.id },
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  // Delete file
  if (fs.existsSync(document.filePath)) {
    fs.unlinkSync(document.filePath);
  }

  await prisma.document.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
};

export const downloadDocument = async (req: AuthRequest, res: Response) => {
  const document = await prisma.document.findUnique({
    where: { id: req.params.id },
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  if (!fs.existsSync(document.filePath)) {
    throw new AppError('File not found', 404);
  }

  res.download(document.filePath, document.fileName);
};



