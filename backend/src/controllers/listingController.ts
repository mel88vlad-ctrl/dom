import { Request, Response } from 'express';
import { ListingModel } from '../models/Listing';
import { PropertyModel } from '../models/Property';
import { AppError, asyncHandler } from '../middleware/errorHandler';

/**
 * Создать листинг
 */
export const createListing = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const { property_id } = req.body;

  // Проверка существования объекта
  const property = await PropertyModel.findById(property_id);
  if (!property) {
    throw new AppError(404, 'Property not found');
  }

  // TODO: Проверка прав (только владелец или агент)

  const listing = await ListingModel.create(req.body, req.user.userId);

  res.status(201).json({
    success: true,
    data: listing,
    message: 'Listing created successfully',
  });
});

/**
 * Получить листинг по ID
 */
export const getListingById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const listing = await ListingModel.findById(String(id));
  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }

  // Увеличить счетчик просмотров
  await ListingModel.incrementViews(String(id));

  res.json({
    success: true,
    data: listing,
  });
});

/**
 * Получить листинги объекта
 */
export const getPropertyListings = asyncHandler(async (req: Request, res: Response) => {
  const { propertyId } = req.params;

  const listings = await ListingModel.findByPropertyId(String(propertyId));

  res.json({
    success: true,
    data: listings,
  });
});

/**
 * Получить листинги агента
 */
export const getAgentListings = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

  const { listings, total } = await ListingModel.findByAgentId(
    req.user.userId,
    page,
    limit
  );

  res.json({
    success: true,
    data: listings,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Обновить листинг
 */
export const updateListing = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const { id } = req.params;

  const listing = await ListingModel.findById(String(id));
  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }

  // TODO: Проверка прав (только создатель или админ)

  const updatedListing = await ListingModel.update(String(id), req.body);

  res.json({
    success: true,
    data: updatedListing,
    message: 'Listing updated successfully',
  });
});

/**
 * Отметить как проданный
 */
export const markAsSold = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const { id } = req.params;

  const listing = await ListingModel.findById(String(id));
  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }

  // TODO: Проверка прав

  const updatedListing = await ListingModel.markAsSold(String(id));

  res.json({
    success: true,
    data: updatedListing,
    message: 'Listing marked as sold',
  });
});

/**
 * Снять с публикации
 */
export const withdrawListing = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const { id } = req.params;

  const listing = await ListingModel.findById(String(id));
  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }

  // TODO: Проверка прав

  const updatedListing = await ListingModel.withdraw(String(id));

  res.json({
    success: true,
    data: updatedListing,
    message: 'Listing withdrawn',
  });
});

/**
 * Удалить листинг
 */
export const deleteListing = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const { id } = req.params;

  const listing = await ListingModel.findById(String(id));
  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }

  // TODO: Проверка прав

  await ListingModel.delete(String(id));

  res.json({
    success: true,
    message: 'Listing deleted successfully',
  });
});
