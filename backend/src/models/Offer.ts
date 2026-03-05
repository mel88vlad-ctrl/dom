import { pool } from '../config/database';
import { Offer, OfferCreateInput, OfferStatus } from '../types';

export class OfferModel {
  /**
   * Создать оффер
   */
  static async create(data: OfferCreateInput, buyerId: string): Promise<Offer> {
    const query = `
      INSERT INTO offers (
        listing_id, property_id, buyer_id, amount, message, financing_type
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      data.listing_id,
      data.property_id,
      buyerId,
      data.amount,
      data.message || null,
      data.financing_type || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Найти оффер по ID
   */
  static async findById(id: string): Promise<Offer | null> {
    const query = 'SELECT * FROM offers WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Получить офферы по объекту (для стакана офферов)
   */
  static async findByPropertyId(propertyId: string): Promise<Offer[]> {
    const query = `
      SELECT 
        o.*,
        u.first_name,
        u.last_name
      FROM offers o
      LEFT JOIN users u ON o.buyer_id = u.id
      WHERE o.property_id = $1 AND o.status = 'pending'
      ORDER BY o.amount DESC
    `;
    const result = await pool.query(query, [propertyId]);
    return result.rows;
  }

  /**
   * Получить офферы покупателя
   */
  static async findByBuyerId(
    buyerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ offers: Offer[]; total: number }> {
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        o.*,
        json_build_object(
          'id', p.id,
          'cadastral_number', p.cadastral_number,
          'rooms', p.rooms,
          'area', p.area,
          'address', json_build_object(
            'city', a.city,
            'street', a.street,
            'house_number', a.house_number
          )
        ) as property
      FROM offers o
      LEFT JOIN properties p ON o.property_id = p.id
      LEFT JOIN addresses a ON p.address_id = a.id
      WHERE o.buyer_id = $1
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) FROM offers WHERE buyer_id = $1
    `;

    const [offersResult, countResult] = await Promise.all([
      pool.query(query, [buyerId, limit, offset]),
      pool.query(countQuery, [buyerId]),
    ]);

    return {
      offers: offersResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  /**
   * Получить офферы по листингу
   */
  static async findByListingId(listingId: string): Promise<Offer[]> {
    const query = `
      SELECT * FROM offers 
      WHERE listing_id = $1 AND status = 'pending'
      ORDER BY amount DESC
    `;
    const result = await pool.query(query, [listingId]);
    return result.rows;
  }

  /**
   * Обновить статус оффера
   */
  static async updateStatus(
    id: string,
    status: OfferStatus
  ): Promise<Offer | null> {
    const query = `
      UPDATE offers 
      SET status = $1, responded_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0] || null;
  }

  /**
   * Принять оффер
   */
  static async accept(id: string): Promise<Offer | null> {
    return this.updateStatus(id, 'accepted');
  }

  /**
   * Отклонить оффер
   */
  static async reject(id: string): Promise<Offer | null> {
    return this.updateStatus(id, 'rejected');
  }

  /**
   * Отозвать оффер (покупатель)
   */
  static async withdraw(id: string, buyerId: string): Promise<Offer | null> {
    const query = `
      UPDATE offers 
      SET status = 'withdrawn'
      WHERE id = $1 AND buyer_id = $2 AND status = 'pending'
      RETURNING *
    `;
    const result = await pool.query(query, [id, buyerId]);
    return result.rows[0] || null;
  }

  /**
   * Получить статистику офферов по объекту
   */
  static async getPropertyOfferStats(propertyId: string): Promise<{
    total_offers: number;
    pending_offers: number;
    top_offer: number | null;
    average_offer: number | null;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_offers,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_offers,
        MAX(amount) FILTER (WHERE status = 'pending') as top_offer,
        AVG(amount) FILTER (WHERE status = 'pending') as average_offer
      FROM offers
      WHERE property_id = $1
    `;
    const result = await pool.query(query, [propertyId]);
    return result.rows[0];
  }

  /**
   * Проверить, есть ли активный оффер от покупателя на объект
   */
  static async hasActiveOffer(
    buyerId: string,
    propertyId: string
  ): Promise<boolean> {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM offers 
        WHERE buyer_id = $1 AND property_id = $2 AND status = 'pending'
      )
    `;
    const result = await pool.query(query, [buyerId, propertyId]);
    return result.rows[0].exists;
  }

  /**
   * Удалить оффер
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM offers WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
