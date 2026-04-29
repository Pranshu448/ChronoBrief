require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const passport = require("./config/passport");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8000;

// 🔹 Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(passport.initialize());

// 🔹 DB Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    const atlasHint =
      "Check that your MongoDB Atlas cluster allows this machine's IP, the database user credentials are correct, and DNS/network access to Atlas is available.";
    console.error("❌ DB Connection Error:", err.message);
    console.error("ℹ️  Troubleshooting:", atlasHint);
    process.exit(1); // stop server if DB fails
  }
};

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

// 🔹 Routes
app.use("/api/auth", require("./routes/authRoutes"));

// 🔹 Test route (optional but useful)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 🔹 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// 🔹 Global Error Handler (important)
app.use((err, req, res, next) => {
  console.error(" Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// 🔹 Server start
startServer();
