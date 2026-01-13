import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { verifyJWT, resolveBusinessContext, requireManager } from './middleware';
import { AuthRequest } from './types/auth';

/**
 * Creates and configures the Express application
 * @returns Configured Express app
 */
export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'suppli-api',
    });
  });

  // API routes will be added here
  app.get('/api/v1', (_req: Request, res: Response) => {
    res.json({
      message: 'Suppli API v1',
      version: '0.1.0',
    });
  });

  // Protected test endpoint (for testing auth middleware)
  app.get(
    '/api/v1/test-auth',
    verifyJWT,
    resolveBusinessContext,
    requireManager,
    (req: Request, res: Response) => {
      const authReq = req as AuthRequest;
      res.json({
        message: 'Authentication successful',
        userId: authReq.userId,
        businessId: authReq.businessId,
        role: authReq.role,
      });
    }
  );

  // Error handling middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    // Handle AppError instances (custom errors with status codes)
    if ('statusCode' in err && 'code' in err) {
      const appError = err as { statusCode: number; code: string; message: string };
      return res.status(appError.statusCode).json({
        error: {
          code: appError.code,
          message: appError.message,
        },
      });
    }

    // Handle unexpected errors
    console.error('Error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      },
    });
  });

  return app;
}
