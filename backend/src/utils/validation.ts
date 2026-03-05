import { z } from 'zod';

// User Validation Schemas
export const userRegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  first_name: z.string().min(2).max(100).optional(),
  last_name: z.string().min(2).max(100).optional(),
  role: z.enum(['buyer', 'seller', 'agent']).optional(),
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Property Validation Schemas
export const propertyCreateSchema = z.object({
  cadastral_number: z.string().min(1, 'Cadastral number is required'),
  address: z.object({
    region: z.string().min(1),
    city: z.string().min(1),
    street: z.string().min(1),
    house_number: z.string().min(1),
    building: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  building: z.object({
    build_year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
    building_type: z.enum(['brick', 'panel', 'monolith', 'block', 'wood', 'stalin', 'khrushchev']).optional(),
    floors: z.number().int().positive().optional(),
    materials: z.string().optional(),
    condition: z.enum(['excellent', 'good', 'satisfactory', 'needs_repair']).optional(),
    parking: z.enum(['underground', 'ground', 'multi_level', 'none']).optional(),
  }).optional(),
  rooms: z.number().int().positive('Rooms must be positive'),
  area: z.number().positive('Area must be positive'),
  floor: z.number().int().positive('Floor must be positive'),
  total_floors: z.number().int().positive('Total floors must be positive'),
  ceiling_height: z.number().positive().optional(),
  renovation_status: z.enum(['designer', 'euro', 'cosmetic', 'none', 'needs_renovation']).optional(),
  has_balcony: z.boolean().optional(),
  has_loggia: z.boolean().optional(),
  bathroom: z.enum(['separate', 'combined', 'multiple']).optional(),
  view_description: z.string().max(1000).optional(),
});

// Listing Validation Schemas
export const listingCreateSchema = z.object({
  property_id: z.string().uuid('Invalid property ID'),
  listing_type: z.enum(['sale', 'rent']),
  price: z.number().positive('Price must be positive').max(1_000_000_000, 'Price too high'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000).optional(),
});

export const listingUpdateSchema = z.object({
  price: z.number().positive().max(1_000_000_000).optional(),
  description: z.string().min(50).max(5000).optional(),
  status: z.enum(['active', 'sold', 'withdrawn', 'expired', 'pending']).optional(),
});

// Offer Validation Schemas
export const offerCreateSchema = z.object({
  listing_id: z.string().uuid('Invalid listing ID'),
  property_id: z.string().uuid('Invalid property ID'),
  amount: z.number().positive('Amount must be positive').max(1_000_000_000, 'Amount too high'),
  message: z.string().max(1000).optional(),
  financing_type: z.enum(['cash', 'mortgage', 'maternal_capital', 'installment']).optional(),
});

export const offerUpdateSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn']),
});

// Search Validation Schema
export const propertySearchSchema = z.object({
  city: z.string().optional(),
  districts: z.union([z.string(), z.array(z.string())]).optional().transform(val => 
    typeof val === 'string' ? [val] : val
  ),
  price_min: z.coerce.number().positive().optional(),
  price_max: z.coerce.number().positive().optional(),
  rooms: z.union([z.coerce.number(), z.array(z.coerce.number())]).optional().transform(val => 
    typeof val === 'number' ? [val] : val
  ),
  area_min: z.coerce.number().positive().optional(),
  area_max: z.coerce.number().positive().optional(),
  floor_min: z.coerce.number().int().positive().optional(),
  floor_max: z.coerce.number().int().positive().optional(),
  renovation_status: z.union([z.string(), z.array(z.string())]).optional().transform(val => 
    typeof val === 'string' ? [val] : val
  ),
  building_type: z.union([z.string(), z.array(z.string())]).optional().transform(val => 
    typeof val === 'string' ? [val] : val
  ),
  bounds: z.object({
    ne: z.object({ lat: z.coerce.number(), lng: z.coerce.number() }),
    sw: z.object({ lat: z.coerce.number(), lng: z.coerce.number() }),
  }).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort_by: z.enum(['price', 'area', 'created_at', 'liquidity']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

// Buyer Request Validation Schema
export const buyerRequestCreateSchema = z.object({
  budget_min: z.number().positive().optional(),
  budget_max: z.number().positive().optional(),
  rooms_min: z.number().int().positive().optional(),
  rooms_max: z.number().int().positive().optional(),
  area_min: z.number().positive().optional(),
  area_max: z.number().positive().optional(),
  districts: z.array(z.string()).optional(),
  requirements: z.string().max(2000).optional(),
  financing_status: z.enum(['approved_mortgage', 'cash', 'pending', 'maternal_capital']).optional(),
});

/**
 * Middleware для валидации данных
 */
export function validateBody(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}

/**
 * Middleware для валидации query параметров
 */
export function validateQuery(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      const parsed = schema.parse(req.query);
      // Создаем новый объект вместо изменения req.query
      req.validatedQuery = parsed;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}
