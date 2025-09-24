import pool from '../config/database.js';
import { hashPassword } from '../utils/auth.js';

export interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: 'admin' | 'user' | 'store_owner';
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  address: string;
  role?: 'admin' | 'user' | 'store_owner';
}

export const createUser = async (userData: CreateUserData): Promise<User> => {
  const client = await pool.connect();
  
  try {
    const hashedPassword = await hashPassword(userData.password);
    const role = userData.role || 'user';
    
    const result = await client.query(
      `INSERT INTO users (name, email, password_hash, address, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, address, role, created_at, updated_at`,
      [userData.name, userData.email, hashedPassword, userData.address, role]
    );
    
    return result.rows[0];
  } finally {
    client.release();
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

export const getUserWithPassword = async (email: string): Promise<(User & { password_hash: string }) | null> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT id, name, email, password_hash, address, role, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

export const getAllUsers = async (filters?: { 
  name?: string; 
  email?: string; 
  address?: string; 
  role?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}): Promise<User[]> => {
  const client = await pool.connect();
  
  try {
    let query = 'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;
    
    if (filters?.name) {
      paramCount++;
      query += ` AND name ILIKE $${paramCount}`;
      params.push(`%${filters.name}%`);
    }
    
    if (filters?.email) {
      paramCount++;
      query += ` AND email ILIKE $${paramCount}`;
      params.push(`%${filters.email}%`);
    }
    
    if (filters?.address) {
      paramCount++;
      query += ` AND address ILIKE $${paramCount}`;
      params.push(`%${filters.address}%`);
    }
    
    if (filters?.role) {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      params.push(filters.role);
    }

    const sortBy = filters?.sortBy || 'name';
    const sortOrder = filters?.sortOrder || 'ASC';
    const allowedSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    
    if (allowedSortFields.includes(sortBy)) {
      query += ` ORDER BY ${sortBy} ${sortOrder}`;
    }
    
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
};

export const updateUserPassword = async (userId: number, newPassword: string): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const hashedPassword = await hashPassword(newPassword);
    await client.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, userId]
    );
  } finally {
    client.release();
  }
};

export const getUserStats = async (): Promise<{ totalUsers: number; totalStores: number; totalRatings: number }> => {
  const client = await pool.connect();
  
  try {
    const [usersResult, storesResult, ratingsResult] = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM users'),
      client.query('SELECT COUNT(*) as count FROM stores'),
      client.query('SELECT COUNT(*) as count FROM ratings')
    ]);
    
    return {
      totalUsers: parseInt(usersResult.rows[0].count),
      totalStores: parseInt(storesResult.rows[0].count),
      totalRatings: parseInt(ratingsResult.rows[0].count)
    };
  } finally {
    client.release();
  }
};
