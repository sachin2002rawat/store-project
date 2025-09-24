import { RequestHandler } from "express";
import { getStoresByOwner, getStoreRatingsByUser } from "../services/storeService.js";
import { updateUserPassword } from "../services/userService.js";
import { validatePassword } from "../utils/auth.js";

export const getOwnerStores: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const stores = await getStoresByOwner(user.id);
    res.json({ stores });
  } catch (error) {
    console.error('Get owner stores error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getStoreRatings: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { storeId } = req.params;

    const ownerStores = await getStoresByOwner(user.id);
    const storeExists = ownerStores.find(store => store.id === parseInt(storeId));
    
    if (!storeExists) {
      return res.status(403).json({ error: "Access denied to this store" });
    }

    const ratings = await getStoreRatingsByUser(parseInt(storeId));
    const averageRating = storeExists.average_rating;
    const totalRatings = storeExists.total_ratings;

    res.json({ 
      ratings,
      averageRating,
      totalRatings,
      store: storeExists
    });
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateStoreOwnerPassword: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: "New password is required" });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    await updateUserPassword(user.id, newPassword);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error('Update store owner password error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};
