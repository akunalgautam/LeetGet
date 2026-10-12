import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

if (!process.env.JWT_SECRET) {
  console.warn(
    "[warn] JWT_SECRET is not set in .env — using an insecure default. " +
      "Set JWT_SECRET before deploying this anywhere real."
  );
}

// Verifies the Bearer token on the request and attaches { id, username, isAdmin }
// to req.user. Responds 401/403 and stops the chain if the token is missing/invalid.
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired session. Please log in again." });
    }
    req.user = payload;
    next();
  });
}

// Must be used after authenticateToken.
export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
}
