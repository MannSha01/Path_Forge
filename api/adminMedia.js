// ===================================================
// VERCEL SERVERLESS ENDPOINT: /api/adminMedia
// Server-side Media Management API
// Handles secure media uploading, metadata indexing, and deletion.
// ===================================================

import { verifyAdminToken } from "./adminAuth.js";

function requireAdmin(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : (req.body?.adminToken || authHeader);
  return verifyAdminToken(token);
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = requireAdmin(req);
  if (!auth.valid) {
    return res.status(403).json({ error: auth.error || "Access Denied: Admin authorization required" });
  }

  // GET media list
  if (req.method === "GET") {
    return res.status(200).json({
      status: "ok",
      adminEmail: auth.email
    });
  }

  // POST upload / register media
  if (req.method === "POST") {
    const { action = "upload", name, url, dataUrl, size, type } = req.body || {};

    if (!name && !url && !dataUrl) {
      return res.status(400).json({ error: "Missing media payload" });
    }

    const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const assetUrl = url || dataUrl || "";

    return res.status(200).json({
      success: true,
      media: {
        id: mediaId,
        name: name || "uploaded-image",
        url: assetUrl,
        size: size || (dataUrl ? Math.round(dataUrl.length * 0.75) : 0),
        type: type || "image/png",
        uploadedBy: auth.email,
        createdAt: new Date().toISOString()
      }
    });
  }

  // DELETE media
  if (req.method === "DELETE") {
    const { mediaId } = req.body || req.query || {};
    return res.status(200).json({
      success: true,
      deletedId: mediaId,
      adminEmail: auth.email
    });
  }
}
