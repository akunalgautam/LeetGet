import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import friendsRoutes from "./routes/friends.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

// Auth (register / login / me), friends bookmarks, and admin management.
app.use("/api", authRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/admin", adminRoutes);

// Public: look up any LeetCode username's stats. No login required.
app.post("/submit", async (req, res) => {
  const user = req.body.username;
  if (!user || !user.trim()) {
    return res.status(400).json({ message: "username is required." });
  }
  try {
    const url = `https://leetscan.vercel.app/${encodeURIComponent(user.trim())}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("LeetCode fetch error:", error.message);
    res.status(502).json({ message: "Couldn't fetch that LeetCode profile." });
  }
});

app.listen(port, () => {
  console.log(`Server Live : ${port}`);
});
