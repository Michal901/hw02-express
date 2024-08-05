const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs").promises;
const Jimp = require("jimp");
const mailgun = require("mailgun-js");
const User = require("../../models/userSchema");
const authMiddleware = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/upload");

const router = express.Router();

const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL } = process.env;

const mg = mailgun({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN });

const sendVerificationEmail = async (email, token) => {
  const data = {
    from: MAILGUN_FROM_EMAIL,
    to: email,
    subject: "Email Verification",
    text: `Please verify your email by clicking on the following link: http://localhost:3000/users/verify/${token}`,
    html: `<strong>Please verify your email by clicking on the following link: <a href="http://localhost:3000/users/verify/${token}">Verify Email</a></strong>`,
  };

  await mg.messages().send(data);
};

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

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.verify = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "missing required field email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    await sendVerificationEmail(user.email, user.verificationToken);

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/avatars",
  authMiddleware,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const { path: tempPath, filename } = req.file;
      const newFilePath = path.join(
        __dirname,
        "../../public/avatars",
        filename
      );

      const image = await Jimp.read(tempPath);
      await image.resize(250, 250).writeAsync(newFilePath);

      await fs.unlink(tempPath);

      const user = req.user;
      user.avatarURL = `/public/avatars/${filename}`;
      await user.save();

      res.status(200).json({ avatarURL: user.avatarURL });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
