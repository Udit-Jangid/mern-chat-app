const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

const protect = async (req, res, next) => {
  let token;
  // token = req.cookie.verify_token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log(token);
      // console.log(decoded);
      // console.log(decoded.id);

      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401);
      next(error);
    }
  } else {
    res.status(401);
    next("Not authorized, no token");
  }
};

module.exports = { protect };
