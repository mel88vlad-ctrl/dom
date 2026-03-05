import { pool } from '../config/database';
import { User, UserCreateInput, UserRole } from '../types';
import { hashPassword } from '../utils/auth';

export class UserModel {
  /**
   * Создать нового пользователя
   */
  static async create(data: UserCreateInput): Promise<User> {
    const password_hash = await hashPassword(data.password);
    
    const query = `
      INSERT INTO users (
        email, password_hash, phone, first_name, last_name, role
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      data.email,
      password_hash,
      data.phone || null,
      data.first_name || null,
      data.last_name || null,
      data.role || 'buyer',
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Найти пользователя по email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Найти пользователя по ID
   */
  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Обновить пользователя
   */
  static async update(
    id: string,
    data: Partial<Omit<User, 'id' | 'created_at' | 'password_hash'>>
  ): Promise<User | null> {
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
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Обновить последний вход
   */
  static async updateLastLogin(id: string): Promise<void> {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = $1';
    await pool.query(query, [id]);
  }

  /**
   * Удалить пользователя (soft delete)
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'UPDATE users SET is_active = FALSE WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Проверить существование email
   */
  static async emailExists(email: string): Promise<boolean> {
    const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)';
    const result = await pool.query(query, [email]);
    return result.rows[0].exists;
  }

  /**
   * Получить список пользователей с пагинацией
   */
  static async findAll(
    page: number = 1,
    limit: number = 20,
    role?: UserRole
  ): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM users WHERE is_active = TRUE';
    let countQuery = 'SELECT COUNT(*) FROM users WHERE is_active = TRUE';
    const values: any[] = [];
    let paramIndex = 1;

    if (role) {
      query += ` AND role = $${paramIndex}`;
      countQuery += ` AND role = $${paramIndex}`;
      values.push(role);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const [usersResult, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, role ? [role] : []),
    ]);

    return {
      users: usersResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }
}
