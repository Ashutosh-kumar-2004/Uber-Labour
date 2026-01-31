import { generateToken } from "../config/jwt.js";
import User from "../modal/User.js";
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
    try {
        const { name, email, password, userType } = req.body;
        if (!name || !email || !password || !userType) {
            res.status(400).json({ success: false, message: "Please add all fields" });
            return;
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ success: false, message: "User already exists" });
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            userType,
            password: hashedPassword,
        })
        const token = generateToken(user._id);  // token generated


        res.status(200).json({ success: true, user, token });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });

    }
}

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

    // 2️⃣ Find user
    const user = await User.findOne({ email });
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
