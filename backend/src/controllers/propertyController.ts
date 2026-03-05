import { Request, Response } from 'express';
import { PropertyModel } from '../models/Property';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { PropertySearchParams } from '../types';

/**
 * Создать объект недвижимости
 */
export const createProperty = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const property = await PropertyModel.create(req.body);

  res.status(201).json({
    success: true,
    data: property,
    message: 'Property created successfully',
  });
});

/**
 * Получить объект по ID
 */
export const getPropertyById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const property = await PropertyModel.findById(String(id));
  if (!property) {
    throw new AppError(404, 'Property not found');
  }

  res.json({
    success: true,
    data: property,
  });
});

/**
 * Получить объект по кадастровому номеру
 */
export const getPropertyByCadastral = asyncHandler(async (req: Request, res: Response) => {
  const { cadastralNumber } = req.params;

  const property = await PropertyModel.findByCadastralNumber(String(cadastralNumber));
  if (!property) {
    throw new AppError(404, 'Property not found');
  }

  res.json({
    success: true,
    data: property,
  });
});

/**
 * Поиск объектов с фильтрами
 */
export const searchProperties = asyncHandler(async (req: Request, res: Response) => {
  const params: PropertySearchParams = req.validatedQuery || req.query as any || {};

  const { properties, total } = await PropertyModel.search(params);

  const totalPages = Math.ceil(total / params.limit!);

  res.json({
    success: true,
    data: properties,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      total_pages: totalPages,
    },
  });
});

/**
 * Обновить объект
 */
export const updateProperty = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const { id } = req.params;

  // Проверка существования
  const existingProperty = await PropertyModel.findById(String(id));
  if (!existingProperty) {
    throw new AppError(404, 'Property not found');
  }

  // TODO: Проверка прав (только владелец или админ)

  const updatedProperty = await PropertyModel.update(String(id), req.body);

  res.json({
    success: true,
    data: updatedProperty,
    message: 'Property updated successfully',
  });
});

/**
 * Удалить объект
 */
export const deleteProperty = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const { id } = req.params;

  // Проверка существования
  const property = await PropertyModel.findById(String(id));
  if (!property) {
    throw new AppError(404, 'Property not found');
  }

  // TODO: Проверка прав (только владелец или админ)

  await PropertyModel.delete(String(id));

  res.json({
    success: true,
    message: 'Property deleted successfully',
  });
});
