-- TrueDom Database Schema
-- PostgreSQL 15+

-- Включаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'buyer',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  CONSTRAINT check_role CHECK (role IN ('buyer', 'seller', 'agent', 'agency', 'developer', 'admin'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- ============================================
-- ADDRESSES & LOCATIONS
-- ============================================

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  street VARCHAR(200) NOT NULL,
  house_number VARCHAR(20) NOT NULL,
  building VARCHAR(10),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  geom GEOMETRY(Point, 4326),
  full_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_addresses_geom ON addresses USING GIST(geom);
CREATE INDEX idx_addresses_city ON addresses(city);
CREATE INDEX idx_addresses_region ON addresses(region);

-- ============================================
-- BUILDINGS
-- ============================================

CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address_id UUID REFERENCES addresses(id) ON DELETE CASCADE,
  build_year INT,
  building_type VARCHAR(50),
  floors INT,
  materials VARCHAR(100),
  condition VARCHAR(50),
  parking VARCHAR(50),
  elevator_count INT DEFAULT 0,
  has_passenger_elevator BOOLEAN DEFAULT FALSE,
  has_cargo_elevator BOOLEAN DEFAULT FALSE,
  managing_company VARCHAR(200),
  rating DECIMAL(3, 2),
  rating_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_building_type CHECK (building_type IN ('brick', 'panel', 'monolith', 'block', 'wood', 'stalin', 'khrushchev')),
  CONSTRAINT check_condition CHECK (condition IN ('excellent', 'good', 'satisfactory', 'needs_repair')),
  CONSTRAINT check_parking CHECK (parking IN ('underground', 'ground', 'multi_level', 'none'))
);

CREATE INDEX idx_buildings_address ON buildings(address_id);
CREATE INDEX idx_buildings_rating ON buildings(rating DESC);

-- ============================================
-- OWNERS
-- ============================================

CREATE TABLE owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_method VARCHAR(50),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_verification_method CHECK (verification_method IN ('gosuslugi', 'rosreestr', 'manual', 'documents'))
);

CREATE INDEX idx_owners_user ON owners(user_id);
CREATE INDEX idx_owners_verified ON owners(is_verified);

-- ============================================
-- PROPERTIES (Digital Property Passport)
-- ============================================

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cadastral_number VARCHAR(50) UNIQUE NOT NULL,
  address_id UUID REFERENCES addresses(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES owners(id) ON DELETE SET NULL,
  rooms INT NOT NULL,
  area DECIMAL(6, 2) NOT NULL,
  floor INT NOT NULL,
  total_floors INT NOT NULL,
  ceiling_height DECIMAL(3, 2),
  renovation_status VARCHAR(50),
  has_balcony BOOLEAN DEFAULT FALSE,
  has_loggia BOOLEAN DEFAULT FALSE,
  bathroom VARCHAR(50),
  view_description TEXT,
  liquidity_score DECIMAL(3, 2) DEFAULT 5.0,
  estimated_price DECIMAL(12, 2),
  price_per_sqm DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_renovation CHECK (renovation_status IN ('designer', 'euro', 'cosmetic', 'none', 'needs_renovation')),
  CONSTRAINT check_bathroom CHECK (bathroom IN ('separate', 'combined', 'multiple'))
);

CREATE INDEX idx_properties_cadastral ON properties(cadastral_number);
CREATE INDEX idx_properties_building ON properties(building_id);
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_rooms ON properties(rooms);
CREATE INDEX idx_properties_area ON properties(area);
CREATE INDEX idx_properties_liquidity ON properties(liquidity_score DESC);
CREATE INDEX idx_properties_active ON properties(is_active) WHERE is_active = TRUE;

-- ============================================
-- LISTINGS
-- ============================================

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  listing_type VARCHAR(20) NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  description TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  sold_at TIMESTAMP,
  CONSTRAINT check_listing_type CHECK (listing_type IN ('sale', 'rent')),
  CONSTRAINT check_status CHECK (status IN ('active', 'sold', 'withdrawn', 'expired', 'pending'))
);

CREATE INDEX idx_listings_property ON listings(property_id);
CREATE INDEX idx_listings_agent ON listings(agent_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_created ON listings(created_at DESC);
CREATE INDEX idx_listings_active ON listings(status, price) WHERE status = 'active';

-- ============================================
-- OFFERS (Buyer Offer System)
-- ============================================

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  message TEXT,
  financing_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  responded_at TIMESTAMP,
  CONSTRAINT check_offer_status CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'expired')),
  CONSTRAINT check_financing CHECK (financing_type IN ('cash', 'mortgage', 'maternal_capital', 'installment'))
);

