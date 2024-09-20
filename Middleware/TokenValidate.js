const jwt = require("jsonwebtoken");

const TokenValidate = (req, res, next) => {
  const auth = req.headers["authorization"];
  
  if (!auth) {
    return res.status(403).json({ message: "Unauthorized Access" });
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.decoded = decoded;
    next()
  } catch (error) {
    return res.status(403).json({ message: "Unauthorized Access" });
  }
};
module.exports = TokenValidate;
