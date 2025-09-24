import { RequestHandler } from "express";
import { createUser, getAllUsers, getUserStats, updateUserPassword } from "../services/userService.js";
import { createStore, getAllStores } from "../services/storeService.js";
import { validatePassword, validateEmail } from "../utils/auth.js";

export const getDashboardStats: RequestHandler = async (req, res) => {
  try {
    const stats = await getUserStats();
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createNewUser: RequestHandler = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Validation
    if (!name || name.length < 20 || name.length > 60) {
      return res.status(400).json({ error: "Name must be 20-60 characters long" });
    }

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    if (!address || address.length > 400) {
      return res.status(400).json({ error: "Address must be provided and max 400 characters" });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    if (!role || !['admin', 'user', 'store_owner'].includes(role)) {
      return res.status(400).json({ error: "Valid role is required" });
    }

    const user = await createUser({ name, email, password, address, role });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: "User with this email already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUsers: RequestHandler = async (req, res) => {
  try {
    const { name, email, address, role, sortBy, sortOrder } = req.query;
    
    const filters = {
      name: name as string,
      email: email as string,
      address: address as string,
      role: role as string,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as 'ASC' | 'DESC') || 'ASC'
    };

    const users = await getAllUsers(filters);
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createNewStore: RequestHandler = async (req, res) => {
  try {
    const { name, email, address, owner_email } = req.body;

    // Validation
    if (!name || !email || !address || !owner_email) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!validateEmail(email) || !validateEmail(owner_email)) {
      return res.status(400).json({ error: "Valid emails are required" });
    }

    if (address.length > 400) {
      return res.status(400).json({ error: "Address must be max 400 characters" });
    }

    // Find the store owner
    const { getUserByEmail } = await import("../services/userService.js");
    const owner = await getUserByEmail(owner_email);
    
    if (!owner) {
      return res.status(404).json({ error: "Store owner not found" });
    }

    if (owner.role !== 'store_owner') {
      return res.status(400).json({ error: "User must have store_owner role" });
    }

    const store = await createStore({ name, email, address, owner_id: owner.id });

    res.status(201).json({
      message: "Store created successfully",
      store
    });
  } catch (error: any) {
    console.error('Create store error:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: "Store with this email already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getStores: RequestHandler = async (req, res) => {
  try {
    const { name, address, sortBy, sortOrder } = req.query;
    
    const filters = {
      name: name as string,
      address: address as string,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as 'ASC' | 'DESC') || 'ASC'
    };

    const stores = await getAllStores(filters);
    res.json({ stores });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};
