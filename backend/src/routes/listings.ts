import { Router } from 'express';
import {
  createListing,
  getListingById,
  getPropertyListings,
  getAgentListings,
  updateListing,
  markAsSold,
  withdrawListing,
  deleteListing,
} from '../controllers/listingController';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { validateBody } from '../utils/validation';
import { listingCreateSchema, listingUpdateSchema } from '../utils/validation';

const router = Router();

/**
 * @route   POST /api/listings
 * @desc    Create new listing
 * @access  Private (seller, agent)
 */
router.post(
  '/',
  requireAuth,
  validateBody(listingCreateSchema),
  createListing
);

/**
 * @route   GET /api/listings/my
 * @desc    Get current user's listings
 * @access  Private
 */
router.get('/my', requireAuth, getAgentListings);

/**
 * @route   GET /api/listings/property/:propertyId
 * @desc    Get listings for a property
 * @access  Public
 */
router.get('/property/:propertyId', optionalAuth, getPropertyListings);

/**
 * @route   GET /api/listings/:id
 * @desc    Get listing by ID
 * @access  Public
 */
router.get('/:id', optionalAuth, getListingById);

/**
 * @route   PATCH /api/listings/:id
 * @desc    Update listing
 * @access  Private (owner, admin)
 */
router.patch(
  '/:id',
  requireAuth,
  validateBody(listingUpdateSchema),
  updateListing
);

/**
 * @route   POST /api/listings/:id/sold
 * @desc    Mark listing as sold
 * @access  Private (owner, admin)
 */
router.post('/:id/sold', requireAuth, markAsSold);

/**
 * @route   POST /api/listings/:id/withdraw
 * @desc    Withdraw listing
 * @access  Private (owner, admin)
 */
router.post('/:id/withdraw', requireAuth, withdrawListing);

/**
 * @route   DELETE /api/listings/:id
 * @desc    Delete listing
 * @access  Private (owner, admin)
 */
router.delete('/:id', requireAuth, deleteListing);

export default router;
