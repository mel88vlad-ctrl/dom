/**
 * TrueDom API Client
 * Централизованный клиент для работы с Backend API
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ============================================
// TOKEN MANAGEMENT
// ============================================

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
  localStorage.setItem('truedom_auth_token', token);
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('truedom_auth_token');
  }
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
  localStorage.removeItem('truedom_auth_token');
}

// ============================================
// BASE REQUEST FUNCTION
// ============================================

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requireAuth = false, ...fetchOptions } = options;
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token && requireAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// ============================================
// AUTH API
// ============================================

export interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: 'buyer' | 'seller' | 'agent';
}

export interface LoginData {
  email: string;
  password: string;
}

export const authAPI = {
  /**
   * Register new user
   */
  register: async (data: RegisterData) => {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (result.data?.token) {
      setAuthToken(result.data.token);
    }
    
    return result;
  },

  /**
   * Login user
   */
  login: async (data: LoginData) => {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (result.data?.token) {
      setAuthToken(result.data.token);
    }
    
    return result;
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    return apiRequest('/auth/me', {
      requireAuth: true,
    });
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<RegisterData>) => {
    return apiRequest('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  },

  /**
   * Logout
   */
  logout: () => {
    clearAuthToken();
  },
};

// ============================================
// PROPERTIES API
// ============================================

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
  renovation_status?: string[];
  building_type?: string[];
  page?: number;
  limit?: number;
  sort_by?: 'price' | 'area' | 'created_at' | 'liquidity';
  sort_order?: 'asc' | 'desc';
}

export interface CreatePropertyData {
  cadastral_number: string;
  address: {
    region: string;
    city: string;
    street: string;
    house_number: string;
    building?: string;
    lat?: number;
    lng?: number;
  };
  building?: {
    build_year?: number;
    building_type?: string;
    floors?: number;
    materials?: string;
    condition?: string;
    parking?: string;
  };
  rooms: number;
  area: number;
  floor: number;
  total_floors: number;
  ceiling_height?: number;
  renovation_status?: string;
  has_balcony?: boolean;
  has_loggia?: boolean;
  bathroom?: string;
  view_description?: string;
}

export const propertiesAPI = {
  /**
   * Search properties with filters
   */
  search: async (params: PropertySearchParams = {}) => {
    const query = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => query.append(key, v.toString()));
        } else {
          query.append(key, value.toString());
        }
      }
    });

    return apiRequest(`/properties/search?${query.toString()}`);
  },

  /**
   * Get property by ID
   */
  getById: async (id: string) => {
    return apiRequest(`/properties/${id}`);
  },

  /**
   * Get property by cadastral number
   */
  getByCadastral: async (cadastralNumber: string) => {
    return apiRequest(`/properties/cadastral/${cadastralNumber}`);
  },

  /**
   * Create new property
   */
  create: async (data: CreatePropertyData) => {
    return apiRequest('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  },

  /**
   * Update property
   */
  update: async (id: string, data: Partial<CreatePropertyData>) => {
    return apiRequest(`/properties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  },

  /**
   * Delete property
   */
  delete: async (id: string) => {
    return apiRequest(`/properties/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  },
};

// ============================================
// LISTINGS API
// ============================================

export interface CreateListingData {
  property_id: string;
  price: number;
  listing_type: 'sale' | 'rent';
  description?: string;
}

export const listingsAPI = {
  /**
   * Create new listing
   */
  create: async (data: CreateListingData) => {
    return apiRequest('/listings', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  },

  /**
   * Get listing by ID
   */
  getById: async (id: string) => {
    return apiRequest(`/listings/${id}`);
  },

  /**
   * Get listings for a property
   */
  getByProperty: async (propertyId: string) => {
    return apiRequest(`/listings/property/${propertyId}`);
  },

  /**
   * Get current user's listings
   */
  getMy: async (page = 1, limit = 20) => {
    return apiRequest(`/listings/my?page=${page}&limit=${limit}`, {
      requireAuth: true,
    });
  },

  /**
   * Update listing
   */
  update: async (id: string, data: Partial<CreateListingData>) => {
    return apiRequest(`/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  },

  /**
   * Mark listing as sold
   */
  markAsSold: async (id: string) => {
    return apiRequest(`/listings/${id}/sold`, {
      method: 'POST',
      requireAuth: true,
    });
  },

  /**
   * Withdraw listing
   */
  withdraw: async (id: string) => {
    return apiRequest(`/listings/${id}/withdraw`, {
      method: 'POST',
      requireAuth: true,
    });
  },

  /**
   * Delete listing
   */
  delete: async (id: string) => {
    return apiRequest(`/listings/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  },
};

// ============================================
// OFFERS API
// ============================================

export interface CreateOfferData {
  listing_id: string;
  property_id: string;
  amount: number;
  message?: string;
  financing_type?: 'cash' | 'mortgage' | 'maternal_capital' | 'installment';
}

export const offersAPI = {
  /**
   * Create new offer
   */
  create: async (data: CreateOfferData) => {
    return apiRequest('/offers', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  },

  /**
   * Get offers for a property (Order Book)
   */
  getByProperty: async (propertyId: string) => {
    return apiRequest(`/offers/property/${propertyId}`);
  },

  /**
   * Get current user's offers
   */
  getMy: async (page = 1, limit = 20) => {
    return apiRequest(`/offers/my?page=${page}&limit=${limit}`, {
      requireAuth: true,
    });
  },

  /**
   * Get offer by ID
   */
  getById: async (id: string) => {
    return apiRequest(`/offers/${id}`, {
      requireAuth: true,
    });
  },

  /**
   * Accept offer (property owner)
   */
  accept: async (id: string) => {
    return apiRequest(`/offers/${id}/accept`, {
      method: 'POST',
      requireAuth: true,
    });
  },

  /**
   * Reject offer (property owner)
   */
  reject: async (id: string) => {
    return apiRequest(`/offers/${id}/reject`, {
      method: 'POST',
      requireAuth: true,
    });
  },

  /**
   * Withdraw offer (buyer)
   */
  withdraw: async (id: string) => {
    return apiRequest(`/offers/${id}/withdraw`, {
      method: 'POST',
      requireAuth: true,
    });
  },
};

// ============================================
// EXPORT ALL
// ============================================

export default {
  auth: authAPI,
  properties: propertiesAPI,
  listings: listingsAPI,
  offers: offersAPI,
};
