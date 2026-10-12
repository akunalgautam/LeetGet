import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import { authenticateToken, JWT_SECRET } from "../middleware/auth.js";

const router = Router();
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, isAdmin: user.is_admin },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.is_admin,
    createdAt: user.created_at,
  };
}

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ message: "Username, email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE username = $1 OR email = $2",
      [username.trim(), email.trim().toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "That username or email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, is_admin, created_at`,
      [username.trim(), email.trim().toLowerCase(), passwordHash]
    );

    const user = result.rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email?.trim() || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.trim().toLowerCase(),
    ]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, is_admin, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
