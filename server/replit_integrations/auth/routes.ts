import type { Express } from "express";
import { authStorage } from "./storage";

// Register auth-specific routes
// Note: For non-Replit deployments, auth routes are handled in simpleAuth.ts
// This file is used when running on Replit with full OpenID auth
export function registerAuthRoutes(app: Express): void {
  // Only register Replit-specific auth routes if on Replit
  if (!process.env.REPL_ID) {
    // Routes already registered in simpleAuth.ts
    return;
  }

  // Get current authenticated user (Replit version)
  app.get("/api/auth/user", async (req: any, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
