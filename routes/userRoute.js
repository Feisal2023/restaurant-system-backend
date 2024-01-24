import express from "express";
const router = express.Router();

import {
  forgotPassword,
  getLoginStatus,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/getUser", protect, getUser);
router.get("/getLoginStatus", getLoginStatus);
router.post("/forgotpassword", forgotPassword);

export default router;
