import { RequestHandler } from "express";
import { createUser, getUserWithPassword, getUserByEmail } from "../services/userService.js";
import { comparePassword, generateToken, validatePassword, validateEmail } from "../utils/auth.js";

export const registerUser: RequestHandler = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

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

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    const user = await createUser({ name, email, password, address, role: 'user' });
    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const loginUser: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await getUserWithPassword(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCurrentUser: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const userData = await getUserByEmail(user.email);
    
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        address: userData.address,
        role: userData.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};
