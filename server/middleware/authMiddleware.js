const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Token missing" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      return next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  return res.status(401).json({ message: "No token provided" });
};

module.exports = { protect };