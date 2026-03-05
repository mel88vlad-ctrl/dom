import { pool } from '../config/database';
import { Property, PropertyWithDetails, PropertySearchParams } from '../types';

export class PropertyModel {
  /**
   * Создать объект недвижимости с адресом и зданием
   */
  static async create(data: any): Promise<PropertyWithDetails> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Создаем адрес
      const addressQuery = `
        INSERT INTO addresses (region, city, street, house_number, building, lat, lng, full_address, geom)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ST_SetSRID(ST_MakePoint($7, $6), 4326))
        RETURNING *
      `;
      const addressValues = [
        data.address.region,
        data.address.city,
        data.address.street,
        data.address.house_number,
        data.address.building || null,
        data.address.lat || null,
        data.address.lng || null,
        `${data.address.city}, ${data.address.street}, ${data.address.house_number}`,
      ];
      const addressResult = await client.query(addressQuery, addressValues);
      const address = addressResult.rows[0];

      // 2. Создаем здание (если данные предоставлены)
      let building = null;
      if (data.building) {
        const buildingQuery = `
          INSERT INTO buildings (
            address_id, build_year, building_type, floors, materials,
            condition, parking, elevator_count, has_passenger_elevator, has_cargo_elevator
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *
        `;
        const buildingValues = [
          address.id,
          data.building.build_year || null,
          data.building.building_type || null,
          data.building.floors || null,
          data.building.materials || null,
          data.building.condition || null,
          data.building.parking || null,
          data.building.elevator_count || 0,
          data.building.has_passenger_elevator || false,
          data.building.has_cargo_elevator || false,
        ];
        const buildingResult = await client.query(buildingQuery, buildingValues);
        building = buildingResult.rows[0];
      }

