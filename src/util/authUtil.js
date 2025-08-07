import jwt from "jsonwebtoken";
import configVariables from "../config/config.js";

export function generateToken(userId, email) {
  const payload = { userId, email };
  const secret = configVariables.JWT_SECRET;
  return jwt.sign(payload, secret);
}

export function authenticateToken(req, res, next) {
  let token = req.headers.authorization;
  if (token) {
    token = token.split(" ")[1];
    jwt.verify(token, serverConfig.JWT_SECRET, (err, payload) => {
      if (err) {
        res.status(403).json({
          message: "Unauthorized Access",
        });
      } else {
        req.user = payload;
        next();
      }
    });
  } else {
    res.status(403).json({
      message: "Unauthorized Access",
    });
  }
}