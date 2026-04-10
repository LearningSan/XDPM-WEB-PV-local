import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  passwordHash: String,
  name: String,

  bio: { type: String, default: "" },
  avatar: { type: String, default: "" },
  location: { type: String, default: "" },

  role: { type: String, default: "user" },

  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
}, {
  versionKey: false // 👈 thêm dòng này
});

export const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema, "users"); 