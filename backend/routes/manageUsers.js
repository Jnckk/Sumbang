const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../src/db");
const authenticateToken = require("../src/authMiddleware");

const router = express.Router();
const saltRounds = 10;

const generateUserId = () => {
  const randomDigits = Math.floor(Math.random() * 1000);
  const paddedDigits = String(randomDigits).padStart(3, "0");
  return `5${paddedDigits}`;
};

router.get("/manage-users", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, password FROM users");
    res.json(result.rows); // Use result.rows for PostgreSQL
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/manage-users", authenticateToken, async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userId = generateUserId();

    const result = await pool.query(
      "INSERT INTO users (id, username, password) VALUES ($1, $2, $3) RETURNING id, username", // Use PostgreSQL placeholders
      [userId, username, hashedPassword]
    );

    res.status(201).json(result.rows[0]); // Use result.rows for PostgreSQL
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/manage-users/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;

  try {
    let hashedPassword = password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const result = await pool.query(
      "UPDATE users SET username = $1, password = $2 WHERE id = $3 RETURNING id, username", // Use PostgreSQL placeholders
      [username, hashedPassword, id]
    );
    if (result.rowCount === 0)
      // Use rowCount for PostgreSQL
      return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]); // Use result.rows for PostgreSQL
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/manage-users/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1", [id]); // Use PostgreSQL placeholders
    if (result.rowCount === 0)
      // Use rowCount for PostgreSQL
      return res.status(404).json({ error: "User not found" });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
