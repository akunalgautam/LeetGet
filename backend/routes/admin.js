import { Router } from "express";
import pool from "../db.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(authenticateToken, requireAdmin);

// List every registered user.
router.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, is_admin, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error("Admin list users error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// View any user's bookmarked friends list.
router.get("/users/:id/friends", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, leetcode_username, display_name, created_at
       FROM friends WHERE user_id = $1
       ORDER BY created_at ASC`,
      [req.params.id]
    );
    res.json({ friends: result.rows });
  } catch (error) {
    console.error("Admin list friends error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Promote/demote a user's admin status.
router.patch("/users/:id", async (req, res) => {
  const { isAdmin } = req.body || {};
  if (typeof isAdmin !== "boolean") {
    return res.status(400).json({ message: "isAdmin (boolean) is required." });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET is_admin = $1 WHERE id = $2
       RETURNING id, username, email, is_admin, created_at`,
      [isAdmin, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Admin update user error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Delete a user account (admins can't delete their own account here to
// avoid accidentally locking themselves out).
router.delete("/users/:id", async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ message: "You can't delete your own account." });
  }

  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
