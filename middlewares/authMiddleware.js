import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { jwtSECRET } from "../config/config.js";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      return next(new Error("Not authorized, please login to continue"));
    }
    // verify token
    const verified = jwt.verify(token, jwtSECRET);
    // get user id from token
    const user = await User.findById(verified.id).select("-password");
    if (!user) {
      res.status(404);
      return next(new Error("User not found"));
    }

    if (user.role === "suspended") {
      res.status(400);
      return next(new Error("User suspended, please contact for support"));
    }
    req.user = user;
    return next();
  } catch (error) {
    res.status(401);
    return next(new Error("Not authorized, please login to continue"));
  }
});

export { protect };
