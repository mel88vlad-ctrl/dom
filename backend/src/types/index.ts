// User Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export type UserRole = 'buyer' | 'seller' | 'agent' | 'agency' | 'developer' | 'admin';

export interface UserCreateInput {
  email: string;
  password: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

// Address Types
export interface Address {
  id: string;
  region: string;
  city: string;
  street: string;
  house_number: string;
  building?: string;
  lat?: number;
  lng?: number;
  full_address?: string;
  created_at: Date;
  updated_at: Date;
}

// Building Types
export interface Building {
  id: string;
  address_id: string;
  build_year?: number;
  building_type?: BuildingType;
  floors?: number;
  materials?: string;
  condition?: BuildingCondition;
  parking?: ParkingType;
  elevator_count: number;
  has_passenger_elevator: boolean;
  has_cargo_elevator: boolean;
  managing_company?: string;
  rating?: number;
  rating_count: number;
  created_at: Date;
  updated_at: Date;
}

export type BuildingType = 'brick' | 'panel' | 'monolith' | 'block' | 'wood' | 'stalin' | 'khrushchev';
export type BuildingCondition = 'excellent' | 'good' | 'satisfactory' | 'needs_repair';
export type ParkingType = 'underground' | 'ground' | 'multi_level' | 'none';

// Property Types
export interface Property {
  id: string;
  cadastral_number: string;
  address_id: string;
  building_id: string;
  owner_id?: string;
  rooms: number;
  area: number;
  floor: number;
  total_floors: number;
  ceiling_height?: number;
  renovation_status?: RenovationStatus;
  has_balcony: boolean;
  has_loggia: boolean;
  bathroom?: BathroomType;
  view_description?: string;
  liquidity_score: number;
  estimated_price?: number;
  price_per_sqm?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type RenovationStatus = 'designer' | 'euro' | 'cosmetic' | 'none' | 'needs_renovation';
export type BathroomType = 'separate' | 'combined' | 'multiple';

export interface PropertyWithDetails extends Property {
  address: Address;
  building: Building;
  photos: PropertyPhoto[];
  current_listing?: Listing;
  offers_count?: number;
  top_offer?: number;
}

// Listing Types
export interface Listing {
  id: string;
  property_id: string;
  agent_id?: string;
  listing_type: ListingType;
  price: number;
  status: ListingStatus;
  description?: string;
  is_featured: boolean;
  views_count: number;
  created_at: Date;
  updated_at: Date;
  expires_at?: Date;
  sold_at?: Date;
}

export type ListingType = 'sale' | 'rent';
export type ListingStatus = 'active' | 'sold' | 'withdrawn' | 'expired' | 'pending';

export interface ListingCreateInput {
  property_id: string;
  listing_type: ListingType;
  price: number;
  description?: string;
}

// Offer Types
export interface Offer {
  id: string;
  listing_id: string;
  property_id: string;
  buyer_id: string;
  amount: number;
  status: OfferStatus;
  message?: string;
  financing_type?: FinancingType;
  created_at: Date;
  updated_at: Date;
  expires_at?: Date;
  responded_at?: Date;
}

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
export type FinancingType = 'cash' | 'mortgage' | 'maternal_capital' | 'installment';

export interface OfferCreateInput {
  listing_id: string;
  property_id: string;
  amount: number;
  message?: string;
  financing_type?: FinancingType;
}

// Buyer Request Types
export interface BuyerRequest {
  id: string;
  buyer_id: string;
  budget_min?: number;
  budget_max?: number;
  rooms_min?: number;
  rooms_max?: number;
  area_min?: number;
  area_max?: number;
  districts?: string[];
  requirements?: string;
  financing_status?: string;
  status: RequestStatus;
  created_at: Date;
  updated_at: Date;
}

export type RequestStatus = 'active' | 'paused' | 'closed' | 'fulfilled';

// Photo Types
export interface PropertyPhoto {
  id: string;
  property_id: string;
  url: string;
  thumbnail_url?: string;
  order_index: number;
  is_main: boolean;
  uploaded_at: Date;
}

// Search & Filter Types
export interface PropertySearchParams {
  city?: string;
  districts?: string[];
  price_min?: number;
  price_max?: number;
  rooms?: number[];
  area_min?: number;
  area_max?: number;
  floor_min?: number;
  floor_max?: number;
  renovation_status?: RenovationStatus[];
  building_type?: BuildingType[];
  bounds?: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  };
  page?: number;
  limit?: number;
  sort_by?: 'price' | 'area' | 'created_at' | 'liquidity';
  sort_order?: 'asc' | 'desc';
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Request with User
export interface AuthRequest extends Request {
  user?: JWTPayload;
}
