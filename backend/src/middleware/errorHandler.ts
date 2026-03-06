import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Глобальный обработчик ошибок
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // PostgreSQL ошибки
  if ('code' in err) {
    const pgError = err as any;
    
    // Unique constraint violation
    if (pgError.code === '23505') {
      res.status(409).json({
        success: false,
        error: 'Resource already exists',
        message: 'Duplicate entry',
      });
      return;
    }

    // Foreign key violation
    if (pgError.code === '23503') {
      res.status(400).json({
        success: false,
        error: 'Invalid reference',
        message: 'Referenced resource does not exist',
      });
      return;
    }

    // Not null violation
    if (pgError.code === '23502') {
      res.status(400).json({
        success: false,
        error: 'Missing required field',
        message: pgError.message,
      });
      return;
    }
  }

  // Общая ошибка сервера
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
}

/**
 * Обработчик для несуществующих роутов
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.url} not found`,
  });
}

/**
 * Async wrapper для обработки ошибок в async функциях
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
