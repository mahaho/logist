import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import driverRoutes from './routes/drivers';
import tractorRoutes from './routes/tractors';
import trailerRoutes from './routes/trailers';
import couplingRoutes from './routes/couplings';
import tripRoutes from './routes/trips';
import maintenanceRoutes from './routes/maintenance';
import documentRoutes from './routes/documents';
import financeRoutes from './routes/finance';
import reportRoutes from './routes/reports';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/tractors', tractorRoutes);
app.use('/api/trailers', trailerRoutes);
app.use('/api/couplings', couplingRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;

