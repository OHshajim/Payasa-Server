const jwt = require("jsonwebtoken");

const TokenValidate = (req, res, next) => {
  const auth = req.body.headers["authorization"];
  if (!auth) {
    return res.status(403).json({ message: "Unauthorized Access" });
  }
  try {
    const decoded = jwt.verify(auth, process.env.SECRET_KEY);
    req.user = decoded;
    next()
  } catch (error) {
    return res.status(403).json({ message: "Unauthorized Access" });
  }
};
module.exports = TokenValidate;
