import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { config } from './config/environment';
import { errorHandler } from './utils/errors';
import authRoutes from './routes/auth';
import interviewRoutes from './routes/interviews';
import candidateRoutes from './routes/candidates';
import positionRoutes from './routes/positions';
import contactRoutes from './routes/contact';
import dashboardRoutes from './routes/dashboard';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [config.frontendUrl, config.frontendProdUrl],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('✓ Database connected successfully');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
};

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Intervau.AI Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      interviews: '/api/interviews',
      candidates: '/api/candidates',
      positions: '/api/positions',
      contact: '/api/contact',
      dashboard: '/api/dashboard',
      health: '/api/health',
    },
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error Handler
app.use(errorHandler);

// Start Server
const PORT = config.port || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
      console.log(`🔧 Environment: ${config.nodeEnv}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
