import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    // Check if Angular client exists
    const fs = await import("fs");
    const path = await import("path");
    const angularJsonPath = path.join(process.cwd(), "client", "angular.json");
    
    if (fs.existsSync(angularJsonPath)) {
      // Use Angular dev server
      console.log("Angular client detected - run Angular dev server separately with: cd client && npm start");
      console.log("Or access the API directly at http://localhost:5000/api/*");
      
      // Serve a simple message for non-API routes in dev mode
      app.use("/{*path}", (_req, res) => {
        res.send(`
          <html>
            <body style="font-family: system-ui; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0;">
              <h1>PI Business Hub - Development Mode</h1>
              <p>API is running on port 5000</p>
              <p>To run the Angular frontend:</p>
              <code style="background: #f0f0f0; padding: 10px; border-radius: 5px;">cd client && npm start</code>
              <p style="margin-top: 20px;">Then open <a href="http://localhost:4200">http://localhost:4200</a></p>
            </body>
          </html>
        `);
      });
    } else {
      // Fallback to Vite for React
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
