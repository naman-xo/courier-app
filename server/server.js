const express = require('express'); // Import express
const cors = require('cors');       // Import CORS
const shipmentRoutes = require('./routes/shipmentRoutes');
const authRoutes = require('./routes/authRoutes');

require('dotenv').config();         // Load env vars

const db = require('./db');

db.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('DB connection failed', err);
  } else {
    console.log('DB connected 🟢', result.rows[0]);
  }
});

const app = express();
app.use(cors());                    // Allow frontend to talk to backend
app.use(express.json());            // Parse JSON bodies from frontend
app.use('/api/shipments', shipmentRoutes);
app.use('/api/auth', authRoutes);

app.get("/", (req, res) => {
  res.send("Courier backend is running 🏃‍♂️💨");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
    