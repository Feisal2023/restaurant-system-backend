import express from "express";
const router = express.Router();

import {
  getUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/userController.js";

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/getUser", getUser);

export default router;
