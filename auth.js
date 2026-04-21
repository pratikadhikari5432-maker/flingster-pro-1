const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Access denied. Node identity missing." });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access denied. Token malformed." });

  try {
    const verified = jwt.verify(token, "SECRET_KEY");
    req.user = verified;
    next();
  } catch {
    res.status(400).json({ error: "Invalid token. Handshake failed." });
  }
};