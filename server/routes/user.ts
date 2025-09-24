import { RequestHandler } from "express";
import { getStoresWithUserRatings, submitRating, getUserRating } from "../services/ratingService.js";
import { updateUserPassword } from "../services/userService.js";
import { validatePassword } from "../utils/auth.js";

export const getStoresForUser: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { name, address, sortBy, sortOrder } = req.query;
    
    const filters = {
      name: name as string,
      address: address as string,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as 'ASC' | 'DESC') || 'ASC'
    };

    const stores = await getStoresWithUserRatings(user.id, filters);
    res.json({ stores });
  } catch (error) {
    console.error('Get stores for user error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const submitStoreRating: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { storeId, rating } = req.body;

    if (!storeId || !rating) {
      return res.status(400).json({ error: "Store ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const ratingResult = await submitRating(user.id, parseInt(storeId), parseInt(rating));

    res.json({
      message: "Rating submitted successfully",
      rating: ratingResult
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserStoreRating: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { storeId } = req.params;

    const rating = await getUserRating(user.id, parseInt(storeId));
    res.json({ rating });
  } catch (error) {
    console.error('Get user rating error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePassword: RequestHandler = async (req, res) => {
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
    console.error('Update password error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};
