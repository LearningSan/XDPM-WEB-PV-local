import mongoose from "mongoose";


const PasswordResetSchema= new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  otp: String,
  expires_at: Date,
  used_at: Date,
  created_at: { type: Date, default: Date.now },
}, {
  versionKey: false,
});

export const PasswordReset = mongoose.models.PasswordReset || mongoose.model("PasswordReset", PasswordResetSchema, "password_resets");