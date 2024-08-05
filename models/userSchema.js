const mongoose = require("mongoose");
const { Schema } = mongoose;
const { v4: uuidv4 } = require("uuid");

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  avatarURL: {
    type: String,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, "Verify token is required"],
    default: uuidv4,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
