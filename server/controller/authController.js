import { generateToken } from "../config/jwt.js";
import User from "../modal/User.js";
import bcrypt from "bcrypt";

/* ─── helpers ──────────────────────────────────────── */
const COOKIE_OPTS = {
  httpOnly: true,   // JS cannot read this cookie
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches JWT expiry)
};

const setAuthCookie = (res, token) =>
  res.cookie("auth_token", token, COOKIE_OPTS);

export const signup = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    if (!name || !email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: "Please add all fields",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Role-based verification: normal users auto-verified, workers need admin
    const isVerified = userType === "user";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      userType,
      isVerified,
    });

    // Workers should NOT get a token until verified
    if (userType === "worker") {
      return res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          isVerified: user.isVerified,
        },
        message: "Worker account created. Await admin verification.",
      });
    }

    // For normal users, generate token
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    //  Generate token
    const token = generateToken(user._id);

    if(user.userType === "worker"){
      setAuthCookie(res, token);
      return res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          isVerified: user.isVerified,
        },
        token,
      });
    }
    setAuthCookie(res, token);
    //  Send response (no password)
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/* ══════════════════════════════════════════════════
   GET ME — verify cookie token and return current user
   GET /api/auth/me
══════════════════════════════════════════════════ */
export const getMe = async (req, res) => {
  try {
    // req.user is populated by the protect middleware (reads cookie or header)
    const user = req.user;
    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ══════════════════════════════════════════════════
   LOGOUT — clear the auth cookie
   POST /api/auth/logout
══════════════════════════════════════════════════ */
export const logout = (req, res) => {
  res.clearCookie("auth_token", { ...COOKIE_OPTS, maxAge: 0 });
  return res.status(200).json({ success: true, message: "Logged out" });
};
