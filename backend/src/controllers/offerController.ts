import { Request, Response } from 'express';
import { OfferModel } from '../models/Offer';
import { ListingModel } from '../models/Listing';
import { PropertyModel } from '../models/Property';
import { AppError, asyncHandler } from '../middleware/errorHandler';

/**
 * Создать оффер
 */
export const createOffer = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const { listing_id, property_id, amount } = req.body;

  // Проверка существования листинга
  const listing = await ListingModel.findById(listing_id);
  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }

  if (listing.status !== 'active') {
    throw new AppError(400, 'Listing is not active');
  }

  // Проверка существования объекта
  const property = await PropertyModel.findById(property_id);
  if (!property) {
    throw new AppError(404, 'Property not found');
  }

  // Проверка, что покупатель не делает оффер на свой объект
  if (property.owner_id === req.user.userId) {
    throw new AppError(400, 'Cannot make offer on your own property');
  }

  // Проверка наличия активного оффера
  const hasActiveOffer = await OfferModel.hasActiveOffer(
    req.user.userId,
    property_id
  );
  if (hasActiveOffer) {
    throw new AppError(409, 'You already have an active offer on this property');
  }

  // Создание оффера
  const offer = await OfferModel.create(req.body, req.user.userId);

  res.status(201).json({
    success: true,
    data: offer,
    message: 'Offer created successfully',
  });
});

/**
 * Получить офферы по объекту (Order Book)
 */
export const getPropertyOffers = asyncHandler(async (req: Request, res: Response) => {
  const { propertyId } = req.params;

  const offers = await OfferModel.findByPropertyId(String(propertyId));
  const stats = await OfferModel.getPropertyOfferStats(String(propertyId));

  res.json({
    success: true,
    data: {
      offers,
      stats,
    },
  });
});

/**
 * Получить офферы покупателя
 */
export const getBuyerOffers = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

  const { offers, total } = await OfferModel.findByBuyerId(
    req.user.userId,
    page,
    limit
  );

  res.json({
    success: true,
    data: offers,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Получить оффер по ID
 */
export const getOfferById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const offer = await OfferModel.findById(String(id));
  if (!offer) {
    throw new AppError(404, 'Offer not found');
  }

  res.json({
    success: true,
    data: offer,
  });
});

/**
 * Принять оффер (владелец)
 */
export const acceptOffer = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const { id } = req.params;

  const offer = await OfferModel.findById(String(id));
  if (!offer) {
    throw new AppError(404, 'Offer not found');
  }

  if (offer.status !== 'pending') {
    throw new AppError(400, 'Offer is not pending');
  }

  // TODO: Проверка прав (только владелец объекта)

  const updatedOffer = await OfferModel.accept(String(id));

  res.json({
    success: true,
    data: updatedOffer,
    message: 'Offer accepted',
  });
});

/**
 * Отклонить оффер (владелец)
 */
export const rejectOffer = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const { id } = req.params;

  const offer = await OfferModel.findById(String(id));
  if (!offer) {
    throw new AppError(404, 'Offer not found');
  }

  if (offer.status !== 'pending') {
    throw new AppError(400, 'Offer is not pending');
  }

  // TODO: Проверка прав (только владелец объекта)

  const updatedOffer = await OfferModel.reject(String(id));

  res.json({
    success: true,
    data: updatedOffer,
    message: 'Offer rejected',
  });
});

/**
 * Отозвать оффер (покупатель)
 */
export const withdrawOffer = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const { id } = req.params;

  const offer = await OfferModel.findById(String(id));
  if (!offer) {
    throw new AppError(404, 'Offer not found');
  }

  if (offer.buyer_id !== req.user.userId) {
    throw new AppError(403, 'Not authorized to withdraw this offer');
  }

  if (offer.status !== 'pending') {
    throw new AppError(400, 'Offer is not pending');
  }

  const updatedOffer = await OfferModel.withdraw(String(id), req.user.userId);

  res.json({
    success: true,
    data: updatedOffer,
    message: 'Offer withdrawn',
  });
});
