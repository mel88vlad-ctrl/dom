import { ReactNode } from 'react';

export interface Section {
  id: string;
  title: string;
  content: ReactNode;
}

export const documentationData: Section[] = [
  {
    id: '1-concept',
    title: '1. Platform Concept',
    content: (
      <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">TrueDom: Real Estate Data Infrastructure</h2>
        
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800">
          <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 mb-3">Core Principle: Digital Property Passport</h3>
          <p className="mb-4">TrueDom is NOT a simple classifieds board like Avito or Cian. It is a comprehensive real estate data infrastructure.</p>
          <p>Every apartment, house, or property in Russia has a permanent digital page on the platform called the <strong>"Digital Property Passport"</strong>. This page exists even if the property is NOT currently for sale.</p>
          <p className="mt-4 font-bold text-indigo-800 dark:text-indigo-200">Listings are temporary. Property passports are permanent.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">🚀 Viral Growth Mechanisms</h4>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>AI Property Price Estimation:</strong> Users enter their address/params to instantly get market price, demand metrics, and average sale time. Highly shareable.</li>
              <li><strong>District Liquidity Rankings:</strong> Auto-generated SEO pages showing which Moscow districts sell fastest.</li>
              <li><strong>Buyer Demand Heatmaps:</strong> Visualizing where people want to live right now.</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">🔗 Single Property Model</h4>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Every property is linked to a <strong>Cadastral Number</strong>.</li>
              <li>One property = One canonical object in the database.</li>
              <li>Eliminates duplicate listings. The property page becomes a "marketplace page" showing price history, active agents, and buyer offers.</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: '2-passport',
    title: '2. Digital Property Passport',
    content: (
      <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Digital Property Passport Structure</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">📋 Basic Information</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Address & Cadastral number</li>
              <li>Building year & type</li>
              <li>Floor & Number of rooms</li>
              <li>Area & Ceiling height</li>
              <li>Renovation status</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">🏢 Building Information</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Building condition</li>
              <li>Elevator information & Parking</li>
              <li>Number of floors & Construction materials</li>
              <li>Managing company</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">📈 Market Analytics & Price History</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Historical sale prices & listing prices</li>
              <li>Estimated market value & price range</li>
              <li>Price growth over time</li>
              <li>Average price per m² in building & district</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">⚡ Property Liquidity & Transactions</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Previous sales & listing durations</li>
              <li>Average time to sell</li>
              <li>Demand/supply ratio</li>
              <li>Number of buyers currently searching in the area</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 mt-6">
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-3">Infrastructure & Ratings</h3>
          <p className="text-sm mb-4">Each passport automatically displays nearby infrastructure (schools, hospitals, parks, metro, supermarkets) with distance and travel time.</p>
          <p className="text-sm">Residents and visitors can rate building quality, noise levels, infrastructure, transportation, safety, and schools, aggregating into a <strong>Building Score</strong>.</p>
        </div>
      </div>
    )
  },
  {
    id: '3-roles',
    title: '3. User Roles & Trust',
    content: (
      <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">User Roles & Trust System</h2>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">System Roles</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Buyer', 'Renter', 'Property Owner', 'Real Estate Agent', 'Agency', 'Developer', 'Advertiser', 'Admin'].map(role => (
              <div key={role} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center font-medium text-sm border border-gray-200 dark:border-gray-700">
                {role}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-green-50 dark:bg-green-900/10 p-6 rounded-xl border border-green-200 dark:border-green-900/50">
          <h3 className="text-xl font-bold text-green-900 dark:text-green-400 mb-4">🛡️ Document Verification (Crucial for Russia)</h3>
          <p className="mb-4 text-sm">Owners can upload verified documents to receive trust badges. Integrations with <strong>Gosuslugi</strong> and <strong>Rosreestr</strong> ensure authenticity.</p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Property ownership proof</li>
            <li>Rosreestr extract</li>
            <li>Floor plan & Technical passport</li>
            <li>Renovation documents</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: '4-flows',
    title: '4. Interaction Flows',
    content: (
      <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Core Interaction Flows</h2>

        <div className="space-y-6">
          <div className="border-l-4 border-purple-500 pl-5 py-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Flow 1: Buyer Offer System</h3>
            <p className="text-sm mt-2 mb-2">Inside each property passport page, buyers can submit price offers, creating a transparent demand market.</p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono mt-2">
              <p>Listing price: 6,200,000 RUB</p>
              <p className="mt-2 text-gray-500">Buyer offers:</p>
              <ul className="list-disc pl-5">
                <li>5,800,000 RUB</li>
                <li>5,900,000 RUB</li>
                <li>6,000,000 RUB</li>
              </ul>
            </div>
            <p className="text-sm mt-2">The seller can see all offers and respond.</p>
          </div>

          <div className="border-l-4 border-orange-500 pl-5 py-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Flow 2: Multiple Agents Model</h3>
            <p className="text-sm mt-2 mb-2">Open listing model allowing multiple agents to attach listings to the same property passport.</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Agents compete to find a buyer.</li>
              <li>The system tracks which agent brought the buyer.</li>
              <li>Automated commission logic and performance metrics.</li>
            </ul>
          </div>

          <div className="border-l-4 border-blue-500 pl-5 py-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Flow 3: AI Property Price Estimation</h3>
            <p className="text-sm mt-2 mb-2">Users enter: address, area, rooms, floor.</p>
            <p className="text-sm">System returns: estimated price, confidence interval, expected time to sell, local demand indicators.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: '5-schema',
    title: '5. Database Schema',
    content: (
      <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Database Schema (PostgreSQL)</h2>
        
        <div className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed">
          <pre>{`-- Core Entities
TABLE properties {
  id UUID PK
  cadastral_number VARCHAR UNIQUE
  address_id UUID FK -> addresses.id
  building_id UUID FK -> buildings.id
  owner_id UUID FK -> owners.id
  rooms INT, area DECIMAL, floor INT
  ceiling_height DECIMAL, renovation_status ENUM
  created_at TIMESTAMP
}

TABLE buildings {
  id UUID PK
  build_year INT, building_type ENUM
  floors INT, materials ENUM
  condition ENUM, parking ENUM
  managing_company VARCHAR
}

TABLE addresses {
  id UUID PK
  region VARCHAR, city VARCHAR
  street VARCHAR, house_number VARCHAR
  lat DECIMAL, lng DECIMAL
  geom GEOMETRY(Point, 4326)
}

TABLE owners {
  id UUID PK
  user_id UUID FK -> users.id
  is_verified BOOLEAN
}

-- Market Mechanics
TABLE listings {
  id UUID PK
  property_id UUID FK -> properties.id
  agent_id UUID FK -> users.id (Nullable)
  price DECIMAL
  status ENUM('active', 'sold', 'withdrawn')
}

TABLE offers {
  id UUID PK
  listing_id UUID FK -> listings.id
  property_id UUID FK -> properties.id
  buyer_id UUID FK -> users.id
  amount DECIMAL
  status ENUM('pending', 'accepted', 'rejected')
  created_at TIMESTAMP
}

TABLE transactions {
  id UUID PK
  property_id UUID FK -> properties.id
  buyer_id UUID FK
  seller_id UUID FK
  price DECIMAL
  date DATE
}

-- Metadata & Trust
TABLE documents {
  id UUID PK
  property_id UUID FK -> properties.id
  type ENUM('ownership', 'rosreestr', 'floor_plan', 'tech_passport')
  file_url VARCHAR
  is_verified BOOLEAN
}

TABLE ratings {
  id UUID PK
  building_id UUID FK -> buildings.id
  user_id UUID FK -> users.id
  category ENUM('quality', 'noise', 'infrastructure', 'safety')
  score INT
}

TABLE infrastructure {
  id UUID PK
  type ENUM('school', 'hospital', 'park', 'metro', 'supermarket')
  name VARCHAR
  geom GEOMETRY(Point, 4326)
}`}</pre>
        </div>
      </div>
    )
  },
  {
    id: '6-architecture',
    title: '6. System Architecture',
    content: (
      <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">High-Scale Architecture</h2>
        <p>Designed to handle 1,000,000+ listings and 10,000,000+ users with high real-time activity.</p>

        <div className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed">
          <pre>{`[ Web / iOS / Android Clients ]
           | (HTTPS / WSS)
[ Cloudflare CDN & WAF ] -> DDoS Protection, Static Cache
           |
[ API Gateway (Kong) ] -> Rate Limiting, Auth Routing
           |
+---------------------------------------------------+
|               KUBERNETES CLUSTER                  |
|                                                   |
|  [Auth Service]      [Property Passport Service]  |
|  (Node.js)           (Go - High throughput)       |
|                                                   |
|  [Matching Engine]   [Real-time Chat & Offers]    |
|  (Python/ML)         (Node.js + Socket.io)        |
|                                                   |
|  [Map & Geo Service] [Verification Service]       |
|  (Go + PostGIS)      (Python - Rosreestr API)     |
+---------------------------------------------------+
           |                      |
    [ Apache Kafka ]       [ Redis Cluster ]
    (Event Streaming)      (Caching & Pub/Sub)
           |                      |
+--------------------+   +--------------------+
| PostgreSQL Cluster |   | Elasticsearch      |
| (Primary Data)     |   | (Search & Filters) |
+--------------------+   +--------------------+`}</pre>
        </div>
      </div>
    )
  },
  {
    id: '7-ui',
    title: '7. UI Modules & Map',
    content: (
      <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Key UI Modules</h2>
        
        <ul className="space-y-4">
          <li className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <strong className="text-indigo-600 dark:text-indigo-400 text-lg block mb-2">1. Map Visualization</strong>
            On the platform map, users see: properties, buyers looking in the area, demand heatmaps, and liquidity indicators.
          </li>
          <li className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <strong className="text-indigo-600 dark:text-indigo-400 text-lg block mb-2">2. Digital Property Passport Page</strong>
            The central hub for a property. Shows basic info, building info, price history, market analytics, transaction history, liquidity, verified documents, and the live <strong>Buyer Offer System</strong>.
          </li>
          <li className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <strong className="text-indigo-600 dark:text-indigo-400 text-lg block mb-2">3. Admin Panel</strong>
            Admin tools for: property verification, fraud detection, listing moderation, and document review.
          </li>
        </ul>
      </div>
    )
  },
  {
    id: '8-monetization',
    title: '8. Monetization Model',
    content: (
      <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Monetization & Advertising System</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Advertising Cabinet</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Featured listings & search boosting</li>
              <li>Map advertising</li>
              <li>Banner ads</li>
              <li>Developer promotion</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Service Marketplace</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Mortgage lead generation</li>
              <li>Renovation services</li>
              <li>Insurance</li>
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">B2B: Agents & Agencies</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>SaaS Subscription:</strong> Premium CRM features, advanced market analytics, and access to the "Buyer Demand" database.</li>
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Data API</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Selling aggregated, anonymized market data to developers and banks.</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
];
