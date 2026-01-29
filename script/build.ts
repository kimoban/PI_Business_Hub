import { build as esbuild } from "esbuild";
import { rm, readFile } from "fs/promises";
import { execSync } from "child_process";
import { existsSync } from "fs";
import path from "path";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildClient() {
  const clientPath = path.join(process.cwd(), "client");
  
  // Check if Angular client exists
  if (existsSync(path.join(clientPath, "angular.json"))) {
    console.log("Building Angular client...");
    
    // Always install dependencies to ensure Angular CLI is available
    console.log("Installing Angular dependencies...");
    execSync("npm install --include=dev", { cwd: clientPath, stdio: "inherit" });
    
    // Build Angular app using npm script (more reliable than npx ng)
    console.log("Running Angular build...");
    execSync("npm run build -- --configuration=production", { cwd: clientPath, stdio: "inherit" });
    
    // Move output to dist/public
    const angularOutput = path.join(clientPath, "dist", "client", "browser");
    if (existsSync(angularOutput)) {
      const { cp } = await import("fs/promises");
      await cp(angularOutput, path.join(process.cwd(), "dist", "public"), { recursive: true });
      console.log("Angular build copied to dist/public");
    }
  } else {
    // Fallback to Vite for React (legacy support)
    console.log("Building with Vite (React)...");
    const { build: viteBuild } = await import("vite");
    await viteBuild();
  }
}

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  await buildClient();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
