import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractToken } from '../utils/auth';
import { JWTPayload, UserRole } from '../types';

// Расширяем тип Request
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      validatedQuery?: any;
    }
  }
}

/**
 * Middleware для проверки аутентификации
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No token provided',
      });
      return;
    }

    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Invalid token',
    });
  }
}

/**
 * Middleware для проверки роли пользователя
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Required role: ${roles.join(' or ')}`,
      });
      return;
    }

    next();
  };
}

/**
 * Опциональная аутентификация (не требует токен, но если есть - проверяет)
 */
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (token) {
      const payload = verifyToken(token);
      req.user = payload;
    }
    
    next();
  } catch (error) {
    // Игнорируем ошибки для опциональной аутентификации
    next();
  }
}
