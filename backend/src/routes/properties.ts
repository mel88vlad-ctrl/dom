import { Router } from 'express';
import {
  createProperty,
  getPropertyById,
  getPropertyByCadastral,
  searchProperties,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { validateBody, validateQuery } from '../utils/validation';
import { propertyCreateSchema, propertySearchSchema } from '../utils/validation';

const router = Router();

/**
 * @route   POST /api/properties
 * @desc    Create new property
 * @access  Private (seller, agent, admin)
 */
router.post(
  '/',
  requireAuth,
  validateBody(propertyCreateSchema),
  createProperty
);

/**
 * @route   GET /api/properties/search
 * @desc    Search properties with filters
 * @access  Public
 */
router.get(
  '/search',
  optionalAuth,
  validateQuery(propertySearchSchema),
  searchProperties
);

/**
 * @route   GET /api/properties/cadastral/:cadastralNumber
 * @desc    Get property by cadastral number
 * @access  Public
 */
router.get('/cadastral/:cadastralNumber', optionalAuth, getPropertyByCadastral);

/**
 * @route   GET /api/properties/:id
 * @desc    Get property by ID
 * @access  Public
 */
router.get('/:id', optionalAuth, getPropertyById);

/**
 * @route   PATCH /api/properties/:id
 * @desc    Update property
 * @access  Private (owner, admin)
 */
router.patch('/:id', requireAuth, updateProperty);

/**
 * @route   DELETE /api/properties/:id
 * @desc    Delete property
 * @access  Private (owner, admin)
 */
router.delete('/:id', requireAuth, deleteProperty);

export default router;
