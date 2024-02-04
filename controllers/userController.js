import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { emailUSER, frontendURL, jwtSECRET } from "../config/config.js";
import User from "../models/userModel.js";
import Token from "../models/tokenModel.js";
import crypto from "crypto";
import sendForgotEmail from "../utils/sendForgotEmail.js";
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

// get login status
const getLoginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // verify token
  const verified = jwt.verify(token, jwtSECRET);
  if (verified) {
    res.json(true);
  }
  res.json(false);
});
// forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User does not exists");
  }

  // Delete token if it exists in DB
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }
  // create reset token
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  console.log(resetToken);

  // Hash token before saving to DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // save Token to DB
  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 5 * (60 * 1000),
  }).save();

  // construct reset Url
  const resetUrl = `${frontendURL}/users/resetpassword/${resetToken}`;
  // Reset Email
  const message = `
  <h2>Hello ${user.name}</h2>
  <p>Please use the url below to reset your password</p>
  <p>This reset link is valid for only 5minutes.</p>


  <a href=${resetUrl} clicktracking=on>${resetUrl}</a>

  <p>Best Regards...</p>
  <p>Restaurant System Team</p>
  `;
  const subject = "Password Reset Request";
  const send_to = user.email;
  const sent_from = emailUSER;
  const reply_to = emailUSER;

  try {
    await sendForgotEmail(subject, message, send_to, sent_from, reply_to);
    res.status(200).json({ success: true, message: "Reset Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
});

// reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { password1 } = req.body;
  const { resetToken } = req.params;

  // Hash token, then compare to token in DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Find token in DB
  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });
  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
  }
  // Find user
  const user = await User.findOne({ _id: userToken.userId });
  user.password = password1;
  await user.save();
  res.status(200).json({ message: "Password Reset Successful, Please Login" });
});
export {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  getLoginStatus,
  forgotPassword,
  resetPassword,
};
