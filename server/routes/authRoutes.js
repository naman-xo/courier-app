const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = 'a$$w0rd'; // Replace later with env variable

// =================== SIGNUP ===================
router.post('/signup', async (req, res) => {
  const { name, email, password, role, courier_owner, phone } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (name, email, password, role, courier_owner, phone)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, email, hashedPassword, role || "customer", courier_owner || null, phone || null]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Signup failed' });
  }
});

// =================== LOGIN ===================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Try email first, then courier_owner
    const result = await db.query(
      `SELECT * FROM users WHERE email = $1 OR courier_owner = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid login ID' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { id: user.id, role: user.role, courier_owner: user.courier_owner },
      SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        courier_owner: user.courier_owner
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// =================== FORGOT PASSWORD ===================
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Find user
    const result = await db.query(
      `SELECT * FROM users WHERE email = $1 OR courier_owner = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = jwt.sign({ id: user.id }, SECRET, { expiresIn: "15m" });

    // Save in DB
    const expiry = new Date(Date.now() + 15 * 60000); // 15 mins from now
    await db.query(
      `UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3`,
      [resetToken, expiry, user.id]
    );

    // Normally you’d send email here, but for dev just return token
    res.json({ message: "Password reset token generated", resetToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process forgot password" });
  }
});


// Reset password using token
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || SECRET);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query("UPDATE users SET password=$1 WHERE id=$2", [
      hashedPassword,
      decoded.id,
    ]);

    res.json({ message: "Password has been reset successfully!" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid or expired token" });
  }
});


module.exports = router;
