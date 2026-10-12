-- LeetGet database schema
-- Run this once against your PostgreSQL database, e.g.:
--   psql -U postgres -d leetget -f schema.sql

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A "friend" is a LeetCode username a logged-in user has bookmarked
-- so they can quickly re-check that profile. It is scoped to the
-- account that added it and has nothing to do with LeetGet accounts
-- friending each other.
CREATE TABLE IF NOT EXISTS friends (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leetcode_username VARCHAR(100) NOT NULL,
  display_name      VARCHAR(150),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, leetcode_username)
);

CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);

-- To make an existing account an admin, run:
--   UPDATE users SET is_admin = TRUE WHERE email = 'you@example.com';
