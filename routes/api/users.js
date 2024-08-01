const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const Jimp = require("jimp");
const authMiddleware = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/upload");

const router = express.Router();

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
