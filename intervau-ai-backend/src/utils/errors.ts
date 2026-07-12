import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralised Express error-handling middleware.
 *
 * Previously this middleware returned an error response but never logged it,
 * making silent 500s completely invisible in logs. Now every error is logged
 * with full context before the response is sent.
 */
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Always log — production gets the summary, development gets the full stack.
  const logPrefix = statusCode >= 500 ? '❌' : '⚠️ ';
  console.error(
    `${logPrefix} [ErrorHandler] ${req.method} ${req.path} → ${statusCode}: ${message}`
  );
  if (err.stack) {
    console.error('   Stack:', err.stack);
  }

  // Avoid logging sensitive bodies but include size for debugging
  const bodySize = req.headers['content-length'] ?? 'unknown';
  console.error(
    `   Request body size: ${bodySize} bytes | User-Agent: ${req.headers['user-agent'] ?? 'unknown'}`
  );

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
