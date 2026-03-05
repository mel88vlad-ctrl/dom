# TrueDom - Руководство по Реализации
## Полная документация для разработки PropTech платформы

---

## 📋 Содержание

1. [Обзор Архитектуры](#архитектура)
2. [База Данных](#база-данных)
3. [Backend API](#backend-api)
4. [Frontend Компоненты](#frontend)
5. [Интеграции](#интеграции)
6. [Deployment](#deployment)

---

## 🏗️ Архитектура

### Технологический Стек

**Frontend:**
- React 19 + TypeScript
- Vite (сборка)
- TailwindCSS 4 (стилизация)
- Motion (анимации)
- Lucide React (иконки)

**Backend (рекомендуемый):**
- Node.js + Express / Go (высокая нагрузка)
- PostgreSQL + PostGIS (геоданные)
- Redis (кэширование)
- Elasticsearch (поиск)
- Apache Kafka (события)

**Инфраструктура:**
- Kubernetes (оркестрация)
- Cloudflare (CDN + WAF)
- Kong API Gateway


---

## 🗄️ База Данных

### PostgreSQL Schema

```sql
-- ============================================
-- CORE ENTITIES
-- ============================================

-- Адреса с геоданными
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  street VARCHAR(200) NOT NULL,
  house_number VARCHAR(20) NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  geom GEOMETRY(Point, 4326), -- PostGIS для геопоиска
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_addresses_geom ON addresses USING GIST(geom);
CREATE INDEX idx_addresses_city ON addresses(city);

-- Здания
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address_id UUID REFERENCES addresses(id),
  build_year INT,
  building_type VARCHAR(50), -- 'brick', 'panel', 'monolith'
  floors INT,
  materials VARCHAR(100),
  condition VARCHAR(50), -- 'excellent', 'good', 'needs_repair'
  parking VARCHAR(50), -- 'underground', 'ground', 'none'
  elevator_count INT DEFAULT 0,
  managing_company VARCHAR(200),
  rating DECIMAL(3, 2), -- Средний рейтинг от жильцов
  created_at TIMESTAMP DEFAULT NOW()
);

-- Собственники
CREATE TABLE owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_method VARCHAR(50), -- 'gosuslugi', 'rosreestr', 'manual'
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Объекты недвижимости (Digital Property Passport)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cadastral_number VARCHAR(50) UNIQUE NOT NULL,
  address_id UUID REFERENCES addresses(id),
  building_id UUID REFERENCES buildings(id),
  owner_id UUID REFERENCES owners(id),
  rooms INT,
  area DECIMAL(6, 2), -- м²
  floor INT,
  total_floors INT,
  ceiling_height DECIMAL(3, 2), -- метры
  renovation_status VARCHAR(50), -- 'designer', 'euro', 'cosmetic', 'none'
  balcony BOOLEAN DEFAULT FALSE,
  loggia BOOLEAN DEFAULT FALSE,
  bathroom VARCHAR(50), -- 'separate', 'combined'
  view_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_properties_cadastral ON properties(cadastral_number);
CREATE INDEX idx_properties_building ON properties(building_id);

-- ============================================
-- MARKET MECHANICS
-- ============================================

-- Листинги (временные объявления)
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  agent_id UUID REFERENCES users(id), -- Nullable для прямых продаж
  listing_type VARCHAR(20), -- 'sale', 'rent'
  price DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'sold', 'withdrawn', 'expired'
  description TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX idx_listings_property ON listings(property_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_price ON listings(price);

-- Офферы покупателей (Buyer Offer System)
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id),
  property_id UUID REFERENCES properties(id),
  buyer_id UUID REFERENCES users(id),
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'withdrawn'
  message TEXT,
  financing_type VARCHAR(50), -- 'cash', 'mortgage', 'maternal_capital'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_offers_listing ON offers(listing_id);
CREATE INDEX idx_offers_buyer ON offers(buyer_id);
CREATE INDEX idx_offers_status ON offers(status);

-- История транзакций
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES users(id), -- Агент, который привел покупателя
  price DECIMAL(12, 2) NOT NULL,
  transaction_date DATE NOT NULL,
  source VARCHAR(50), -- 'rosreestr', 'platform', 'manual'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_property ON transactions(property_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);

-- Запросы покупателей (Demand Side)
CREATE TABLE buyer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES users(id),
  budget_min DECIMAL(12, 2),
  budget_max DECIMAL(12, 2),
  rooms_min INT,
  rooms_max INT,
  area_min DECIMAL(6, 2),
  area_max DECIMAL(6, 2),
  districts TEXT[], -- Массив районов
  requirements TEXT,
  financing_status VARCHAR(50), -- 'approved_mortgage', 'cash', 'pending'
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'closed'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_buyer_requests_budget ON buyer_requests(budget_min, budget_max);
CREATE INDEX idx_buyer_requests_status ON buyer_requests(status);

-- ============================================
-- TRUST & VERIFICATION
-- ============================================

-- Документы объектов
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  document_type VARCHAR(50), -- 'ownership', 'rosreestr_extract', 'floor_plan', 'tech_passport'
  file_url VARCHAR(500),
  file_hash VARCHAR(64), -- SHA-256 для проверки целостности
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by VARCHAR(50), -- 'rosreestr_api', 'gosuslugi', 'admin'
  verified_at TIMESTAMP,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_property ON documents(property_id);

-- Рейтинги зданий
CREATE TABLE building_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  user_id UUID REFERENCES users(id),
  category VARCHAR(50), -- 'quality', 'noise', 'infrastructure', 'safety', 'transport', 'schools'
  score INT CHECK (score >= 1 AND score <= 10),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(building_id, user_id, category)
);

CREATE INDEX idx_building_ratings_building ON building_ratings(building_id);

-- ============================================
-- INFRASTRUCTURE & LOCATION
-- ============================================

-- Инфраструктура
CREATE TABLE infrastructure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50), -- 'metro', 'school', 'hospital', 'park', 'supermarket', 'cafe'
  name VARCHAR(200),
  address VARCHAR(300),
  geom GEOMETRY(Point, 4326),
  rating DECIMAL(3, 2),
  working_hours VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_infrastructure_geom ON infrastructure USING GIST(geom);
CREATE INDEX idx_infrastructure_type ON infrastructure(type);

-- ============================================
-- USERS & ROLES
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20), -- 'buyer', 'seller', 'agent', 'agency', 'developer', 'admin'
  is_verified BOOLEAN DEFAULT FALSE,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Агенты (расширенная информация)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  agency_id UUID REFERENCES agencies(id),
  license_number VARCHAR(100),
  rating DECIMAL(3, 2),
  deals_count INT DEFAULT 0,
  specialization TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Агентства
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

---

## 🔌 Backend API

### REST API Endpoints

#### 1. Property Passport API

```typescript
// GET /api/properties/:cadastralNumber
// Получить Digital Property Passport
interface PropertyPassportResponse {
  property: {
    id: string;
    cadastralNumber: string;
    address: Address;
    building: Building;
    rooms: number;
    area: number;
    floor: number;
    ceilingHeight: number;
    renovationStatus: string;
  };
  currentListing?: {
    id: string;
    price: number;
    status: string;
    daysOnMarket: number;
    viewsCount: number;
  };
  offers: Offer[];
  priceHistory: PriceHistoryPoint[];
  transactions: Transaction[];
  documents: Document[];
  analytics: {
    estimatedPrice: number;
    priceRange: { min: number; max: number };
    liquidity: 'high' | 'medium' | 'low';
    expectedSaleDays: number;
    demandScore: number;
  };
}

// POST /api/properties
// Создать новый паспорт объекта (admin/owner)
interface CreatePropertyRequest {
  cadastralNumber: string;
  addressId: string;
  buildingId: string;
  rooms: number;
  area: number;
  floor: number;
  // ... остальные поля
}
```

#### 2. Listings API

```typescript
// GET /api/listings
// Поиск листингов с фильтрами
interface ListingsSearchParams {
  city?: string;
  districts?: string[];
  priceMin?: number;
  priceMax?: number;
  rooms?: number[];
  areaMin?: number;
  areaMax?: number;
  bounds?: { ne: LatLng; sw: LatLng }; // Для карты
  page?: number;
  limit?: number;
}

// POST /api/listings
// Создать листинг (owner/agent)
interface CreateListingRequest {
  propertyId: string;
  price: number;
  description: string;
  listingType: 'sale' | 'rent';
}

// PATCH /api/listings/:id
// Обновить листинг
```

#### 3. Offers API (Buyer Offer System)

```typescript
// POST /api/offers
// Сделать оффер на объект
interface CreateOfferRequest {
  listingId: string;
  propertyId: string;
  amount: number;
  message?: string;
  financingType: 'cash' | 'mortgage' | 'maternal_capital';
}

// GET /api/offers/property/:propertyId
// Получить все офферы по объекту (видны всем)
interface OffersResponse {
  offers: Array<{
    id: string;
    amount: number;
    status: string;
    buyerId: string; // Анонимизирован
    createdAt: string;
  }>;
  topOffer: number;
  offersCount: number;
}

// PATCH /api/offers/:id/accept
// Принять оффер (owner only)

// PATCH /api/offers/:id/reject
// Отклонить оффер (owner only)
```

#### 4. Buyer Requests API (Demand Side)

```typescript
// POST /api/buyer-requests
// Создать запрос покупателя
interface CreateBuyerRequestRequest {
  budgetMin: number;
  budgetMax: number;
  roomsMin?: number;
  roomsMax?: number;
  areaMin?: number;
  districts?: string[];
  requirements?: string;
  financingStatus: string;
}

// GET /api/buyer-requests/active
// Получить активных покупателей в районе (для агентов)
interface ActiveBuyersParams {
  district?: string;
  budgetMin?: number;
  budgetMax?: number;
}
```

#### 5. AI Price Estimation API

```typescript
// POST /api/ai/estimate-price
// AI оценка стоимости объекта
interface PriceEstimationRequest {
  address: string;
  rooms: number;
  area: number;
  floor: number;
  totalFloors: number;
  renovationStatus?: string;
  buildYear?: number;
}

interface PriceEstimationResponse {
  estimatedPrice: number;
  priceRange: { min: number; max: number };
  confidence: number; // 0-100%
  pricePerSqm: number;
  comparables: Array<{
    address: string;
    price: number;
    similarity: number;
  }>;
  marketTrends: {
    districtGrowth: number; // %
    expectedSaleDays: number;
    demandLevel: 'high' | 'medium' | 'low';
  };
}
```

#### 6. Analytics & Liquidity API

```typescript
// GET /api/analytics/liquidity/:propertyId
// Получить показатели ликвидности объекта
interface LiquidityResponse {
  liquidityScore: 'high' | 'medium' | 'low';
  expectedSaleDays: number;
  activeBuyersInArea: number;
  demandSupplyRatio: number;
  similarPropertiesSold: number;
  averageSaleTime: number;
}

// GET /api/analytics/district/:district
// Аналитика по району
interface DistrictAnalyticsResponse {
  averagePricePerSqm: number;
  priceGrowth: number; // % за год
  activeListings: number;
  soldLastMonth: number;
  averageSaleTime: number;
  topBuildings: Array<{
    address: string;
    rating: number;
  }>;
}
```

#### 7. Documents & Verification API

```typescript
// POST /api/documents/upload
// Загрузить документ
interface UploadDocumentRequest {
  propertyId: string;
  documentType: string;
  file: File;
}

// POST /api/verification/rosreestr
// Проверить через Росреестр API
interface RosreestrVerificationRequest {
  cadastralNumber: string;
}

// POST /api/verification/gosuslugi
// OAuth интеграция с Госуслугами
```

---

## 🎨 Frontend Компоненты

### Структура проекта

```
src/
├── components/
│   ├── map/
│   │   ├── PropertyMap.tsx          # Карта с пинами объектов
│   │   ├── DemandHeatmap.tsx        # Тепловая карта спроса
│   │   └── LiquidityLayer.tsx       # Слой ликвидности
│   ├── property/
│   │   ├── PropertyPassport.tsx     # Главная страница паспорта
│   │   ├── PropertyCard.tsx         # Карточка в списке
│   │   ├── OfferBook.tsx            # Стакан офферов
│   │   ├── PriceHistory.tsx         # График истории цен
│   │   └── DocumentsSection.tsx     # Раздел документов
│   ├── search/
│   │   ├── SearchBar.tsx            # Поиск
│   │   ├── FilterPanel.tsx          # Фильтры
│   │   └── SearchResults.tsx        # Результаты
│   ├── buyer/
│   │   ├── BuyerRequestForm.tsx     # Форма запроса покупателя
│   │   └── BuyerCard.tsx            # Карточка покупателя
│   ├── modals/
│   │   ├── OfferModal.tsx           # Модалка создания оффера
│   │   └── ViewingModal.tsx         # Запись на просмотр
│   └── analytics/
│       ├── PriceEstimator.tsx       # AI оценка цены
│       └── LiquidityWidget.tsx      # Виджет ликвидности
├── pages/
│   ├── HomePage.tsx
│   ├── PropertyPage.tsx
│   ├── SearchPage.tsx
│   └── DashboardPage.tsx
├── hooks/
│   ├── useProperties.ts
│   ├── useOffers.ts
│   └── useGeolocation.ts
├── services/
│   ├── api.ts                       # API клиент
│   ├── websocket.ts                 # WebSocket для real-time
│   └── map.ts                       # Работа с картами
└── types/
    └── index.ts                     # TypeScript типы
```

### Ключевые компоненты

#### PropertyMap.tsx - Карта с объектами

```typescript
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

interface PropertyMapProps {
  properties: Property[];
  buyers?: BuyerRequest[];
  mode: 'supply' | 'demand';
  showLiquidity?: boolean;
}

export function PropertyMap({ properties, buyers, mode, showLiquidity }: PropertyMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const getMarkerColor = (property: Property) => {
    if (!showLiquidity) return 'blue';
    
    // Цвет по ликвидности
    if (property.liquidity === 'high') return 'green';
    if (property.liquidity === 'medium') return 'yellow';
    return 'red';
  };

  return (
    <MapContainer center={[55.751244, 37.618423]} zoom={12}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {mode === 'supply' && properties.map(property => (
        <Marker 
          key={property.id}
          position={[property.lat, property.lng]}
          eventHandlers={{
            click: () => setSelectedProperty(property.id)
          }}
        >
          <Popup>
            <PropertyPopup property={property} />
          </Popup>
        </Marker>
      ))}

      {mode === 'demand' && buyers?.map(buyer => (
        <Marker 
          key={buyer.id}
          position={[buyer.lat, buyer.lng]}
          icon={buyerIcon}
        >
          <Popup>
            <BuyerPopup buyer={buyer} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

#### OfferBook.tsx - Стакан офферов

```typescript
import { useState } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

interface OfferBookProps {
  propertyId: string;
  listingPrice: number;
  offers: Offer[];
  onCreateOffer?: () => void;
}

export function OfferBook({ propertyId, listingPrice, offers, onCreateOffer }: OfferBookProps) {
  const sortedOffers = [...offers].sort((a, b) => b.amount - a.amount);
  const topOffer = sortedOffers[0];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Стакан офферов</h3>
        <span className="bg-gray-100 px-2 py-1 rounded text-sm">
          {offers.length} активных
        </span>
      </div>

      <div className="space-y-3 mb-6">
        {sortedOffers.map((offer, index) => (
          <div 
            key={offer.id}
            className={`flex justify-between items-center p-3 rounded-lg border ${
              index === 0 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                index === 0 ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className="font-bold">
                {offer.amount.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <span className="text-xs text-gray-500">
              Покупатель #{offer.buyerId.slice(0, 6)}
            </span>
          </div>
        ))}
      </div>

      {topOffer && (
        <div className="bg-indigo-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-gray-600 mb-1">Лучшее предложение</p>
          <p className="text-2xl font-black text-green-600">
            {topOffer.amount.toLocaleString('ru-RU')} ₽
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {((topOffer.amount / listingPrice - 1) * 100).toFixed(1)}% от цены листинга
          </p>
        </div>
      )}

      <button 
        onClick={onCreateOffer}
        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
      >
        <DollarSign className="w-5 h-5" />
        Предложить свою цену
      </button>
    </div>
  );
}
```

#### PriceEstimator.tsx - AI оценка цены

```typescript
import { useState } from 'react';
import { Activity, TrendingUp } from 'lucide-react';

interface PriceEstimatorProps {
  onEstimate?: (data: EstimationData) => void;
}

export function PriceEstimator({ onEstimate }: PriceEstimatorProps) {
  const [formData, setFormData] = useState({
    address: '',
    rooms: 2,
    area: 60,
    floor: 5,
    totalFloors: 10
  });
  const [result, setResult] = useState<PriceEstimationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEstimate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/estimate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResult(data);
      onEstimate?.(data);
    } catch (error) {
      console.error('Estimation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 text-white">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6" />
        <h2 className="text-2xl font-bold">AI Оценка Стоимости</h2>
      </div>

      {!result ? (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Адрес"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Комнат"
              value={formData.rooms}
              onChange={(e) => setFormData({ ...formData, rooms: +e.target.value })}
              className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
            />
            <input
              type="number"
              placeholder="Площадь (м²)"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: +e.target.value })}
              className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
            />
          </div>

          <button
            onClick={handleEstimate}
            disabled={loading}
            className="w-full py-4 bg-white text-indigo-900 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            {loading ? 'Оцениваем...' : 'Получить оценку'}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-end gap-4 mb-6">
            <span className="text-5xl font-black">
              {(result.estimatedPrice / 1_000_000).toFixed(1)} млн ₽
            </span>
            <span className="text-lg font-medium text-green-400 flex items-center mb-2">
              <TrendingUp className="w-5 h-5 mr-1" />
              Точность {result.confidence}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            <div>
              <p className="text-indigo-300 text-xs uppercase mb-1">Диапазон</p>
              <p className="font-bold text-sm">
                {(result.priceRange.min / 1_000_000).toFixed(1)} - {(result.priceRange.max / 1_000_000).toFixed(1)} млн
              </p>
            </div>
            <div>
              <p className="text-indigo-300 text-xs uppercase mb-1">За м²</p>
              <p className="font-bold text-sm">
                {result.pricePerSqm.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div>
              <p className="text-indigo-300 text-xs uppercase mb-1">Срок продажи</p>
              <p className="font-bold text-sm">
                {result.marketTrends.expectedSaleDays} дней
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🔗 Интеграции

### 1. Росреестр API

```typescript
// services/rosreestr.ts
interface RosreestrClient {
  verifyProperty(cadastralNumber: string): Promise<RosreestrData>;
  getExtract(cadastralNumber: string): Promise<ExtractDocument>;
}

class RosreestrService implements RosreestrClient {
  private apiKey: string;
  private baseUrl = 'https://rosreestr.gov.ru/api/online';

  async verifyProperty(cadastralNumber: string): Promise<RosreestrData> {
    const response = await fetch(`${this.baseUrl}/fir_object/${cadastralNumber}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Rosreestr verification failed');
    }
    
    return response.json();
  }

  async getExtract(cadastralNumber: string): Promise<ExtractDocument> {
    // Запрос выписки ЕГРН
    const response = await fetch(`${this.baseUrl}/request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cadastralNumber,
        extractType: 'full'
      })
    });

    return response.json();
  }
}
```

### 2. Госуслуги OAuth

```typescript
// services/gosuslugi.ts
class GosuslugiAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid fullname birthdate snils inn',
      state: generateRandomState()
    });

    return `https://esia.gosuslugi.ru/aas/oauth2/ac?${params}`;
  }

  async exchangeCode(code: string): Promise<GosuslugiUser> {
    const response = await fetch('https://esia.gosuslugi.ru/aas/oauth2/te', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri
      })
    });

    const { access_token } = await response.json();
    return this.getUserInfo(access_token);
  }

  async getUserInfo(accessToken: string): Promise<GosuslugiUser> {
    const response = await fetch('https://esia.gosuslugi.ru/rs/prns/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return response.json();
  }
}
```

### 3. Яндекс.Карты / 2GIS

```typescript
// services/maps.ts
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

interface MapService {
  geocode(address: string): Promise<Coordinates>;
  reverseGeocode(lat: number, lng: number): Promise<Address>;
  calculateDistance(from: Coordinates, to: Coordinates): number;
}

class YandexMapsService implements MapService {
  private apiKey: string;

  async geocode(address: string): Promise<Coordinates> {
    const response = await fetch(
      `https://geocode-maps.yandex.ru/1.x/?apikey=${this.apiKey}&geocode=${encodeURIComponent(address)}&format=json`
    );
    
    const data = await response.json();
    const point = data.response.GeoObjectCollection.featureMember[0]?.GeoObject.Point.pos;
    
    if (!point) throw new Error('Address not found');
    
    const [lng, lat] = point.split(' ').map(Number);
    return { lat, lng };
  }

  async reverseGeocode(lat: number, lng: number): Promise<Address> {
    const response = await fetch(
      `https://geocode-maps.yandex.ru/1.x/?apikey=${this.apiKey}&geocode=${lng},${lat}&format=json`
    );
    
    const data = await response.json();
    const geoObject = data.response.GeoObjectCollection.featureMember[0]?.GeoObject;
    
    return {
      fullAddress: geoObject.metaDataProperty.GeocoderMetaData.text,
      components: this.parseAddressComponents(geoObject)
    };
  }

  calculateDistance(from: Coordinates, to: Coordinates): number {
    // Haversine formula
    const R = 6371; // Радиус Земли в км
    const dLat = this.toRad(to.lat - from.lat);
    const dLng = this.toRad(to.lng - from.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(from.lat)) * Math.cos(this.toRad(to.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
```

### 4. AI/ML для оценки цен

```python
# ml/price_estimator.py
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler

class PropertyPriceEstimator:
    def __init__(self):
        self.model = GradientBoostingRegressor(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.scaler = StandardScaler()
        
    def prepare_features(self, property_data):
        """
        Подготовка признаков для модели
        """
        features = {
            'area': property_data['area'],
            'rooms': property_data['rooms'],
            'floor': property_data['floor'],
            'total_floors': property_data['total_floors'],
            'build_year': property_data['build_year'],
            'renovation_score': self.encode_renovation(property_data['renovation_status']),
            'district_avg_price': self.get_district_avg_price(property_data['district']),
            'metro_distance': property_data['metro_distance'],
            'infrastructure_score': self.calculate_infrastructure_score(property_data['lat'], property_data['lng']),
            'building_rating': property_data.get('building_rating', 5.0),
            'market_trend': self.get_market_trend(property_data['district'])
        }
        
        return pd.DataFrame([features])
    
    def estimate(self, property_data):
        """
        Оценка стоимости объекта
        """
        features = self.prepare_features(property_data)
        features_scaled = self.scaler.transform(features)
        
        # Предсказание
        predicted_price = self.model.predict(features_scaled)[0]
        
        # Доверительный интервал (±10%)
        confidence_interval = {
            'min': predicted_price * 0.9,
            'max': predicted_price * 1.1
        }
        
        # Поиск похожих объектов
        comparables = self.find_comparables(property_data)
        
        # Расчет точности на основе количества данных
        confidence = self.calculate_confidence(property_data, comparables)
        
        return {
            'estimated_price': predicted_price,
            'price_range': confidence_interval,
            'confidence': confidence,
            'price_per_sqm': predicted_price / property_data['area'],
            'comparables': comparables,
            'market_trends': self.get_detailed_trends(property_data['district'])
        }
    
    def calculate_infrastructure_score(self, lat, lng):
        """
        Оценка инфраструктуры вокруг объекта
        """
        # Подсчет объектов инфраструктуры в радиусе 1км
        nearby_metro = self.count_nearby('metro', lat, lng, radius=1000)
        nearby_schools = self.count_nearby('school', lat, lng, radius=500)
        nearby_parks = self.count_nearby('park', lat, lng, radius=1000)
        nearby_shops = self.count_nearby('supermarket', lat, lng, radius=500)
        
        score = (
            nearby_metro * 3.0 +
            nearby_schools * 2.0 +
            nearby_parks * 1.5 +
            nearby_shops * 1.0
        )
        
        return min(score, 10.0)  # Нормализация 0-10
    
    def find_comparables(self, property_data, limit=5):
        """
        Поиск похожих проданных объектов
        """
        query = """
            SELECT p.*, t.price, t.transaction_date
            FROM properties p
            JOIN transactions t ON p.id = t.property_id
            WHERE p.rooms = %s
            AND p.area BETWEEN %s AND %s
            AND ST_DWithin(
                (SELECT geom FROM addresses WHERE id = p.address_id),
                ST_SetSRID(ST_MakePoint(%s, %s), 4326),
                2000  -- 2км радиус
            )
            AND t.transaction_date > NOW() - INTERVAL '1 year'
            ORDER BY t.transaction_date DESC
            LIMIT %s
        """
        
        # Выполнение запроса и возврат результатов
        # ...
        
    def get_market_trend(self, district):
        """
        Тренд рынка в районе (рост/падение цен)
        """
        query = """
            SELECT 
                AVG(CASE WHEN transaction_date > NOW() - INTERVAL '3 months' THEN price END) as recent_avg,
                AVG(CASE WHEN transaction_date BETWEEN NOW() - INTERVAL '1 year' AND NOW() - INTERVAL '9 months' THEN price END) as old_avg
            FROM transactions t
            JOIN properties p ON t.property_id = p.id
            JOIN addresses a ON p.address_id = a.id
            WHERE a.city = 'Москва' AND a.region = %s
        """
        
        # Расчет процента изменения
        # ...
```

---

## 🚀 Deployment & Infrastructure

### Docker Compose для локальной разработки

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: truedom
      POSTGRES_USER: truedom
      POSTGRES_PASSWORD: truedom_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - es_data:/usr/share/elasticsearch/data

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://truedom:truedom_pass@postgres:5432/truedom
      REDIS_URL: redis://redis:6379
      ELASTICSEARCH_URL: http://elasticsearch:9200
      ROSREESTR_API_KEY: ${ROSREESTR_API_KEY}
      GOSUSLUGI_CLIENT_ID: ${GOSUSLUGI_CLIENT_ID}
      GOSUSLUGI_CLIENT_SECRET: ${GOSUSLUGI_CLIENT_SECRET}
    depends_on:
      - postgres
      - redis
      - elasticsearch

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:3001
      VITE_YANDEX_MAPS_KEY: ${YANDEX_MAPS_KEY}
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
  es_data:
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: truedom-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: truedom-backend
  template:
    metadata:
      labels:
        app: truedom-backend
    spec:
      containers:
      - name: backend
        image: truedom/backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: truedom-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: truedom-secrets
              key: redis-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: truedom-backend
spec:
  selector:
    app: truedom-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: LoadBalancer

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: truedom-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: truedom-backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy TrueDom

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          
      - name: Run tests
        run: |
          cd frontend
          npm run test
          
      - name: Run linter
        run: |
          cd frontend
          npm run lint

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
          
      - name: Build and push backend
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: truedom/backend:${{ github.sha }},truedom/backend:latest
          
      - name: Build and push frontend
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: truedom/frontend:${{ github.sha }},truedom/frontend:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v4
        with:
          manifests: |
            k8s/deployment.yaml
            k8s/service.yaml
          images: |
            truedom/backend:${{ github.sha }}
            truedom/frontend:${{ github.sha }}
          kubeconfig: ${{ secrets.KUBE_CONFIG }}
```

---

## 📊 Мониторинг и Аналитика

### Prometheus + Grafana

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'truedom-backend'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: truedom-backend
      - source_labels: [__meta_kubernetes_pod_ip]
        target_label: __address__
        replacement: ${1}:3001

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### Ключевые метрики для отслеживания

```typescript
// backend/metrics.ts
import { Counter, Histogram, Gauge } from 'prom-client';

// Счетчики запросов
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Время ответа API
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

// Активные листинги
export const activeListingsGauge = new Gauge({
  name: 'active_listings_total',
  help: 'Total number of active listings'
});

// Офферы за последний час
export const offersPerHour = new Counter({
  name: 'offers_created_total',
  help: 'Total number of offers created',
  labelNames: ['status']
});

// Поисковые запросы
export const searchQueriesTotal = new Counter({
  name: 'search_queries_total',
  help: 'Total number of search queries',
  labelNames: ['type']
});
```

---

## 🔐 Безопасность

### Аутентификация и Авторизация

```typescript
// backend/auth/jwt.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface JWTPayload {
  userId: string;
  role: string;
  email: string;
}

export class AuthService {
  private jwtSecret: string;
  private jwtExpiry = '7d';

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiry
    });
  }

  verifyToken(token: string): JWTPayload {
    return jwt.verify(token, this.jwtSecret) as JWTPayload;
  }

  // Middleware для защиты роутов
  requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const payload = this.verifyToken(token);
      req.user = payload;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  // Проверка роли
  requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    };
  }
}
```

### Rate Limiting

```typescript
// backend/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Общий лимит для API
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // 100 запросов
  message: 'Too many requests from this IP'
});

// Строгий лимит для создания офферов
export const offerLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:offer:'
  }),
  windowMs: 60 * 60 * 1000, // 1 час
  max: 10, // 10 офферов в час
  message: 'Too many offers created'
});

// Лимит для AI оценки
export const aiEstimateLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:ai:'
  }),
  windowMs: 24 * 60 * 60 * 1000, // 24 часа
  max: 5, // 5 оценок в день для неавторизованных
  skipSuccessfulRequests: false
});
```

### Валидация данных

```typescript
// backend/validation/schemas.ts
import { z } from 'zod';

export const createListingSchema = z.object({
  propertyId: z.string().uuid(),
  price: z.number().positive().max(1_000_000_000),
  description: z.string().min(50).max(5000),
  listingType: z.enum(['sale', 'rent'])
});

export const createOfferSchema = z.object({
  listingId: z.string().uuid(),
  propertyId: z.string().uuid(),
  amount: z.number().positive().max(1_000_000_000),
  message: z.string().max(1000).optional(),
  financingType: z.enum(['cash', 'mortgage', 'maternal_capital'])
});

export const searchPropertiesSchema = z.object({
  city: z.string().optional(),
  districts: z.array(z.string()).optional(),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  rooms: z.array(z.number().int().positive()).optional(),
  areaMin: z.number().positive().optional(),
  areaMax: z.number().positive().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
});

// Middleware для валидации
export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
}
```

---

## 🎯 Оптимизация производительности

### Кэширование с Redis

```typescript
// backend/cache/redis.ts
import Redis from 'ioredis';

export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  // Кэширование паспорта объекта
  async cachePropertyPassport(cadastralNumber: string, data: any, ttl = 3600) {
    const key = `property:${cadastralNumber}`;
    await this.redis.setex(key, ttl, JSON.stringify(data));
  }

  async getPropertyPassport(cadastralNumber: string): Promise<any | null> {
    const key = `property:${cadastralNumber}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Кэширование результатов поиска
  async cacheSearchResults(queryHash: string, results: any[], ttl = 300) {
    const key = `search:${queryHash}`;
    await this.redis.setex(key, ttl, JSON.stringify(results));
  }

  async getSearchResults(queryHash: string): Promise<any[] | null> {
    const key = `search:${queryHash}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Инвалидация кэша при обновлении
  async invalidateProperty(cadastralNumber: string) {
    const key = `property:${cadastralNumber}`;
    await this.redis.del(key);
  }

  // Pub/Sub для real-time обновлений
  async publishOfferUpdate(propertyId: string, offer: any) {
    await this.redis.publish(`offers:${propertyId}`, JSON.stringify(offer));
  }

  subscribeToOffers(propertyId: string, callback: (offer: any) => void) {
    const subscriber = this.redis.duplicate();
    subscriber.subscribe(`offers:${propertyId}`);
    subscriber.on('message', (channel, message) => {
      callback(JSON.parse(message));
    });
    return subscriber;
  }
}
```

### Database Query Optimization

```sql
-- Индексы для быстрого поиска
CREATE INDEX CONCURRENTLY idx_listings_price_status 
ON listings(price, status) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_properties_rooms_area 
ON properties(rooms, area);

-- Составной индекс для геопоиска
CREATE INDEX CONCURRENTLY idx_addresses_city_geom 
ON addresses(city) 
INCLUDE (geom);

-- Partial index для активных офферов
CREATE INDEX CONCURRENTLY idx_offers_active 
ON offers(property_id, amount DESC) 
WHERE status = 'pending';

-- Материализованное представление для аналитики
CREATE MATERIALIZED VIEW district_analytics AS
SELECT 
  a.region as district,
  COUNT(DISTINCT p.id) as total_properties,
  COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'active') as active_listings,
  AVG(l.price / p.area) as avg_price_per_sqm,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY l.price) as median_price,
  COUNT(DISTINCT t.id) FILTER (WHERE t.transaction_date > NOW() - INTERVAL '30 days') as sales_last_month,
  AVG(EXTRACT(EPOCH FROM (t.transaction_date - l.created_at)) / 86400) as avg_days_to_sell
FROM addresses a
JOIN properties p ON p.address_id = a.id
LEFT JOIN listings l ON l.property_id = p.id
LEFT JOIN transactions t ON t.property_id = p.id
WHERE a.city = 'Москва'
GROUP BY a.region;

-- Обновление материализованного представления каждый час
CREATE INDEX ON district_analytics(district);
REFRESH MATERIALIZED VIEW CONCURRENTLY district_analytics;
```

### Elasticsearch для полнотекстового поиска

```typescript
// backend/search/elasticsearch.ts
import { Client } from '@elastic/elasticsearch';

export class SearchService {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL
    });
  }

  async indexProperty(property: Property) {
    await this.client.index({
      index: 'properties',
      id: property.id,
      document: {
        cadastral_number: property.cadastralNumber,
        address: property.address.fullAddress,
        district: property.address.region,
        city: property.address.city,
        rooms: property.rooms,
        area: property.area,
        price: property.currentListing?.price,
        description: property.currentListing?.description,
        location: {
          lat: property.address.lat,
          lon: property.address.lng
        },
        building_type: property.building.buildingType,
        build_year: property.building.buildYear,
        status: property.currentListing?.status
      }
    });
  }

  async searchProperties(query: SearchQuery) {
    const must: any[] = [];
    const filter: any[] = [];

    // Полнотекстовый поиск
    if (query.text) {
      must.push({
        multi_match: {
          query: query.text,
          fields: ['address^3', 'district^2', 'description'],
          fuzziness: 'AUTO'
        }
      });
    }

    // Фильтры
    if (query.priceMin || query.priceMax) {
      filter.push({
        range: {
          price: {
            gte: query.priceMin,
            lte: query.priceMax
          }
        }
      });
    }

    if (query.rooms?.length) {
      filter.push({
        terms: { rooms: query.rooms }
      });
    }

    // Геопоиск
    if (query.bounds) {
      filter.push({
        geo_bounding_box: {
          location: {
            top_left: {
              lat: query.bounds.ne.lat,
              lon: query.bounds.sw.lng
            },
            bottom_right: {
              lat: query.bounds.sw.lat,
              lon: query.bounds.ne.lng
            }
          }
        }
      });
    }

    const result = await this.client.search({
      index: 'properties',
      body: {
        query: {
          bool: { must, filter }
        },
        sort: [
          { _score: 'desc' },
          { price: 'asc' }
        ],
        from: (query.page - 1) * query.limit,
        size: query.limit
      }
    });

    return {
      total: result.hits.total,
      properties: result.hits.hits.map(hit => hit._source)
    };
  }
}
```

---

## 📱 Real-time Updates (WebSocket)

```typescript
// backend/websocket/server.ts
import { Server } from 'socket.io';
import { verifyToken } from '../auth/jwt';

export class WebSocketServer {
  private io: Server;

  constructor(httpServer: any) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupHandlers();
  }

  private setupMiddleware() {
    // Аутентификация через WebSocket
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        const user = verifyToken(token);
        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  private setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.data.user.userId}`);

      // Подписка на обновления объекта
      socket.on('subscribe:property', (propertyId: string) => {
        socket.join(`property:${propertyId}`);
        console.log(`User subscribed to property ${propertyId}`);
      });

      // Отписка от объекта
      socket.on('unsubscribe:property', (propertyId: string) => {
        socket.leave(`property:${propertyId}`);
      });

      // Подписка на район
      socket.on('subscribe:district', (district: string) => {
        socket.join(`district:${district}`);
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.data.user.userId}`);
      });
    });
  }

  // Отправка обновления о новом оффере
  broadcastNewOffer(propertyId: string, offer: Offer) {
    this.io.to(`property:${propertyId}`).emit('offer:new', offer);
  }

  // Обновление цены листинга
  broadcastPriceUpdate(propertyId: string, newPrice: number) {
    this.io.to(`property:${propertyId}`).emit('price:updated', { newPrice });
  }

  // Новый листинг в районе
  broadcastNewListing(district: string, listing: Listing) {
    this.io.to(`district:${district}`).emit('listing:new', listing);
  }

  // Продажа объекта
  broadcastPropertySold(propertyId: string, salePrice: number) {
    this.io.to(`property:${propertyId}`).emit('property:sold', { salePrice });
  }
}
```

### Frontend WebSocket Client

```typescript
// frontend/services/websocket.ts
import { io, Socket } from 'socket.io-client';

export class WebSocketClient {
  private socket: Socket | null = null;
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  connect() {
    this.socket = io(import.meta.env.VITE_WS_URL, {
      auth: { token: this.token }
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return this.socket;
  }

  subscribeToProperty(propertyId: string, callbacks: {
    onNewOffer?: (offer: Offer) => void;
    onPriceUpdate?: (price: number) => void;
    onSold?: (salePrice: number) => void;
  }) {
    if (!this.socket) return;

    this.socket.emit('subscribe:property', propertyId);

    if (callbacks.onNewOffer) {
      this.socket.on('offer:new', callbacks.onNewOffer);
    }

    if (callbacks.onPriceUpdate) {
      this.socket.on('price:updated', (data) => callbacks.onPriceUpdate!(data.newPrice));
    }

    if (callbacks.onSold) {
      this.socket.on('property:sold', (data) => callbacks.onSold!(data.salePrice));
    }
  }

  unsubscribeFromProperty(propertyId: string) {
    if (!this.socket) return;
    
    this.socket.emit('unsubscribe:property', propertyId);
    this.socket.off('offer:new');
    this.socket.off('price:updated');
    this.socket.off('property:sold');
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// React Hook для WebSocket
export function usePropertyUpdates(propertyId: string) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [price, setPrice] = useState<number | null>(null);
  const [isSold, setIsSold] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const ws = new WebSocketClient(token);
    ws.connect();

    ws.subscribeToProperty(propertyId, {
      onNewOffer: (offer) => {
        setOffers(prev => [...prev, offer]);
        // Показать уведомление
        toast.success('Новый оффер на объект!');
      },
      onPriceUpdate: (newPrice) => {
        setPrice(newPrice);
        toast.info('Цена обновлена');
      },
      onSold: (salePrice) => {
        setIsSold(true);
        toast.warning(`Объект продан за ${salePrice.toLocaleString('ru-RU')} ₽`);
      }
    });

    return () => {
      ws.unsubscribeFromProperty(propertyId);
      ws.disconnect();
    };
  }, [propertyId]);

  return { offers, price, isSold };
}
```

---

## 🎨 UI/UX Best Practices

### Адаптивный дизайн

```typescript
// tailwind.config.js
export default {
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        }
      }
    }
  }
}
```

### Accessibility (A11y)

```typescript
// components/AccessibleButton.tsx
interface AccessibleButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
}

export function AccessibleButton({ 
  onClick, 
  children, 
  ariaLabel, 
  disabled 
}: AccessibleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors duration-200"
      tabIndex={disabled ? -1 : 0}
    >
      {children}
    </button>
  );
}

// Keyboard navigation для карты
export function useKeyboardNavigation(properties: Property[]) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(properties.length - 1, prev + 1));
          break;
        case 'Enter':
          // Открыть выбранный объект
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [properties.length]);

  return selectedIndex;
}
```

### Оптимизация изображений

```typescript
// components/OptimizedImage.tsx
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className 
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Генерация WebP версии
    const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp');
    
    // Проверка поддержки WebP
    const img = new Image();
    img.onload = () => {
      setImageSrc(webpSrc);
      setIsLoading(false);
    };
    img.onerror = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.src = webpSrc;
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
      />
    </div>
  );
}
```

---

## 📈 SEO Оптимизация

### Server-Side Rendering (Next.js)

```typescript
// pages/property/[cadastralNumber].tsx
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { cadastralNumber } = context.params!;
  
  try {
    const response = await fetch(
      `${process.env.API_URL}/api/properties/${cadastralNumber}`
    );
    const property = await response.json();

    return {
      props: {
        property,
        seo: {
          title: `${property.address.fullAddress} - ${property.rooms}-комн. квартира, ${property.area} м²`,
          description: `Купить ${property.rooms}-комнатную квартиру по адресу ${property.address.fullAddress}. Площадь ${property.area} м², этаж ${property.floor}/${property.totalFloors}. Цена ${property.currentListing?.price.toLocaleString('ru-RU')} ₽`,
          image: property.photos[0]?.url,
          url: `https://truedom.ru/property/${cadastralNumber}`
        }
      }
    };
  } catch (error) {
    return { notFound: true };
  }
};

export default function PropertyPage({ property, seo }) {
  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:image" content={seo.image} />
        <meta property="og:url" content={seo.url} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={seo.url} />
      </Head>
      
      <PropertyPassport property={property} />
    </>
  );
}
```

### Sitemap Generation

```typescript
// scripts/generate-sitemap.ts
import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: 'https://truedom.ru' });
  const writeStream = createWriteStream('./public/sitemap.xml');
  
  sitemap.pipe(writeStream);

  // Статические страницы
  sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });
  sitemap.write({ url: '/search', changefreq: 'daily', priority: 0.9 });

  // Динамические страницы объектов
  const properties = await fetchAllProperties();
  
  for (const property of properties) {
    sitemap.write({
      url: `/property/${property.cadastralNumber}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: property.updatedAt
    });
  }

  // Районы
  const districts = await fetchDistricts();
  
  for (const district of districts) {
    sitemap.write({
      url: `/district/${district.slug}`,
      changefreq: 'daily',
      priority: 0.7
    });
  }

  sitemap.end();
  await streamToPromise(sitemap);
  console.log('Sitemap generated successfully');
}

generateSitemap();
```

---

## 🧪 Тестирование

### Unit Tests (Jest + React Testing Library)

```typescript
// __tests__/components/OfferBook.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { OfferBook } from '@/components/property/OfferBook';

describe('OfferBook', () => {
  const mockOffers = [
    { id: '1', amount: 44500000, buyerId: 'buyer1', status: 'pending' },
    { id: '2', amount: 43800000, buyerId: 'buyer2', status: 'pending' },
  ];

  it('renders offers sorted by amount', () => {
    render(
      <OfferBook 
        propertyId="prop1"
        listingPrice={45000000}
        offers={mockOffers}
      />
    );

    const offerElements = screen.getAllByText(/₽/);
    expect(offerElements[0]).toHaveTextContent('44 500 000 ₽');
    expect(offerElements[1]).toHaveTextContent('43 800 000 ₽');
  });

  it('highlights top offer', () => {
    render(
      <OfferBook 
        propertyId="prop1"
        listingPrice={45000000}
        offers={mockOffers}
      />
    );

    const topOffer = screen.getByText('44 500 000 ₽').closest('div');
    expect(topOffer).toHaveClass('border-green-200');
  });

  it('calls onCreateOffer when button clicked', () => {
    const handleCreateOffer = jest.fn();
    
    render(
      <OfferBook 
        propertyId="prop1"
        listingPrice={45000000}
        offers={mockOffers}
        onCreateOffer={handleCreateOffer}
      />
    );

    const button = screen.getByText('Предложить свою цену');
    fireEvent.click(button);
    
    expect(handleCreateOffer).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

```typescript
// __tests__/api/offers.test.ts
import request from 'supertest';
import { app } from '@/app';
import { createTestUser, createTestProperty } from './helpers';

describe('Offers API', () => {
  let authToken: string;
  let propertyId: string;

  beforeAll(async () => {
    const user = await createTestUser({ role: 'buyer' });
    authToken = user.token;
    
    const property = await createTestProperty();
    propertyId = property.id;
  });

  describe('POST /api/offers', () => {
    it('creates a new offer', async () => {
      const response = await request(app)
        .post('/api/offers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          propertyId,
          amount: 44000000,
          financingType: 'mortgage'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.amount).toBe(44000000);
    });

    it('rejects offer without authentication', async () => {
      const response = await request(app)
        .post('/api/offers')
        .send({
          propertyId,
          amount: 44000000
        });

      expect(response.status).toBe(401);
    });

    it('validates offer amount', async () => {
      const response = await request(app)
        .post('/api/offers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          propertyId,
          amount: -1000
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/offers/property/:propertyId', () => {
    it('returns all offers for property', async () => {
      const response = await request(app)
        .get(`/api/offers/property/${propertyId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('offers');
      expect(Array.isArray(response.body.offers)).toBe(true);
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/property-search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Property Search', () => {
  test('should search and filter properties', async ({ page }) => {
    await page.goto('/');

    // Ввод поискового запроса
    await page.fill('input[placeholder*="адрес"]', 'Москва, Остоженка');
    await page.press('input[placeholder*="адрес"]', 'Enter');

    // Ожидание результатов
    await page.waitForSelector('[data-testid="property-card"]');

    // Проверка наличия результатов
    const properties = await page.$$('[data-testid="property-card"]');
    expect(properties.length).toBeGreaterThan(0);

    // Применение фильтра по цене
    await page.click('button:has-text("Цена")');
    await page.fill('input[name="priceMin"]', '30000000');
    await page.fill('input[name="priceMax"]', '50000000');
    await page.click('button:has-text("Применить")');

    // Проверка фильтрации
    await page.waitForTimeout(1000);
    const filteredProperties = await page.$$('[data-testid="property-card"]');
    expect(filteredProperties.length).toBeLessThanOrEqual(properties.length);
  });

  test('should open property passport', async ({ page }) => {
    await page.goto('/search');
    
    // Клик на первый объект
    await page.click('[data-testid="property-card"]:first-child');

    // Проверка открытия паспорта
    await expect(page).toHaveURL(/\/property\/.+/);
    await expect(page.locator('h1')).toContainText('ул.');
    
    // Проверка наличия ключевых элементов
    await expect(page.locator('[data-testid="offer-book"]')).toBeVisible();
    await expect(page.locator('[data-testid="price-history"]')).toBeVisible();
  });

  test('should create an offer', async ({ page }) => {
    // Авторизация
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Переход к объекту
    await page.goto('/property/77:01:0001001:1234');

    // Открытие модалки оффера
    await page.click('button:has-text("Предложить свою цену")');

    // Заполнение формы
    await page.fill('input[placeholder*="цена"]', '44000000');
    await page.click('button[type="submit"]');

    // Проверка успеха
    await expect(page.locator('text=Оффер отправлен')).toBeVisible();
  });
});
```

---

## 📊 Аналитика и Метрики

### Google Analytics 4

```typescript
// utils/analytics.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Отслеживание просмотров страниц
export const pageview = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Отслеживание событий
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Специфичные события для TrueDom
export const trackPropertyView = (propertyId: string, price: number) => {
  event({
    action: 'view_property',
    category: 'Property',
    label: propertyId,
    value: price
  });
};

export const trackOfferCreated = (propertyId: string, amount: number) => {
  event({
    action: 'create_offer',
    category: 'Offer',
    label: propertyId,
    value: amount
  });
};

export const trackSearch = (query: string, resultsCount: number) => {
  event({
    action: 'search',
    category: 'Search',
    label: query,
    value: resultsCount
  });
};

export const trackPriceEstimation = (estimatedPrice: number) => {
  event({
    action: 'estimate_price',
    category: 'AI',
    value: estimatedPrice
  });
};
```

### Yandex.Metrica

```typescript
// utils/yandex-metrica.ts
export const YM_ID = process.env.NEXT_PUBLIC_YM_ID;

export const ymReachGoal = (target: string, params?: any) => {
  if (typeof window.ym !== 'undefined') {
    window.ym(YM_ID, 'reachGoal', target, params);
  }
};

// Цели для Яндекс.Метрики
export const ymGoals = {
  propertyView: (propertyId: string) => {
    ymReachGoal('property_view', { property_id: propertyId });
  },
  
  offerCreated: (amount: number) => {
    ymReachGoal('offer_created', { amount });
  },
  
  contactAgent: (agentId: string) => {
    ymReachGoal('contact_agent', { agent_id: agentId });
  },
  
  scheduleViewing: (propertyId: string) => {
    ymReachGoal('schedule_viewing', { property_id: propertyId });
  },
  
  registration: (role: string) => {
    ymReachGoal('registration', { role });
  }
};
```

---

## 🔄 Миграции и Обновления

### Database Migrations (Prisma)

```typescript
// prisma/migrations/001_initial_schema.sql
-- Создание базовой схемы
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ... (SQL из раздела Database Schema)

// prisma/migrations/002_add_liquidity_score.sql
-- Добавление поля liquidity_score
ALTER TABLE properties 
ADD COLUMN liquidity_score DECIMAL(3, 2) DEFAULT 5.0;

-- Индекс для быстрой сортировки по ликвидности
CREATE INDEX idx_properties_liquidity ON properties(liquidity_score DESC);

// prisma/migrations/003_add_buyer_requests.sql
-- Таблица запросов покупателей
CREATE TABLE buyer_requests (
  -- ... (из раздела Database Schema)
);
```

### Версионирование API

```typescript
// backend/routes/v1/index.ts
import express from 'express';
import propertiesRouter from './properties';
import offersRouter from './offers';

const router = express.Router();

router.use('/properties', propertiesRouter);
router.use('/offers', offersRouter);

export default router;

// backend/routes/v2/index.ts
// Новая версия API с breaking changes
import express from 'express';
import propertiesRouter from './properties';

const router = express.Router();

// v2 может иметь другую структуру ответов
router.use('/properties', propertiesRouter);

export default router;

// backend/app.ts
import v1Router from './routes/v1';
import v2Router from './routes/v2';

app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// Редирект с /api на последнюю версию
app.use('/api', v2Router);
```

---

## 📚 Документация API (Swagger)

```typescript
// backend/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TrueDom API',
      version: '1.0.0',
      description: 'Real Estate Data Infrastructure API',
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.truedom.ru/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/**/*.ts'],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

/**
 * @swagger
 * /properties/{cadastralNumber}:
 *   get:
 *     summary: Get property passport
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: cadastralNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Cadastral number of the property
 *     responses:
 *       200:
 *         description: Property passport data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertyPassport'
 *       404:
 *         description: Property not found
 */
```

---

## 🎯 Roadmap и Будущие Фичи

### Phase 1: MVP (3-4 месяца)
- ✅ Digital Property Passport
- ✅ Buyer Offer System
- ✅ Basic search and filters
- ✅ Map visualization
- ✅ Rosreestr integration
- ✅ AI price estimation

### Phase 2: Growth (6 месяцев)
- 📱 Mobile apps (iOS/Android)
- 🤖 Advanced AI recommendations
- 💬 In-app messaging
- 📊 Advanced analytics dashboard
- 🏢 Agency CRM features
- 💳 Payment integration

### Phase 3: Scale (12 месяцев)
- 🌍 Expansion to other cities
- 🏗️ Developer portal
- 📈 Market predictions
- 🔗 Blockchain property registry
- 🤝 Partnership integrations
- 📺 Virtual property tours (VR)

---

## 📞 Поддержка и Контакты

Для вопросов по реализации:
- Email: dev@truedom.ru
- Telegram: @truedom_dev
- GitHub: github.com/truedom/platform

---

**Последнее обновление:** 5 марта 2026
**Версия документа:** 1.0.0
