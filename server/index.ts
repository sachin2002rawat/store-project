import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { initializeDatabase } from "./config/database.js";
import { authenticateToken, requireRole } from "./utils/auth.js";

import { registerUser, loginUser, getCurrentUser } from "./routes/auth.js";
import { getDashboardStats, createNewUser, getUsers, createNewStore, getStores } from "./routes/admin.js";
import { getStoresForUser, submitStoreRating, getUserStoreRating, updatePassword } from "./routes/user.js";
import { getOwnerStores, getStoreRatings, updateStoreOwnerPassword } from "./routes/store.js";

export function createServer() {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginEmbedderPolicy: false
  }));
  
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : true,
    credentials: true
  }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: "Too many requests from this IP, please try again later."
  });
  app.use(limiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many authentication attempts, please try again later."
  });

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  initializeDatabase().catch(console.error);

  app.post("/api/auth/register", authLimiter, registerUser);
  app.post("/api/auth/login", authLimiter, loginUser);

  app.get("/api/auth/me", authenticateToken, getCurrentUser);

  app.get("/api/admin/stats", authenticateToken, requireRole(['admin']), getDashboardStats);
  app.post("/api/admin/users", authenticateToken, requireRole(['admin']), createNewUser);
  app.get("/api/admin/users", authenticateToken, requireRole(['admin']), getUsers);
  app.post("/api/admin/stores", authenticateToken, requireRole(['admin']), createNewStore);
  app.get("/api/admin/stores", authenticateToken, requireRole(['admin']), getStores);

  app.get("/api/user/stores", authenticateToken, requireRole(['user', 'admin']), getStoresForUser);
  app.post("/api/user/ratings", authenticateToken, requireRole(['user', 'admin']), submitStoreRating);
  app.get("/api/user/ratings/:storeId", authenticateToken, requireRole(['user', 'admin']), getUserStoreRating);
  app.patch("/api/user/password", authenticateToken, requireRole(['user', 'admin']), updatePassword);

  app.get("/api/store/my-stores", authenticateToken, requireRole(['store_owner']), getOwnerStores);
  app.get("/api/store/:storeId/ratings", authenticateToken, requireRole(['store_owner']), getStoreRatings);
  app.patch("/api/store/password", authenticateToken, requireRole(['store_owner']), updateStoreOwnerPassword);

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  });

  return app;
}

if (import.meta.env?.DEV) {
  const app = createServer();
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
