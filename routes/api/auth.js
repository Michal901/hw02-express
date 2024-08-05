const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const User = require("../../models/userSchema");
const { sendVerificationEmail } = require("../../services/emailService");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();
    const user = new User({
      email,
      password: hashedPassword,
      verificationToken,
    });

    await user.save();

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message:
        "User registered successfully. Please check your email for verification link.",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
