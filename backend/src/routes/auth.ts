import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  logout,
} from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../utils/validation';
import { userRegisterSchema, userLoginSchema } from '../utils/validation';
import { registerLimiter, loginLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  registerLimiter,
  validateBody(userRegisterSchema),
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter,
  validateBody(userLoginSchema),
  login
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', requireAuth, getCurrentUser);

/**
 * @route   PATCH /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.patch('/profile', requireAuth, updateProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', requireAuth, logout);

export default router;
