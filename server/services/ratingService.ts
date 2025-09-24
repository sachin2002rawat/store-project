import pool from '../config/database.js';

export interface Rating {
  id: number;
  user_id: number;
  store_id: number;
  rating: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserStoreRating {
  store_id: number;
  store_name: string;
  store_address: string;
  user_rating: number | null;
  average_rating: number;
  total_ratings: number;
}

export const submitRating = async (userId: number, storeId: number, rating: number): Promise<Rating> => {
  const client = await pool.connect();
  
  try {

    const existingRating = await client.query(
      'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );
    
    let result;
    if (existingRating.rows.length > 0) {
      result = await client.query(
        `UPDATE ratings 
         SET rating = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $2 AND store_id = $3 
         RETURNING id, user_id, store_id, rating, created_at, updated_at`,
        [rating, userId, storeId]
      );
    } else {
      result = await client.query(
        `INSERT INTO ratings (user_id, store_id, rating) 
         VALUES ($1, $2, $3) 
         RETURNING id, user_id, store_id, rating, created_at, updated_at`,
        [userId, storeId, rating]
      );
    }
    
    return result.rows[0];
  } finally {
    client.release();
  }
};

export const getUserRating = async (userId: number, storeId: number): Promise<Rating | null> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT id, user_id, store_id, rating, created_at, updated_at FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

export const getStoresWithUserRatings = async (userId: number, filters?: {
  name?: string;
  address?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}): Promise<UserStoreRating[]> => {
  const client = await pool.connect();
  
  try {
    let query = `
      SELECT 
        s.id as store_id,
        s.name as store_name,
        s.address as store_address,
        r.rating as user_rating,
        sr.average_rating,
        sr.total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id AND r.user_id = $1
      LEFT JOIN store_ratings sr ON s.id = sr.id
      WHERE 1=1
    `;
    
    const params: any[] = [userId];
    let paramCount = 1;
    
    if (filters?.name) {
      paramCount++;
      query += ` AND s.name ILIKE $${paramCount}`;
      params.push(`%${filters.name}%`);
    }
    
    if (filters?.address) {
      paramCount++;
      query += ` AND s.address ILIKE $${paramCount}`;
      params.push(`%${filters.address}%`);
    }
    
    const sortBy = filters?.sortBy || 'store_name';
    const sortOrder = filters?.sortOrder || 'ASC';
    const allowedSortFields = ['store_name', 'store_address', 'average_rating', 'user_rating'];
    
    if (allowedSortFields.includes(sortBy)) {
      let sortField = sortBy;
      if (sortBy === 'store_name') sortField = 's.name';
      if (sortBy === 'store_address') sortField = 's.address';
      
      query += ` ORDER BY ${sortField} ${sortOrder}`;
    }
    
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
};

export const deleteRating = async (userId: number, storeId: number): Promise<boolean> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'DELETE FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );
    
    return result.rowCount! > 0;
  } finally {
    client.release();
  }
};
