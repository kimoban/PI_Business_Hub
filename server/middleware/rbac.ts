import { Request, Response, NextFunction, RequestHandler } from "express";
import { storage } from "../storage";

// Role hierarchy: admin > staff > guest > client
// admin can do everything
// staff can manage tasks, customers, forms but not business settings
// guest can view only
// client is for external customer portal access (future feature)

export type Role = "admin" | "staff" | "guest" | "client";

export interface PermissionConfig {
  roles: Role[];
  ownerCheck?: boolean; // Allow if user owns the resource
}

// Permission definitions for different actions
export const permissions: Record<string, PermissionConfig> = {
  // Business management
  "business:read": { roles: ["admin", "staff", "guest"] },
  "business:update": { roles: ["admin"] },
  "business:delete": { roles: ["admin"] },
  
  // User/profile management
  "profile:read": { roles: ["admin", "staff", "guest", "client"] },
  "profile:update": { roles: ["admin", "staff"], ownerCheck: true },
  "profile:manage_all": { roles: ["admin"] },
  
  // Task management
  "task:read": { roles: ["admin", "staff", "guest"] },
  "task:create": { roles: ["admin", "staff"] },
  "task:update": { roles: ["admin", "staff"], ownerCheck: true },
  "task:delete": { roles: ["admin", "staff"] },
  
  // Customer management
  "customer:read": { roles: ["admin", "staff", "guest"] },
  "customer:create": { roles: ["admin", "staff"] },
  "customer:update": { roles: ["admin", "staff"] },
  "customer:delete": { roles: ["admin"] },
  
  // Form management
  "form:read": { roles: ["admin", "staff", "guest"] },
  "form:create": { roles: ["admin", "staff"] },
  "form:update": { roles: ["admin", "staff"] },
  "form:delete": { roles: ["admin"] },
  "form:submit": { roles: ["admin", "staff", "guest", "client"] },
  
  // Reminder management
  "reminder:read": { roles: ["admin", "staff", "guest"] },
  "reminder:create": { roles: ["admin", "staff"] },
  "reminder:update": { roles: ["admin", "staff"], ownerCheck: true },
  "reminder:delete": { roles: ["admin", "staff"], ownerCheck: true },
  
  // Notification management
  "notification:read": { roles: ["admin", "staff", "guest", "client"] },
  "notification:manage": { roles: ["admin", "staff", "guest", "client"] },
  
  // Admin functions
  "admin:access": { roles: ["admin"] },
  "admin:manage_users": { roles: ["admin"] },
  "admin:view_analytics": { roles: ["admin"] },
};

// Middleware to load user profile and attach to request
export function loadUserProfile(): RequestHandler {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.isAuthenticated?.()) {
        return next();
      }
      
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return next();
      }
      
      const profile = await storage.getProfile(userId);
      if (profile) {
        req.profile = profile;
        if (profile.businessId) {
          req.businessId = profile.businessId;
        }
      }
      
      next();
    } catch (err) {
      console.error("Error loading user profile:", err);
      next();
    }
  };
}

// Middleware factory to require specific permission
export function requirePermission(permission: string): RequestHandler {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated?.()) {
        return res.status(401).json({ 
          error: "Unauthorized",
          message: "Authentication required" 
        });
      }
      
      // Load profile if not already loaded
      if (!req.profile) {
        const userId = req.user?.claims?.sub;
        if (userId) {
          req.profile = await storage.getProfile(userId);
        }
      }
      
      // Check if profile exists
      if (!req.profile) {
        return res.status(403).json({ 
          error: "Forbidden",
          message: "No profile found. Please complete onboarding." 
        });
      }
      
      // Get permission config
      const permConfig = permissions[permission];
      if (!permConfig) {
        console.warn(`Unknown permission: ${permission}`);
        return next(); // Allow if permission not defined (fail-open for dev)
      }
      
      const userRole = req.profile.role as Role;
      
      // Check if user's role is in allowed roles
      if (permConfig.roles.includes(userRole)) {
        return next();
      }
      
      // If owner check is enabled, check if user owns the resource
      // This would need to be implemented per-resource
      if (permConfig.ownerCheck) {
        // Owner check logic can be extended here
        // For now, it's handled in specific routes
      }
      
      return res.status(403).json({ 
        error: "Forbidden",
        message: `You don't have permission to ${permission.replace(':', ' ')}` 
      });
    } catch (err) {
      console.error("RBAC middleware error:", err);
      return res.status(500).json({ 
        error: "Server Error",
        message: "Error checking permissions" 
      });
    }
  };
}

// Middleware to require business membership
export function requireBusiness(): RequestHandler {
  return async (req: any, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated?.()) {
      return res.status(401).json({ 
        error: "Unauthorized",
        message: "Authentication required" 
      });
    }
    
    // Load profile if not already loaded
    if (!req.profile) {
      const userId = req.user?.claims?.sub;
      if (userId) {
        req.profile = await storage.getProfile(userId);
      }
    }
    
    if (!req.profile?.businessId) {
      return res.status(403).json({ 
        error: "Forbidden",
        message: "You must be part of a business to access this resource" 
      });
    }
    
    req.businessId = req.profile.businessId;
    next();
  };
}

// Middleware to check if user belongs to the business in the URL params
export function requireBusinessMatch(): RequestHandler {
  return async (req: any, res: Response, next: NextFunction) => {
    const urlBusinessId = Number(req.params.businessId);
    
    if (!req.profile?.businessId) {
      return res.status(403).json({ 
        error: "Forbidden",
        message: "You must be part of a business" 
      });
    }
    
    if (req.profile.businessId !== urlBusinessId) {
      return res.status(403).json({ 
        error: "Forbidden",
        message: "You can only access resources from your own business" 
      });
    }
    
    next();
  };
}

// Middleware to require admin role
export function requireAdmin(): RequestHandler {
  return requirePermission("admin:access");
}

// Helper function to check permission in code (not middleware)
export function hasPermission(role: Role, permission: string): boolean {
  const permConfig = permissions[permission];
  if (!permConfig) return false;
  return permConfig.roles.includes(role);
}

// Get all permissions for a role
export function getRolePermissions(role: Role): string[] {
  return Object.entries(permissions)
    .filter(([_, config]) => config.roles.includes(role))
    .map(([permission]) => permission);
}
