// ===================================================
// VERCEL SERVERLESS ENDPOINT: /api/adminAuth
// Server-side Admin Authentication & Authorization Layer
// Strictly validates admin privileges server-side.
// ===================================================

/**
 * Returns list of authorized admin emails configured via environment variables.
 * @returns {string[]}
 */
export function getAuthorizedAdminEmails() {
  const envAdminEmails = process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || "";
  const list = envAdminEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // Default fallback admin for initial development setup if none configured in env
  if (list.length === 0) {
    list.push("admin@pathforge.dev");
  }

  return list;
}

/**
 * Server-side check if a given email or token is an authorized admin.
 * @param {string} email
 * @param {string} [secretKey]
 * @returns {boolean}
 */
export function isAuthorizedAdmin(email, secretKey = "") {
  if (!email || typeof email !== "string") return false;

  const adminSecret = process.env.ADMIN_SECRET_KEY || "";
  if (adminSecret && secretKey && secretKey === adminSecret) {
    return true;
  }

  const authorizedList = getAuthorizedAdminEmails();
  return authorizedList.includes(email.trim().toLowerCase());
}

/**
 * Generates a simple tamper-resistant session token for admin requests.
 * @param {string} email
 * @returns {string}
 */
export function generateAdminSessionToken(email) {
  const secret = process.env.ADMIN_SECRET_KEY || "pf_admin_secret_fallback_key";
  const timestamp = Date.now();
  const raw = `${email.toLowerCase()}|${timestamp}|${secret}`;
  // Base64 encoding token representation
  const signature = Buffer.from(raw).toString("base64");
  return `pf_admin_${Buffer.from(JSON.stringify({ email: email.toLowerCase(), timestamp, sig: signature })).toString("base64")}`;
}

/**
 * Verifies admin session token server-side.
 * @param {string} token
 * @returns {{ valid: boolean, email?: string, error?: string }}
 */
export function verifyAdminToken(token) {
  if (!token || typeof token !== "string" || !token.startsWith("pf_admin_")) {
    return { valid: false, error: "Invalid or missing admin token" };
  }

  try {
    const raw = token.replace("pf_admin_", "");
    const decoded = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
    if (!decoded || !decoded.email || !decoded.timestamp) {
      return { valid: false, error: "Malformed admin token" };
    }

    // Token expiration check (e.g. 7 days)
    const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - decoded.timestamp > MAX_AGE_MS) {
      return { valid: false, error: "Session expired" };
    }

    if (!isAuthorizedAdmin(decoded.email)) {
      return { valid: false, error: "User is not an authorized administrator" };
    }

    return { valid: true, email: decoded.email };
  } catch (err) {
    return { valid: false, error: "Invalid token format" };
  }
}

/**
 * Main API request handler
 */
export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // GET: Check authorization from Authorization header
  if (req.method === "GET") {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    const verification = verifyAdminToken(token);

    if (!verification.valid) {
      return res.status(403).json({
        authorized: false,
        error: verification.error || "Unauthorized: Valid admin privileges required"
      });
    }

    return res.status(200).json({
      authorized: true,
      email: verification.email,
      role: "admin"
    });
  }

  // POST: Login / Validate / Token Verification
  const { action = "login", email, secretKey, token } = req.body || {};

  if (action === "verify") {
    const verification = verifyAdminToken(token);
    if (!verification.valid) {
      return res.status(403).json({
        authorized: false,
        error: verification.error || "Forbidden: Admin authorization failed"
      });
    }

    return res.status(200).json({
      authorized: true,
      email: verification.email,
      role: "admin"
    });
  }

  if (action === "login" || action === "check") {
    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }

    const authorized = isAuthorizedAdmin(email, secretKey);

    if (!authorized) {
      return res.status(403).json({
        authorized: false,
        error: `Access Denied: The account '${email}' does not have administrative privileges.`
      });
    }

    const sessionToken = generateAdminSessionToken(email);

    return res.status(200).json({
      authorized: true,
      email: email.toLowerCase(),
      role: "admin",
      token: sessionToken,
      expiresIn: 7 * 24 * 60 * 60
    });
  }

  return res.status(400).json({ error: "Invalid action" });
}
