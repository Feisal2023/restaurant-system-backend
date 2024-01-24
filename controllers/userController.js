import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { jwtSECRET } from "../config/config.js";
import User from "../models/userModel.js";

// create token
const generateToken = (id) => {
  return jwt.sign({ id }, jwtSECRET, {
    expiresIn: "1d",
  });
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  if (password < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }
  // check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Email has already been registered");
  }

  // create new user
  const user = await User.create({
    name,
    email,
    phone,
    password,
  });

  // generate token
  const token = generateToken(user._id);
  if (user) {
    const { _id, name, email, phone, role } = user;
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      // secure: true,
      // sameSite: "none"
    });

    // send user data now
    res.status(201).json({
      _id,
      name,
      email,
      phone,
      role,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if the fields are empty
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
  }

  // check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User does not exists");
  }
  // user exists check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  // generate token
  const token = generateToken(user._id);
  if (user && passwordIsCorrect) {
    const newUser = await User.findOne({ email }).select("-password");
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      // secure: true,
      // sameSite: "none"
    });
    // send user data
    res.status(201).json(newUser);
  } else {
    res.status(400);
    throw new Error("Invalid Email or Password");
  }
});

// logout user
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    // secure: true,
    // sameSite: "none",
  });
  res.status(400).json({ message: "User logout Successfully..." });
});
// get user
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
export { registerUser, loginUser, logoutUser, getUser };
