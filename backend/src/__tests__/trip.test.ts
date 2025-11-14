import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';

describe('Trip API', () => {
  let authToken: string;
  let testDriver: any;
  let testTractor: any;
  let testTrailer: any;

  beforeAll(async () => {
    // Create test user and login
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'dispatcher@example.com',
        password: hashedPassword,
        firstName: 'Dispatcher',
        lastName: 'User',
        role: 'dispatcher',
      },
    });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'dispatcher@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.token;

    // Create test entities
    testDriver = await prisma.driver.create({
      data: {
        firstName: 'Test',
        lastName: 'Driver',
        phone: '+1234567890',
        licenseNumber: 'DL123456',
        licenseExpiry: new Date('2025-12-31'),
      },
    });

    testTractor = await prisma.tractor.create({
      data: {
        brand: 'Test',
        model: 'Tractor',
        vin: 'TEST123456',
        plateNumber: 'TEST001',
        year: 2020,
        fuelType: 'diesel',
        consumption: 30,
      },
    });

    testTrailer = await prisma.trailer.create({
      data: {
        type: 'tent',
        model: 'Test Trailer',
        plateNumber: 'TRAILER001',
        year: 2020,
        payload: 20,
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.trip.deleteMany({});
    await prisma.driver.deleteMany({ where: { id: testDriver.id } });
    await prisma.tractor.deleteMany({ where: { id: testTractor.id } });
    await prisma.trailer.deleteMany({ where: { id: testTrailer.id } });
    await prisma.user.deleteMany({ where: { email: 'dispatcher@example.com' } });
  });

  it('should create a trip', async () => {
    const response = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        number: 'TRIP001',
        tractorId: testTractor.id,
        trailerId: testTrailer.id,
        driverId: testDriver.id,
        routeFrom: 'Moscow',
        routeTo: 'Saint Petersburg',
        departureDate: new Date().toISOString(),
        customer: 'Test Customer',
        cargoType: 'Cargo',
        weight: 10,
        ratePerTon: 1000,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.number).toBe('TRIP001');
    expect(response.body.amount).toBe(10000); // 10 * 1000
  });

  it('should get trips list', async () => {
    const response = await request(app)
      .get('/api/trips')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
  });
});



