// ===================================================
// PATH FORGE - LOCAL DEVELOPMENT SERVER
// Serves static client files & executes Vercel-compatible /api/* serverless endpoints
// ===================================================

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically load local .env.local or .env if present (for local development).
// In deployment environments (Vercel, Render, Railway, Docker, etc.),
// hosting platform environment variables are used directly.
try {
  const localEnv = path.join(__dirname, ".env.local");
  const defaultEnv = path.join(__dirname, ".env");
  if (fs.existsSync(localEnv)) {
    process.loadEnvFile(localEnv);
  } else if (fs.existsSync(defaultEnv)) {
    process.loadEnvFile(defaultEnv);
  }
} catch {
  // Gracefully continue in environments where env files do not exist
}

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (req, res) => {
  // CORS & Security headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  // --- 1. SERVERLESS API HANDLER (/api/*) ---
  if (pathname.startsWith("/api/")) {
    const endpointName = pathname.replace("/api/", "").split("?")[0].replace(/\/$/, "");
    const apiFilePath = path.join(__dirname, "api", `${endpointName}.js`);

    if (fs.existsSync(apiFilePath)) {
      try {
        // Read body payload for POST requests
        let body = {};
        if (req.method === "POST") {
          const buffers = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const rawBody = Buffer.concat(buffers).toString("utf-8");
          if (rawBody.trim()) {
            body = JSON.parse(rawBody);
          }
        }

        // Mock Vercel req/res objects
        const vercelReq = {
          method: req.method,
          query: Object.fromEntries(parsedUrl.searchParams),
          body,
          headers: req.headers
        };

        const vercelRes = {
          status(code) {
            res.statusCode = code;
            return this;
          },
          json(data) {
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify(data));
            return this;
          },
          send(data) {
            res.end(data);
            return this;
          }
        };

        const mod = await import(`file://${apiFilePath}?t=${Date.now()}`);
        const handler = mod.default;

        if (typeof handler === "function") {
          await handler(vercelReq, vercelRes);
          return;
        }
      } catch (err) {
        console.error(`API Error on ${pathname}:`, err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message || "Internal Server Error" }));
        return;
      }
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: `API endpoint not found: ${pathname}` }));
    return;
  }

  // --- 2. STATIC FILE SERVER ---
  let filePath = path.join(__dirname, pathname === "/" ? "index.html" : pathname);

  if (!fs.existsSync(filePath)) {
    // Fallback to index.html for SPA client navigation
    filePath = path.join(__dirname, "index.html");
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    const nextPort = Number(PORT) + 1;
    console.log(`[Path Forge] Port ${PORT} in use, falling back to http://localhost:${nextPort}`);
    server.listen(nextPort);
  } else {
    console.error(err);
  }
});

server.listen(PORT, () => {
  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : PORT;
  console.log(`[Path Forge] Running locally at http://localhost:${actualPort}`);
});
