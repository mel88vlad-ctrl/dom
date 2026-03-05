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

    // 2. Create addresses
    console.log('\n📍 Creating addresses...');
    
    const addresses = await pool.query(`
      INSERT INTO addresses (region, city, street, house_number, building, lat, lng)
      VALUES 
        ('Хамовники', 'Москва', 'ул. Остоженка', '11', NULL, 55.741, 37.598),
        ('Пресненский', 'Москва', 'Пресненская наб.', '8', '1', 55.747, 37.539),
        ('Гагаринский', 'Москва', 'Ленинский пр-т', '38', NULL, 55.708, 37.575),
        ('Хамовники', 'Москва', 'ул. Пречистенка', '20', NULL, 55.745, 37.595),
        ('Арбат', 'Москва', 'Новый Арбат', '15', NULL, 55.753, 37.589)
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
        ($5, 2015, 'monolith', 25, 'excellent', 'underground', 3, 9.0)
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
        ('77:01:0001001:1234', $1, $6, 3, 120, 4, 7, 3.2, 'euro', true, false, 'separate'),
        ('77:01:0001002:5678', $2, $7, 4, 155, 45, 70, 3.0, 'designer', true, true, 'combined'),
        ('77:01:0001003:9012', $3, $8, 2, 65, 12, 22, 2.7, 'cosmetic', true, false, 'combined'),
        ('77:01:0001004:3456', $4, $9, 2, 75, 3, 5, 3.0, 'euro', true, false, 'separate'),
        ('77:01:0001005:7890', $5, $10, 3, 95, 15, 25, 2.9, 'designer', true, true, 'separate')
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
        ($1, $6, 'sale', 45000000, 'active', 'Прекрасная квартира в историческом центре Москвы'),
        ($2, $6, 'sale', 85000000, 'active', 'Видовая квартира в башне Москва-Сити'),
        ($3, $6, 'sale', 22500000, 'active', 'Уютная двушка рядом с парком'),
        ($4, $6, 'sale', 35000000, 'active', 'Квартира в доходном доме на Пречистенке'),
        ($5, $6, 'sale', 48000000, 'active', 'Современная квартира с панорамными окнами')
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
    
    const photos = await pool.query(`
      INSERT INTO property_photos (property_id, photo_url, is_main, order_index)
      VALUES 
        ($1, 'https://picsum.photos/seed/apt1/800/600', true, 0),
        ($1, 'https://picsum.photos/seed/apt1_2/800/600', false, 1),
        ($2, 'https://picsum.photos/seed/apt2/800/600', true, 0),
        ($3, 'https://picsum.photos/seed/apt3/800/600', true, 0),
        ($4, 'https://picsum.photos/seed/apt4/800/600', true, 0),
        ($5, 'https://picsum.photos/seed/apt5/800/600', true, 0)
      RETURNING id
    `, properties.rows.map(p => p.id));
    
    console.log(`✅ Created ${photos.rows.length} photos`);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Users: ${users.rows.length}`);
    console.log(`   Addresses: ${addresses.rows.length}`);
    console.log(`   Buildings: ${buildings.rows.length}`);
    console.log(`   Properties: ${properties.rows.length}`);
    console.log(`   Listings: ${listings.rows.length}`);
    console.log(`   Offers: ${offers.rows.length}`);
    console.log(`   Photos: ${photos.rows.length}`);
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