      // 3. Создаем объект недвижимости
      const propertyQuery = `
        INSERT INTO properties (
          cadastral_number, address_id, building_id, rooms, area, floor, total_floors,
          ceiling_height, renovation_status, has_balcony, has_loggia, bathroom, view_description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;
      const propertyValues = [
        data.cadastral_number,
        address.id,
        building?.id || null,
        data.rooms,
        data.area,
        data.floor,
        data.total_floors,
        data.ceiling_height || null,
        data.renovation_status || null,
        data.has_balcony || false,
        data.has_loggia || false,
        data.bathroom || null,
        data.view_description || null,
      ];
      const propertyResult = await client.query(propertyQuery, propertyValues);
      const property = propertyResult.rows[0];

      await client.query('COMMIT');

      return {
        ...property,
        address,
        building,
        photos: [],
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Найти объект по ID с полной информацией
   */
  static async findById(id: string): Promise<PropertyWithDetails | null> {
    const query = `
      SELECT 
        p.*,
        json_build_object(
          'id', a.id,
          'region', a.region,
          'city', a.city,
          'street', a.street,
          'house_number', a.house_number,
          'building', a.building,
          'lat', a.lat,
          'lng', a.lng,
          'full_address', a.full_address
        ) as address,
        json_build_object(
          'id', b.id,
          'build_year', b.build_year,
          'building_type', b.building_type,
          'floors', b.floors,
          'materials', b.materials,
          'condition', b.condition,
          'parking', b.parking,
          'elevator_count', b.elevator_count,
          'rating', b.rating
        ) as building,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ph.id,
              'url', ph.url,
              'thumbnail_url', ph.thumbnail_url,
              'order_index', ph.order_index,
              'is_main', ph.is_main
            ) ORDER BY ph.order_index
          ) FILTER (WHERE ph.id IS NOT NULL),
          '[]'
        ) as photos,
        (
          SELECT json_build_object(
            'id', l.id,
            'price', l.price,
            'status', l.status,
            'listing_type', l.listing_type,
            'created_at', l.created_at
          )
          FROM listings l
          WHERE l.property_id = p.id AND l.status = 'active'
          ORDER BY l.created_at DESC
          LIMIT 1
        ) as current_listing,
        (SELECT COUNT(*) FROM offers o WHERE o.property_id = p.id AND o.status = 'pending') as offers_count,
        (SELECT MAX(amount) FROM offers o WHERE o.property_id = p.id AND o.status = 'pending') as top_offer
      FROM properties p
      LEFT JOIN addresses a ON p.address_id = a.id
      LEFT JOIN buildings b ON p.building_id = b.id
      LEFT JOIN property_photos ph ON p.id = ph.property_id
      WHERE p.id = $1
      GROUP BY p.id, a.id, b.id
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Найти объект по кадастровому номеру
   */
  static async findByCadastralNumber(cadastralNumber: string): Promise<PropertyWithDetails | null> {
    const query = `
      SELECT 
        p.*,
        json_build_object(
          'id', a.id,
          'region', a.region,
          'city', a.city,
          'street', a.street,
          'house_number', a.house_number,
          'full_address', a.full_address,
          'lat', a.lat,
          'lng', a.lng
        ) as address,
        json_build_object(
          'id', b.id,
          'build_year', b.build_year,
          'building_type', b.building_type,
          'floors', b.floors,
          'condition', b.condition,
          'rating', b.rating
        ) as building
      FROM properties p
      LEFT JOIN addresses a ON p.address_id = a.id
      LEFT JOIN buildings b ON p.building_id = b.id
      WHERE p.cadastral_number = $1
    `;

    const result = await pool.query(query, [cadastralNumber]);
    return result.rows[0] || null;
  }

  /**
   * Поиск объектов с фильтрами
   */
  static async search(params: PropertySearchParams): Promise<{
    properties: PropertyWithDetails[];
    total: number;
  }> {
    const {
      city,
      districts,
      price_min,
      price_max,
      rooms,
      area_min,
      area_max,
      floor_min,
      floor_max,
      renovation_status,
      building_type,
      bounds,
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = params;

    const offset = (page - 1) * limit;
    const values: any[] = [];
    let paramIndex = 1;

    // Базовый запрос
    let query = `
      SELECT 
        p.*,
        json_build_object(
          'id', a.id,
          'city', a.city,
          'street', a.street,
          'house_number', a.house_number,
          'lat', a.lat,
          'lng', a.lng
        ) as address,
        json_build_object(
          'id', b.id,
          'building_type', b.building_type,
          'rating', b.rating
        ) as building,
        l.price as listing_price,
        l.id as listing_id
      FROM properties p
      LEFT JOIN addresses a ON p.address_id = a.id
      LEFT JOIN buildings b ON p.building_id = b.id
      LEFT JOIN listings l ON p.id = l.property_id AND l.status = 'active'
      WHERE 1=1
    `;

    let countQuery = `
      SELECT COUNT(DISTINCT p.id)
      FROM properties p
      LEFT JOIN addresses a ON p.address_id = a.id
      LEFT JOIN buildings b ON p.building_id = b.id
      LEFT JOIN listings l ON p.id = l.property_id AND l.status = 'active'
      WHERE 1=1
    `;

    // Фильтры
    if (city) {
      query += ` AND a.city = $${paramIndex}`;
      countQuery += ` AND a.city = $${paramIndex}`;
      values.push(city);
      paramIndex++;
    }

    if (districts && districts.length > 0) {
      query += ` AND a.region = ANY($${paramIndex})`;
      countQuery += ` AND a.region = ANY($${paramIndex})`;
      values.push(districts);
      paramIndex++;
    }

    if (price_min) {
      query += ` AND l.price >= $${paramIndex}`;
      countQuery += ` AND l.price >= $${paramIndex}`;
      values.push(price_min);
      paramIndex++;
    }

    if (price_max) {
      query += ` AND l.price <= $${paramIndex}`;
      countQuery += ` AND l.price <= $${paramIndex}`;
      values.push(price_max);
      paramIndex++;
    }

    if (rooms && rooms.length > 0) {
      query += ` AND p.rooms = ANY($${paramIndex})`;
      countQuery += ` AND p.rooms = ANY($${paramIndex})`;
      values.push(rooms);
      paramIndex++;
    }

    if (area_min) {
      query += ` AND p.area >= $${paramIndex}`;
      countQuery += ` AND p.area >= $${paramIndex}`;
      values.push(area_min);
      paramIndex++;
    }

    if (area_max) {
      query += ` AND p.area <= $${paramIndex}`;
      countQuery += ` AND p.area <= $${paramIndex}`;
      values.push(area_max);
      paramIndex++;
    }

    if (floor_min) {
      query += ` AND p.floor >= $${paramIndex}`;
      countQuery += ` AND p.floor >= $${paramIndex}`;
      values.push(floor_min);
      paramIndex++;
    }

    if (floor_max) {
      query += ` AND p.floor <= $${paramIndex}`;
      countQuery += ` AND p.floor <= $${paramIndex}`;
      values.push(floor_max);
      paramIndex++;
    }

    if (renovation_status && renovation_status.length > 0) {
      query += ` AND p.renovation_status = ANY($${paramIndex})`;
      countQuery += ` AND p.renovation_status = ANY($${paramIndex})`;
      values.push(renovation_status);
      paramIndex++;
    }

    if (building_type && building_type.length > 0) {
      query += ` AND b.building_type = ANY($${paramIndex})`;
      countQuery += ` AND b.building_type = ANY($${paramIndex})`;
      values.push(building_type);
      paramIndex++;
    }

    // Геопоиск
    if (bounds) {
      query += ` AND a.lat BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      query += ` AND a.lng BETWEEN $${paramIndex + 2} AND $${paramIndex + 3}`;
      countQuery += ` AND a.lat BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      countQuery += ` AND a.lng BETWEEN $${paramIndex + 2} AND $${paramIndex + 3}`;
      values.push(bounds.sw.lat, bounds.ne.lat, bounds.sw.lng, bounds.ne.lng);
      paramIndex += 4;
    }

    // Сортировка
    const sortColumn = sort_by === 'price' ? 'l.price' : `p.${sort_by}`;
    query += ` ORDER BY ${sortColumn} ${sort_order.toUpperCase()}`;

    // Пагинация
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const [propertiesResult, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, values.slice(0, -2)), // Убираем limit и offset для count
    ]);

    return {
      properties: propertiesResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  /**
   * Обновить объект
   */
  static async update(id: string, data: Partial<Property>): Promise<Property | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return null;
    }

    values.push(id);
    const query = `
      UPDATE properties 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Удалить объект (soft delete)
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'UPDATE properties SET is_active = FALSE WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
