const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware"); // ✅ correct import

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

// 🔹 Step 1: Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 🔹 Step 2: Google Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: "JWT_SECRET missing" });
      }

      const token = jwt.sign(
        {
          id: req.user._id,
          email: req.user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.redirect(
        `${frontendUrl}/dashboard?token=${encodeURIComponent(token)}`
      );
    } catch (err) {
      console.error("JWT Error:", err);
      return res.status(500).json({ message: "Token generation failed" });
    }
  }
);

// 🔹 Protected Route
router.get("/profile", protect, (req, res) => {
  return res.json({
    success: true,
    message: "Protected route",
    user: req.user
  });
});

module.exports = router;
