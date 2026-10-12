import { Router } from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();
router.use(authenticateToken);

// List the current user's bookmarked LeetCode usernames.
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, leetcode_username, display_name, created_at
       FROM friends WHERE user_id = $1
       ORDER BY created_at ASC`,
      [req.user.id]
    );
    res.json({ friends: result.rows });
  } catch (error) {
    console.error("List friends error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Add a LeetCode username to the current user's friends list.
router.post("/", async (req, res) => {
  const { leetcodeUsername, displayName } = req.body || {};

  if (!leetcodeUsername?.trim()) {
    return res.status(400).json({ message: "leetcodeUsername is required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO friends (user_id, leetcode_username, display_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, leetcode_username) DO NOTHING
       RETURNING id, leetcode_username, display_name, created_at`,
      [req.user.id, leetcodeUsername.trim(), displayName?.trim() || null]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ message: "That user is already in your friends list." });
    }

    res.status(201).json({ friend: result.rows[0] });
  } catch (error) {
    console.error("Add friend error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Remove a friend by its row id (must belong to the current user).
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM friends WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Friend not found." });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Delete friend error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
