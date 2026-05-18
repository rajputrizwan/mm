import express, { Express, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
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
import searchRoutes from './routes/searchRoutes';
import interviewTemplateRoutes from './routes/interviewTemplates';
import interviewSessionRoutes from './routes/interviewSession';
import interviewFeedbackRoutes from './routes/interviewFeedback';
import mockInterviewRoutes from './routes/mockInterview';
import bugReportRoutes from './routes/bugReports';
import { setupEngagementSocket } from './sockets/engagementSocket';

// ─── Global process-level error guards ───────────────────────────────────────
// These prevent the Node.js process from dying silently on any uncaught error
// or unhandled promise rejection anywhere in the app.

process.on('uncaughtException', (error: Error) => {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('💥 UNCAUGHT EXCEPTION — process will exit');
  console.error('  Error:', error.message);
  console.error('  Stack:', error.stack);
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  // Give the log a moment to flush before exiting
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('💥 UNHANDLED PROMISE REJECTION');
  console.error('  Reason:', reason);
  console.error('  Promise:', promise);
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  // Do NOT exit here — log and continue so the server stays alive for other requests.
  // Upgrade to exit(1) once all known unhandled rejections are fixed.
});

// ─── DB health state ──────────────────────────────────────────────────────────
// Tracked separately so the /health endpoint can report the real state without
// making a DB round-trip on every check.
let dbHealthy = false;

const app: Express = express();
const server = http.createServer(app);

// Enforce a 30-second hard timeout on every HTTP request.
// Prevents hung OpenRouter / MongoDB calls from holding connections open forever.
server.timeout = 30_000;
server.keepAliveTimeout = 65_000; // slightly above typical load-balancer timeout

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [config.frontendUrl, config.frontendProdUrl],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [config.frontendUrl, config.frontendProdUrl],
    credentials: true,
  })
);
app.use(cookieParser());
// morgan 'combined' includes response time in :response-time token
app.use(morgan(':method :url :status :response-time ms — :res[content-length] bytes'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─── Database ─────────────────────────────────────────────────────────────────
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    dbHealthy = true;
    console.log('✓ Database connected successfully');
  } catch (error) {
    dbHealthy = false;
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
};

// Monitor MongoDB connection health after startup so the /health endpoint
// always reflects the real state and DB errors are immediately visible in logs.
mongoose.connection.on('disconnected', () => {
  dbHealthy = false;
  console.error('⚠️  MongoDB disconnected — attempting to reconnect…');
});
mongoose.connection.on('reconnected', () => {
  dbHealthy = true;
  console.log('✓ MongoDB reconnected');
});
mongoose.connection.on('error', (err) => {
  dbHealthy = false;
  console.error('❌ MongoDB connection error:', err);
});

// ─── Health checks ────────────────────────────────────────────────────────────
// Both paths are kept to avoid breaking existing consumers.
const healthHandler = (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbStateLabel = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] ?? 'unknown';

  const status = dbHealthy ? 'healthy' : 'degraded';
  res.status(dbHealthy ? 200 : 503).json({
    success: dbHealthy,
    status,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    services: {
      api: 'running',
      database: dbStateLabel,
    },
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// ─── Routes ───────────────────────────────────────────────────────────────────
// Mount more specific paths first so /api/interviews/mock-interviews/* is not
// caught by /api/interviews
app.use('/api/auth', authRoutes);
app.use('/api/interviews/mock-interviews', mockInterviewRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/interview-templates', interviewTemplateRoutes);
app.use('/api/interview-session', interviewSessionRoutes);
app.use('/api/interview-feedback', interviewFeedbackRoutes);
app.use('/api/bug-reports', bugReportRoutes);

app.get('/api', (_req: Request, res: Response) => {
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
      search: '/api/search',
      interviewTemplates: '/api/interview-templates',
      interviewSession: '/api/interview-session',
      interviewFeedback: '/api/interview-feedback',
      mockInterviews: '/api/interviews/mock-interviews',
      bugReports: '/api/bug-reports',
      health: '/api/health',
    },
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// ─── Centralised Express Error Handler ───────────────────────────────────────
app.use(errorHandler);

// ─── WebSocket ────────────────────────────────────────────────────────────────
setupEngagementSocket(io);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = config.port || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check:      http://localhost:${PORT}/api/health`);
      console.log(`🔌 WebSocket ready for engagement tracking`);
      console.log(`🔧 Environment: ${config.nodeEnv}`);
      console.log(`⏱️  Request timeout: ${server.timeout / 1000}s`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
