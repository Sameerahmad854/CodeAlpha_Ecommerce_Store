const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token = req.cookies.shop_token;

  if (!token) {
    return res.status(401).json({ message: "Please log in first." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.clearCookie("shop_token");
    return res.status(401).json({ message: "Your session expired. Please log in again." });
  }
}

module.exports = requireAuth;