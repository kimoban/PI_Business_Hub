import { type Express } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { spawn, ChildProcess } from "child_process";
import path from "path";

let angularProcess: ChildProcess | null = null;

export async function setupAngularDev(app: Express) {
  const clientPath = path.join(process.cwd(), "client");
  
  console.log("Starting Angular dev server...");
  
  // Start Angular dev server on port 4200
  angularProcess = spawn("npx", ["ng", "serve", "--port", "4200"], {
    cwd: clientPath,
    stdio: "pipe",
    shell: true,
  });

  angularProcess.stdout?.on("data", (data) => {
    console.log(`[Angular] ${data}`);
  });

  angularProcess.stderr?.on("data", (data) => {
    console.error(`[Angular] ${data}`);
  });

  // Wait for Angular to start
  await new Promise<void>((resolve) => {
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch("http://localhost:4200");
        if (response.ok) {
          clearInterval(checkInterval);
          resolve();
        }
      } catch {
        // Angular not ready yet
      }
    }, 1000);
    
    // Timeout after 60 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 60000);
  });

  console.log("Angular dev server is ready!");

  // Proxy all non-API requests to Angular
  app.use(
    "/{*path}",
    createProxyMiddleware({
      target: "http://localhost:4200",
      changeOrigin: true,
      ws: true,
    })
  );
}

// Cleanup function
process.on("exit", () => {
  if (angularProcess) {
    angularProcess.kill();
  }
});

process.on("SIGINT", () => {
  if (angularProcess) {
    angularProcess.kill();
  }
  process.exit(0);
});