CREATE INDEX idx_offers_listing ON offers(listing_id);
CREATE INDEX idx_offers_property ON offers(property_id);
CREATE INDEX idx_offers_buyer ON offers(buyer_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_amount ON offers(amount DESC);
CREATE INDEX idx_offers_active ON offers(property_id, amount DESC) WHERE status = 'pending';

-- ============================================
-- TRANSACTIONS
-- ============================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  price DECIMAL(12, 2) NOT NULL,
  transaction_date DATE NOT NULL,
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_source CHECK (source IN ('rosreestr', 'platform', 'manual'))
);

CREATE INDEX idx_transactions_property ON transactions(property_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_price ON transactions(price);

-- ============================================
-- BUYER REQUESTS (Demand Side)
-- ============================================

CREATE TABLE buyer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  budget_min DECIMAL(12, 2),
  budget_max DECIMAL(12, 2),
  rooms_min INT,
  rooms_max INT,
  area_min DECIMAL(6, 2),
  area_max DECIMAL(6, 2),
  districts TEXT[],
  requirements TEXT,
  financing_status VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_request_status CHECK (status IN ('active', 'paused', 'closed', 'fulfilled')),
  CONSTRAINT check_financing_status CHECK (financing_status IN ('approved_mortgage', 'cash', 'pending', 'maternal_capital'))
);

CREATE INDEX idx_buyer_requests_buyer ON buyer_requests(buyer_id);
CREATE INDEX idx_buyer_requests_budget ON buyer_requests(budget_min, budget_max);
CREATE INDEX idx_buyer_requests_status ON buyer_requests(status) WHERE status = 'active';

-- ============================================
-- DOCUMENTS
-- ============================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  file_size INT,
  file_hash VARCHAR(64),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by VARCHAR(50),
  verified_at TIMESTAMP,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_document_type CHECK (document_type IN ('ownership', 'rosreestr_extract', 'floor_plan', 'tech_passport', 'renovation_permit', 'other'))
);

CREATE INDEX idx_documents_property ON documents(property_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_verified ON documents(is_verified);

-- ============================================
-- BUILDING RATINGS
-- ============================================

CREATE TABLE building_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  score INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_category CHECK (category IN ('quality', 'noise', 'infrastructure', 'safety', 'transport', 'schools', 'neighbors')),
  CONSTRAINT check_score CHECK (score >= 1 AND score <= 10),
  UNIQUE(building_id, user_id, category)
);

CREATE INDEX idx_building_ratings_building ON building_ratings(building_id);
CREATE INDEX idx_building_ratings_category ON building_ratings(category);

-- ============================================
-- INFRASTRUCTURE
-- ============================================

CREATE TABLE infrastructure (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  address VARCHAR(300),
  geom GEOMETRY(Point, 4326) NOT NULL,
  rating DECIMAL(3, 2),
  working_hours VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_infra_type CHECK (type IN ('metro', 'school', 'hospital', 'park', 'supermarket', 'cafe', 'restaurant', 'pharmacy', 'bank', 'gym'))
);

CREATE INDEX idx_infrastructure_geom ON infrastructure USING GIST(geom);
CREATE INDEX idx_infrastructure_type ON infrastructure(type);

-- ============================================
-- PROPERTY PHOTOS
-- ============================================

CREATE TABLE property_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  order_index INT DEFAULT 0,
  is_main BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_property_photos_property ON property_photos(property_id);
CREATE INDEX idx_property_photos_order ON property_photos(property_id, order_index);

-- ============================================
-- AGENTS
-- ============================================

CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  license_number VARCHAR(100),
  rating DECIMAL(3, 2),
  deals_count INT DEFAULT 0,
  specialization TEXT[],
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agents_user ON agents(user_id);
CREATE INDEX idx_agents_agency ON agents(agency_id);
CREATE INDEX idx_agents_rating ON agents(rating DESC);

-- ============================================
-- AGENCIES
-- ============================================

CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  legal_name VARCHAR(300),
  inn VARCHAR(20),
  address VARCHAR(300),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  logo_url VARCHAR(500),
  rating DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agencies_name ON agencies(name);
CREATE INDEX idx_agencies_rating ON agencies(rating DESC);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buyer_requests_updated_at BEFORE UPDATE ON buyer_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
