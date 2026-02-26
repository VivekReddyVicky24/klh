const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

let db;

// ================= DB CONNECTION =================
async function connectDB() {
  try {
    db = await mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      ssl: {
        minVersion: "TLSv1.2",
      },
    });

    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ DB Connection Failed:", error.message);
  }
}

connectDB();

// ================= IMPORT ROUTES =================
const userRoutes = require("./routes/userRoutes");

// Pass db to routes using middleware
app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "🚀 Server Running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});