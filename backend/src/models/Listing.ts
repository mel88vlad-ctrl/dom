import { pool } from '../config/database';
import { Listing, ListingCreateInput } from '../types';

export class ListingModel {
  /**
   * Создать листинг
   */
  static async create(data: ListingCreateInput, agentId?: string): Promise<Listing> {
    const query = `
      INSERT INTO listings (
        property_id, agent_id, listing_type, price, description
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      data.property_id,
      agentId || null,
      data.listing_type,
      data.price,
      data.description || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Найти листинг по ID
   */
  static async findById(id: string): Promise<Listing | null> {
    const query = 'SELECT * FROM listings WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Получить активные листинги объекта
   */
  static async findByPropertyId(propertyId: string): Promise<Listing[]> {
    const query = `
      SELECT * FROM listings 
      WHERE property_id = $1 AND status = 'active'
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [propertyId]);
    return result.rows;
  }

  /**
   * Получить листинги агента
   */
  static async findByAgentId(
    agentId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ listings: Listing[]; total: number }> {
    const offset = (page - 1) * limit;

    const query = `
      SELECT * FROM listings 
      WHERE agent_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) FROM listings WHERE agent_id = $1
    `;

    const [listingsResult, countResult] = await Promise.all([
      pool.query(query, [agentId, limit, offset]),
      pool.query(countQuery, [agentId]),
    ]);

    return {
      listings: listingsResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  /**
   * Обновить листинг
   */
  static async update(
    id: string,
    data: Partial<Omit<Listing, 'id' | 'created_at' | 'property_id'>>
  ): Promise<Listing | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE listings 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Увеличить счетчик просмотров
   */
  static async incrementViews(id: string): Promise<void> {
    const query = 'UPDATE listings SET views_count = views_count + 1 WHERE id = $1';
    await pool.query(query, [id]);
  }

  /**
   * Отметить как проданный
   */
  static async markAsSold(id: string): Promise<Listing | null> {
    const query = `
      UPDATE listings 
      SET status = 'sold', sold_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Снять с публикации
   */
  static async withdraw(id: string): Promise<Listing | null> {
    const query = `
      UPDATE listings 
      SET status = 'withdrawn'
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Удалить листинг
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM listings WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
