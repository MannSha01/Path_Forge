// ===================================================
// VERCEL SERVERLESS ENDPOINT: /api/authConfig
// Provides public Firebase client configuration from environment
// ===================================================

export default function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.status(200).json({
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDnUrQ2wdKWqhh_wW7ZlvTxCaSHui8LeF4",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "path-forge-7845e.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "path-forge-7845e",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "path-forge-7845e.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "580025481377",
    appId: process.env.FIREBASE_APP_ID || "1:580025481377:web:5e53953bcdc986bbef18e0"
  });
}
