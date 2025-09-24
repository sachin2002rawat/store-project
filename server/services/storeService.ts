import pool from '../config/database.js';

export interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  owner_id: number;
  average_rating: number;
  total_ratings: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateStoreData {
  name: string;
  email: string;
  address: string;
  owner_id: number;
}

export const createStore = async (storeData: CreateStoreData): Promise<Store> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `INSERT INTO stores (name, email, address, owner_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, address, owner_id, created_at, updated_at`,
      [storeData.name, storeData.email, storeData.address, storeData.owner_id]
    );

    const storeWithRatings = await getStoreById(result.rows[0].id);
    return storeWithRatings!;
  } finally {
    client.release();
  }
};

export const getStoreById = async (id: number): Promise<Store | null> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM store_ratings WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

export const getAllStores = async (filters?: { 
  name?: string; 
  address?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}): Promise<Store[]> => {
  const client = await pool.connect();
  
  try {
    let query = 'SELECT * FROM store_ratings WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;
    
    if (filters?.name) {
      paramCount++;
      query += ` AND name ILIKE $${paramCount}`;
      params.push(`%${filters.name}%`);
    }
    
    if (filters?.address) {
      paramCount++;
      query += ` AND address ILIKE $${paramCount}`;
      params.push(`%${filters.address}%`);
    }
    const sortBy = filters?.sortBy || 'name';
    const sortOrder = filters?.sortOrder || 'ASC';
    const allowedSortFields = ['name', 'email', 'address', 'average_rating', 'total_ratings'];
    
    if (allowedSortFields.includes(sortBy)) {
      query += ` ORDER BY ${sortBy} ${sortOrder}`;
    }
    
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
};

export const getStoresByOwner = async (ownerId: number): Promise<Store[]> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM store_ratings WHERE owner_id = $1',
      [ownerId]
    );
    
    return result.rows;
  } finally {
    client.release();
  }
};

export const getStoreRatingsByUser = async (storeId: number): Promise<Array<{
  user_id: number;
  name: string;
  email: string;
  rating: number;
  created_at: Date;
}>> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT r.user_id, u.name, u.email, r.rating, r.created_at
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [storeId]
    );
    
    return result.rows;
  } finally {
    client.release();
  }
};
