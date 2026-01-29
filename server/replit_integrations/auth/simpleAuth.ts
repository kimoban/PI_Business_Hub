import session from "express-session";
import type { Express } from "express";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";

// Check if we're running on Replit
const isReplit = !!process.env.REPL_ID;

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use PostgreSQL session store if DATABASE_URL is available
  let store;
  if (process.env.DATABASE_URL) {
    try {
      const pgStore = connectPg(session);
      store = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        ttl: sessionTtl,
        tableName: "sessions",
        errorLog: (err) => {
          console.error("Session store error:", err);
        },
      });
      console.log("Using PostgreSQL session store");
    } catch (err) {
      console.error("Failed to create PostgreSQL session store:", err);
      console.log("Falling back to memory session store");
    }
  } else {
    console.log("No DATABASE_URL, using memory session store");
  }

  return session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // For Render: secure cookies work with their HTTPS, but need sameSite for cross-origin
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // If running on Replit, use full OpenID auth
  if (isReplit) {
    const { setupReplitAuth } = await import("./replitAuth");
    await setupReplitAuth(app);
    return;
  }

  // For non-Replit deployments (Render, etc.), use demo auth
  // This creates a simple demo user for prototype purposes
  
  // Demo login - creates a test user session
  app.get("/api/login", async (req, res) => {
    const demoUserId = "demo-user-001";
    
    // Upsert demo user in database
    try {
      await authStorage.upsertUser({
        id: demoUserId,
        email: "demo@example.com",
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: null,
      });
    } catch (err) {
      console.log("Demo user upsert (may already exist):", err);
    }

    // Set session
    (req.session as any).user = {
      claims: {
        sub: demoUserId,
        email: "demo@example.com",
        first_name: "Demo",
        last_name: "User",
      },
    };

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        // Still try to redirect - session might work with memory store
        return res.redirect("/?auth=error");
      }
      console.log("Session saved successfully for demo user");
      res.redirect("/dashboard");
    });
  });

  app.get("/api/callback", (req, res) => {
    res.redirect("/");
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) console.error("Session destroy error:", err);
      res.redirect("/");
    });
  });

  app.get("/api/auth/user", (req, res) => {
    const sessionUser = (req.session as any)?.user;
    if (!sessionUser) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    res.json({
      id: sessionUser.claims.sub,
      email: sessionUser.claims.email,
      firstName: sessionUser.claims.first_name,
      lastName: sessionUser.claims.last_name,
      profileImageUrl: null,
    });
  });

  // Add isAuthenticated helper to request
  app.use((req: any, res, next) => {
    req.isAuthenticated = () => !!(req.session as any)?.user;
    req.user = (req.session as any)?.user;
    next();
  });
}

export function isAuthenticated(req: any, res: any, next: any) {
  if ((req.session as any)?.user) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}
