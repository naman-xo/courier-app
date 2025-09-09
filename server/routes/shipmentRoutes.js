const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken, authMiddleware } = require("../middleware/authMiddleware");

// ================= Customer APIs =================

// Create a new shipment (Customer booking)
router.post("/", authenticateToken, async (req, res) => {
  const {
    partner_awb,
    courier_owner, // use courier_owner not courier_name
    pickup_pincode,
    delivery_pincode,
    weight,
    price,
    sender_name,
    sender_address,
    sender_phone,
    receiver_name,
    receiver_address,
    receiver_phone,
  } = req.body;

  const user_id = req.user.id;

  try {
    const today = new Date().toISOString().slice(0, 10);
    const result = await db.query(
      `SELECT COUNT(*) FROM shipments WHERE created_at::date = $1`,
      [today]
    );

    const count = parseInt(result.rows[0].count) + 1;
    const local_awb = `MC${today.replace(/-/g, "")}-${String(count).padStart(3, "0")}`;

    const insert = await db.query(
      `INSERT INTO shipments (
        local_awb, partner_awb, courier_owner,
        pickup_pincode, delivery_pincode, weight, price, user_id,
        sender_name, sender_address, sender_phone,
        receiver_name, receiver_address, receiver_phone,
        status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14,
        'pending'
      ) RETURNING *`,
      [
        local_awb, partner_awb, courier_owner,
        pickup_pincode, delivery_pincode, weight, price, user_id,
        sender_name, sender_address, sender_phone,
        receiver_name, receiver_address, receiver_phone
      ]
    );

    res.status(201).json({ shipment: insert.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create shipment" });
  }
});

// Get shipments for the logged-in customer
router.get("/mine", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      "SELECT * FROM shipments WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json({ shipments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shipments" });
  }
});

// Get all shipments (role-based access)
router.get("/", authenticateToken, async (req, res) => {
  try {
    let query = "SELECT * FROM shipments ORDER BY created_at DESC";
    let params = [];

    if (req.user.role === "courier_admin") {
      query = "SELECT * FROM shipments WHERE courier_owner = $1 ORDER BY created_at DESC";
      params = [req.user.courier_owner];
    } else if (req.user.role === "customer") {
      query = "SELECT * FROM shipments WHERE user_id = $1 ORDER BY created_at DESC";
      params = [req.user.id];
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shipments" });
  }
});

// Get a single shipment by local AWB
router.get("/:awb", async (req, res) => {
  const { awb } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM shipments WHERE local_awb = $1",
      [awb]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    res.json({ shipment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get pricing options (for booking page)
router.get("/pricing", (req, res) => {
  const { pickup, delivery, weight } = req.query;
  const base = parseFloat(weight || 1) * 20;

  const prices = [
    { courier: "Delhivery", price: base + 10 },
    { courier: "Mahavir", price: base + 5 },
    { courier: "Amazon", price: base + 15 },
    { courier: "Xpressbees", price: base + 8 }
  ];

  res.json({ options: prices });
});

// ================= Employee APIs =================

// Get available shipments (not assigned)
router.get("/available", authMiddleware(["employee"]), async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM shipments WHERE status = 'pending' AND assigned_to IS NULL"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch available shipments" });
  }
});

// Accept a shipment
router.post("/:id/accept", authMiddleware(["employee"]), async (req, res) => {
  const shipmentId = req.params.id;
  const userId = req.user.id;

  try {
    const check = await db.query(
      "SELECT * FROM shipments WHERE id=$1 AND assigned_to IS NULL",
      [shipmentId]
    );

    if (check.rows.length === 0) {
      return res.status(400).json({ error: "Shipment already assigned" });
    }

    await db.query(
      "UPDATE shipments SET assigned_to=$1, status='accepted' WHERE id=$2",
      [userId, shipmentId]
    );

    res.json({ success: true, message: "Shipment accepted!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to accept shipment" });
  }
});

// Update shipment status (accepted → out_for_delivery → delivered)
router.patch("/:id/status", authMiddleware(["employee"]), async (req, res) => {
  const shipmentId = req.params.id;
  const { status } = req.body;
  const userId = req.user.id;

  try {
    const check = await db.query(
      "SELECT * FROM shipments WHERE id=$1 AND assigned_to=$2",
      [shipmentId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ error: "Not authorized to update this shipment" });
    }

    await db.query(
      "UPDATE shipments SET status=$1 WHERE id=$2",
      [status, shipmentId]
    );

    res.json({ success: true, message: "Status updated!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// ================= Courier Admin APIs =================

// Courier admins see only their courier shipments
router.get("/mycourier", authMiddleware(["courier_admin"]), async (req, res) => {
  try {
    const courierName = req.user.courier_owner;
    const { rows } = await db.query(
      "SELECT * FROM shipments WHERE courier_owner=$1",
      [courierName]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch courier shipments" });
  }
});

module.exports = router;
