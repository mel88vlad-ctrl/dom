import { Router } from 'express';
import {
  createOffer,
  getPropertyOffers,
  getBuyerOffers,
  getOfferById,
  acceptOffer,
  rejectOffer,
  withdrawOffer,
} from '../controllers/offerController';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { validateBody } from '../utils/validation';
import { offerCreateSchema } from '../utils/validation';
import { offerLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * @route   POST /api/offers
 * @desc    Create new offer
 * @access  Private (buyer)
 */
router.post(
  '/',
  requireAuth,
  offerLimiter,
  validateBody(offerCreateSchema),
  createOffer
);

/**
 * @route   GET /api/offers/my
 * @desc    Get current user's offers
 * @access  Private
 */
router.get('/my', requireAuth, getBuyerOffers);

/**
 * @route   GET /api/offers/property/:propertyId
 * @desc    Get offers for a property (Order Book)
 * @access  Public
 */
router.get('/property/:propertyId', optionalAuth, getPropertyOffers);

/**
 * @route   GET /api/offers/:id
 * @desc    Get offer by ID
 * @access  Private
 */
router.get('/:id', requireAuth, getOfferById);

/**
 * @route   POST /api/offers/:id/accept
 * @desc    Accept offer
 * @access  Private (property owner)
 */
router.post('/:id/accept', requireAuth, acceptOffer);

/**
 * @route   POST /api/offers/:id/reject
 * @desc    Reject offer
 * @access  Private (property owner)
 */
router.post('/:id/reject', requireAuth, rejectOffer);

/**
 * @route   POST /api/offers/:id/withdraw
 * @desc    Withdraw offer
 * @access  Private (buyer)
 */
router.post('/:id/withdraw', requireAuth, withdrawOffer);

export default router;
