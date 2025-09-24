import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const initializeDatabase = async () => {
  const client = await pool.connect();
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL CHECK (LENGTH(name) >= 20 AND LENGTH(name) <= 60),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        address TEXT CHECK (LENGTH(address) <= 400),
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user', 'store_owner')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        address TEXT NOT NULL CHECK (LENGTH(address) <= 400),
        owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, store_id)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);
      CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_store ON ratings(store_id);
    `);

    await client.query(`
      CREATE OR REPLACE VIEW store_ratings AS
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as average_rating,
        COUNT(r.rating) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id, s.name, s.email, s.address, s.owner_id;
    `);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
