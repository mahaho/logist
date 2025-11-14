import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getPaginationParams, createPaginatedResult } from '../utils/pagination';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['admin', 'dispatcher', 'accountant', 'mechanic']),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['admin', 'dispatcher', 'accountant', 'mechanic']).optional(),
});

export const getUsers = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);

  const where: any = {};
  if (req.query.role) {
    where.role = req.query.role;
  }
  if (req.query.search) {
    where.OR = [
      { firstName: { contains: req.query.search as string, mode: 'insensitive' } },
      { lastName: { contains: req.query.search as string, mode: 'insensitive' } },
      { email: { contains: req.query.search as string, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json(createPaginatedResult(users, total, page, limit));
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json(user);
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const data = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const data = updateUserSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  await prisma.user.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
};



