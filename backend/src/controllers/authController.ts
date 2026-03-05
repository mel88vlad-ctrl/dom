import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { verifyPassword, generateToken } from '../utils/auth';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { UserCreateInput, UserLoginInput } from '../types';

/**
 * Регистрация нового пользователя
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const data: UserCreateInput = req.body;

  // Проверка существования email
  const emailExists = await UserModel.emailExists(data.email);
  if (emailExists) {
    throw new AppError(409, 'Email already registered');
  }

  // Создание пользователя
  const user = await UserModel.create(data);

  // Генерация токена
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Удаляем пароль из ответа
  const { password_hash, ...userWithoutPassword } = user;

  res.status(201).json({
    success: true,
    data: {
      user: userWithoutPassword,
      token,
    },
    message: 'User registered successfully',
  });
});

/**
 * Вход пользователя
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: UserLoginInput = req.body;

  // Поиск пользователя
  const user = await UserModel.findByEmail(email);
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  // Проверка активности
  if (!user.is_active) {
    throw new AppError(403, 'Account is deactivated');
  }

  // Проверка пароля
  const isPasswordValid = await verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password');
  }

  // Обновление последнего входа
  await UserModel.updateLastLogin(user.id);

  // Генерация токена
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Удаляем пароль из ответа
  const { password_hash, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      token,
    },
    message: 'Login successful',
  });
});

/**
 * Получить текущего пользователя
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Not authenticated');
  }

  const user = await UserModel.findById(req.user.userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const { password_hash, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: userWithoutPassword,
  });
});

/**
 * Обновить профиль
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Not authenticated');
  }

  const allowedFields = ['first_name', 'last_name', 'phone', 'avatar_url'];
  const updateData: any = {};

  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  });

  const updatedUser = await UserModel.update(req.user.userId, updateData);
  if (!updatedUser) {
    throw new AppError(404, 'User not found');
  }

  const { password_hash, ...userWithoutPassword } = updatedUser;

  res.json({
    success: true,
    data: userWithoutPassword,
    message: 'Profile updated successfully',
  });
});

/**
 * Выход (на клиенте просто удаляется токен)
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logout successful',
  });
});
