import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token_hash: {
    type: String,
    required: true,
  },
  device_info: {
    type: String,
    default: null,
  },
  ip_address: {
    type: String,
    default: null,
  },
  expires_at: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  versionKey: false
});

export const RefreshToken =
  mongoose.models.RefreshToken ||
  mongoose.model("RefreshToken", refreshTokenSchema,"refresh_tokens" );