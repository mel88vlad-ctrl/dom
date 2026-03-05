-- ============================================
-- SIMPLIFIED SCHEMA WITHOUT POSTGIS
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'buyer',
  is_verified BOOLEAN DEFAULT FALSE,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Addresses table (without PostGIS)
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  street VARCHAR(200) NOT NULL,
  house_number VARCHAR(20) NOT NULL,
  building VARCHAR(20),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_city ON addresses(city);
CREATE INDEX IF NOT EXISTS idx_addresses_lat_lng ON addresses(lat, lng);

-- Buildings table
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address_id UUID REFERENCES addresses(id),
  build_year INT,
  building_type VARCHAR(50),
  floors INT,
  materials VARCHAR(100),
  condition VARCHAR(50),
  parking VARCHAR(50),
  elevator_count INT DEFAULT 0,
  managing_company VARCHAR(200),
  rating DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buildings_address ON buildings(address_id);

-- Owners table
CREATE TABLE IF NOT EXISTS owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_method VARCHAR(50),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cadastral_number VARCHAR(50) UNIQUE NOT NULL,
  address_id UUID REFERENCES addresses(id),
  building_id UUID REFERENCES buildings(id),
  owner_id UUID REFERENCES owners(id),
  rooms INT,
  area DECIMAL(6, 2),
  floor INT,
  total_floors INT,
  ceiling_height DECIMAL(3, 2),
  renovation_status VARCHAR(50),
  has_balcony BOOLEAN DEFAULT FALSE,
  has_loggia BOOLEAN DEFAULT FALSE,
  bathroom VARCHAR(50),
  view_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_cadastral ON properties(cadastral_number);
CREATE INDEX IF NOT EXISTS idx_properties_building ON properties(building_id);
CREATE INDEX IF NOT EXISTS idx_properties_address ON properties(address_id);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  agent_id UUID REFERENCES users(id),
  listing_type VARCHAR(20) DEFAULT 'sale',
  price DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  description TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_listings_property ON listings(property_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id),
  property_id UUID REFERENCES properties(id),
  buyer_id UUID REFERENCES users(id),
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  message TEXT,
  financing_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_listing ON offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_property ON offers(property_id);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES users(id),
  price DECIMAL(12, 2) NOT NULL,
  transaction_date DATE NOT NULL,
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_property ON transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);

-- Buyer requests table
CREATE TABLE IF NOT EXISTS buyer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id),
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
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buyer_requests_budget ON buyer_requests(budget_min, budget_max);
CREATE INDEX IF NOT EXISTS idx_buyer_requests_status ON buyer_requests(status);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  document_type VARCHAR(50),
  file_url VARCHAR(500),
  file_hash VARCHAR(64),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by VARCHAR(50),
  verified_at TIMESTAMP,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_property ON documents(property_id);

-- Building ratings table
CREATE TABLE IF NOT EXISTS building_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID REFERENCES buildings(id),
  user_id UUID REFERENCES users(id),
  category VARCHAR(50),
  score INT CHECK (score >= 1 AND score <= 10),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(building_id, user_id, category)
);

CREATE INDEX IF NOT EXISTS idx_building_ratings_building ON building_ratings(building_id);

-- Property photos table
CREATE TABLE IF NOT EXISTS property_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  photo_url VARCHAR(500) NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  order_index INT DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_photos_property ON property_photos(property_id);

-- Agencies table
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  legal_name VARCHAR(300),
  inn VARCHAR(20),
  address VARCHAR(300),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  rating DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  agency_id UUID REFERENCES agencies(id),
  license_number VARCHAR(100),
  rating DECIMAL(3, 2),
  deals_count INT DEFAULT 0,
  specialization TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_user ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_agency ON agents(agency_id);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buyer_requests_updated_at BEFORE UPDATE ON buyer_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
