import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { verifyJWT, resolveBusinessContext, requireManager, validateBody } from './middleware';
import { AuthRequest } from './types/auth';
import { sendSuccess } from './lib/response';
import ordersRoutes from './routes/orders.routes';
import paymentsRoutes from './routes/payments.routes';
import onboardingRoutes from './routes/onboarding.routes';
import { handleStripeWebhook } from './controllers/payments.controller';

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

  // Stripe webhook requires raw body for signature verification
  app.post(
    '/api/v1/webhooks/stripe',
    express.raw({ type: 'application/json' }),
    handleStripeWebhook
  );

  // Body parsing middleware (after webhook raw handler)
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

  // API routes
  app.get('/api/v1', (_req: Request, res: Response) => {
    res.json({
      message: 'Suppli API v1',
      version: '0.1.0',
    });
  });

  // Orders routes
  app.use('/api/v1/orders', ordersRoutes);
  // Payments routes
  app.use('/api/v1/payments', paymentsRoutes);
  // Onboarding routes
  app.use('/api/v1/onboarding', onboardingRoutes);

  // Protected test endpoint (for testing auth middleware)
  app.get(
    '/api/v1/test-auth',
    verifyJWT,
    resolveBusinessContext,
    requireManager,
    (req: Request, res: Response) => {
      const authReq = req as AuthRequest;
      sendSuccess(res, {
        message: 'Authentication successful',
        userId: authReq.userId,
        businessId: authReq.businessId,
        role: authReq.role,
      });
    }
  );

  // Test validation endpoint (for testing validation middleware)
  app.post(
    '/api/v1/test-validation',
    validateBody(
      z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email format'),
        age: z.number().int().min(0).max(120).optional(),
      })
    ),
    (req: Request, res: Response) => {
      sendSuccess(res, {
        message: 'Validation successful',
        received: req.body,
      });
    }
  );

  // Error handling middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    // Handle AppError instances (custom errors with status codes)
    if ('statusCode' in err && 'code' in err) {
      const appError = err as { statusCode: number; code: string; message: string };
      res.status(appError.statusCode).json({
        error: {
          code: appError.code,
          message: appError.message,
        },
      });
      return;
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
