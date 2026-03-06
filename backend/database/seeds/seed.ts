/**
 * Seed Script for TrueDom Database
 * Заполняет базу данных тестовыми данными
 */

import { pool } from '../../src/config/database';
import { hashPassword } from '../../src/utils/auth';

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await pool.query('TRUNCATE TABLE offers, listings, property_photos, transactions, properties, buildings, addresses, owners, agents, agencies, buyer_requests, documents, building_ratings, users CASCADE');
    console.log('✅ Database cleared\n');

    // 1. Create test users
    console.log('👤 Creating users...');
    
    const password_hash = await hashPassword('password123');
    
    const users = await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
      VALUES 
        ('buyer@truedom.ru', $1, 'Алексей', 'Петров', 'buyer', true),
        ('seller@truedom.ru', $1, 'Мария', 'Иванова', 'seller', true),
        ('agent@truedom.ru', $1, 'Дмитрий', 'Смирнов', 'agent', true)
      RETURNING id, email, role
    `, [password_hash]);
    
    console.log(`✅ Created ${users.rows.length} users`);
    const [buyer, seller, agent] = users.rows;

    // 2. Create addresses (реальные адреса Москвы)
    console.log('\n📍 Creating addresses...');
    
    const addresses = await pool.query(`
      INSERT INTO addresses (region, city, street, house_number, building, lat, lng)
      VALUES 
        ('Хамовники', 'Москва', 'ул. Остоженка', '11', NULL, 55.7413, 37.5982),
        ('Пресненский', 'Москва', 'Пресненская наб.', '8', '1', 55.7476, 37.5394),
        ('Гагаринский', 'Москва', 'Ленинский пр-т', '38', NULL, 55.7082, 37.5751),
        ('Хамовники', 'Москва', 'ул. Пречистенка', '20', NULL, 55.7451, 37.5953),
        ('Арбат', 'Москва', 'Новый Арбат', '15', NULL, 55.7532, 37.5893),
        ('Тверской', 'Москва', 'Тверская ул.', '12', '1', 55.7642, 37.6066),
        ('Басманный', 'Москва', 'ул. Маросейка', '9', NULL, 55.7577, 37.6344),
        ('Якиманка', 'Москва', 'Болотная наб.', '11', '1', 55.7423, 37.6156),
        ('Замоскворечье', 'Москва', 'Пятницкая ул.', '25', NULL, 55.7398, 37.6289),
        ('Таганский', 'Москва', 'Гончарная ул.', '7', NULL, 55.7456, 37.6512)
      RETURNING id, street, house_number
    `);
    
    console.log(`✅ Created ${addresses.rows.length} addresses`);

    // 3. Create buildings
    console.log('\n🏢 Creating buildings...');
    
    const buildings = await pool.query(`
      INSERT INTO buildings (address_id, build_year, building_type, floors, condition, parking, elevator_count, rating)
      VALUES 
        ($1, 1912, 'brick', 7, 'excellent', 'underground', 1, 8.9),
        ($2, 2007, 'monolith', 70, 'excellent', 'underground', 4, 9.2),
        ($3, 1975, 'panel', 22, 'good', 'ground', 2, 7.5),
        ($4, 1890, 'brick', 5, 'excellent', 'none', 0, 8.7),
        ($5, 2015, 'monolith', 25, 'excellent', 'underground', 3, 9.0),
        ($6, 1905, 'brick', 6, 'excellent', 'underground', 1, 9.1),
        ($7, 1880, 'brick', 4, 'excellent', 'none', 0, 8.8),
        ($8, 2010, 'monolith', 18, 'excellent', 'underground', 2, 8.6),
        ($9, 1920, 'brick', 5, 'excellent', 'none', 0, 8.5),
        ($10, 1960, 'stalin', 7, 'excellent', 'ground', 1, 8.9)
      RETURNING id
    `, addresses.rows.map(a => a.id));
    
    console.log(`✅ Created ${buildings.rows.length} buildings`);

    // 4. Create properties
    console.log('\n🏠 Creating properties...');
    
    const properties = await pool.query(`
      INSERT INTO properties (
        cadastral_number, address_id, building_id, rooms, area, floor, total_floors,
        ceiling_height, renovation_status, has_balcony, has_loggia, bathroom
      )
      VALUES 
        ('77:01:0001001:1234', $1, $11, 3, 120, 4, 7, 3.2, 'euro', true, false, 'separate'),
        ('77:01:0001002:5678', $2, $12, 4, 155, 45, 70, 3.0, 'designer', true, true, 'combined'),
        ('77:01:0001003:9012', $3, $13, 2, 65, 12, 22, 2.7, 'cosmetic', true, false, 'combined'),
        ('77:01:0001004:3456', $4, $14, 2, 75, 3, 5, 3.0, 'euro', true, false, 'separate'),
        ('77:01:0001005:7890', $5, $15, 3, 95, 15, 25, 2.9, 'designer', true, true, 'separate'),
        ('77:01:0001006:2345', $6, $16, 3, 110, 5, 6, 3.1, 'euro', true, false, 'separate'),
        ('77:01:0001007:6789', $7, $17, 2, 85, 2, 4, 3.3, 'designer', false, false, 'separate'),
        ('77:01:0001008:1122', $8, $18, 2, 72, 10, 18, 2.8, 'cosmetic', true, false, 'combined'),
        ('77:01:0001009:3344', $9, $19, 1, 45, 3, 5, 3.0, 'euro', true, false, 'combined'),
        ('77:01:0001010:5566', $10, $20, 3, 105, 4, 7, 3.2, 'euro', true, true, 'separate')
      RETURNING id, cadastral_number, rooms, area
    `, [
      ...addresses.rows.map(a => a.id),
      ...buildings.rows.map(b => b.id)
    ]);
    
    console.log(`✅ Created ${properties.rows.length} properties`);

    // 5. Create listings
    console.log('\n📋 Creating listings...');
    
    const listings = await pool.query(`
      INSERT INTO listings (property_id, agent_id, listing_type, price, status, description)
      VALUES 
        ($1, $11, 'sale', 45000000, 'active', 'Прекрасная квартира в историческом центре Москвы на Остоженке'),
        ($2, $11, 'sale', 85000000, 'active', 'Видовая квартира в башне Москва-Сити с панорамными окнами'),
        ($3, $11, 'sale', 22500000, 'active', 'Уютная двушка на Ленинском проспекте'),
        ($4, $11, 'sale', 35000000, 'active', 'Квартира в доходном доме на Пречистенке'),
        ($5, $11, 'sale', 48000000, 'active', 'Современная квартира на Новом Арбате'),
        ($6, $11, 'sale', 52000000, 'active', 'Элитная квартира на Тверской улице'),
        ($7, $11, 'sale', 38000000, 'active', 'Историческая квартира на Маросейке'),
        ($8, $11, 'sale', 28000000, 'active', 'Квартира с видом на Кремль на Болотной набережной'),
        ($9, $11, 'sale', 18000000, 'active', 'Однокомнатная квартира на Пятницкой'),
        ($10, $11, 'sale', 42000000, 'active', 'Сталинка на Гончарной улице')
      RETURNING id, property_id, price
    `, [
      ...properties.rows.map(p => p.id),
      agent.id
    ]);
    
    console.log(`✅ Created ${listings.rows.length} listings`);

    // 6. Create offers
    console.log('\n💰 Creating offers...');
    
    const listing1 = listings.rows[0];
    const listing2 = listings.rows[1];
    const listing3 = listings.rows[2];
    const prop1 = properties.rows[0];
    const prop2 = properties.rows[1];
    const prop3 = properties.rows[2];
    
    const offers = await pool.query(`
      INSERT INTO offers (listing_id, property_id, buyer_id, amount, status, financing_type)
      VALUES 
        ($1, $2, $3, 44500000, 'pending', 'cash'),
        ($1, $2, $3, 43800000, 'pending', 'mortgage'),
        ($4, $5, $3, 80000000, 'pending', 'cash'),
        ($6, $7, $3, 23000000, 'pending', 'mortgage'),
        ($6, $7, $3, 22000000, 'pending', 'cash')
      RETURNING id, amount
    `, [listing1.id, prop1.id, buyer.id, listing2.id, prop2.id, listing3.id, prop3.id]);
    
    console.log(`✅ Created ${offers.rows.length} offers`);

    // 7. Create property photos
    console.log('\n📸 Creating property photos...');
    
    for (const prop of properties.rows) {
      await pool.query(`
        INSERT INTO property_photos (property_id, photo_url, is_main, order_index)
        VALUES 
          ($1, $2, true, 0),
          ($1, $3, false, 1)
      `, [
        prop.id,
        `https://picsum.photos/seed/apt${prop.id}/800/600`,
        `https://picsum.photos/seed/apt${prop.id}_2/800/600`
      ]);
    }
    
    const photoCount = properties.rows.length * 2;
    console.log(`✅ Created ${photoCount} photos`);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Users: ${users.rows.length}`);
    console.log(`   Addresses: ${addresses.rows.length}`);
    console.log(`   Buildings: ${buildings.rows.length}`);
    console.log(`   Properties: ${properties.rows.length}`);
    console.log(`   Listings: ${listings.rows.length}`);
    console.log(`   Offers: ${offers.rows.length}`);
    console.log(`   Photos: ${properties.rows.length * 2}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Buyer:  buyer@truedom.ru / password123');
    console.log('   Seller: seller@truedom.ru / password123');
    console.log('   Agent:  agent@truedom.ru / password123');
    console.log('');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seed
seed().catch(console.error);
