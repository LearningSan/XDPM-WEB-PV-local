import mongoose from "mongoose";

const socialAccountSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  provider: {
    type: String,
    enum: ["google", "facebook"],
    required: true,
  },

  provider_id: {
    type: String,
    required: true,
  },

  provider_email: {
    type: String,
    default: null,
  },

  token: {
    type: String,
    default: null,
  },

  token_expires_at: {
    type: Date,
    default: null,
  },

  linked_at: {
    type: Date,
    default: Date.now,
  },
}, {
  versionKey: false,
});


export const SocialAccount =
  mongoose.models.SocialAccount ||
  mongoose.model("SocialAccount", socialAccountSchema, "social_accounts");