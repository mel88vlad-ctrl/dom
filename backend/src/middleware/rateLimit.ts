import rateLimit from 'express-rate-limit';

/**
 * Общий rate limiter для API
 */
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 минут
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Строгий лимит для создания офферов
 */
export const offerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 10, // 10 офферов в час
  message: {
    success: false,
    error: 'Too many offers',
    message: 'You can create maximum 10 offers per hour',
  },
  skipSuccessfulRequests: false,
});

/**
 * Лимит для регистрации
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 5, // 5 регистраций с одного IP
  message: {
    success: false,
    error: 'Too many registration attempts',
    message: 'Please try again later',
  },
});

/**
 * Лимит для входа
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // 5 попыток входа
  message: {
    success: false,
    error: 'Too many login attempts',
    message: 'Please try again after 15 minutes',
  },
  skipSuccessfulRequests: true,
});
