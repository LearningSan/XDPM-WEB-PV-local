import { connectDB } from "@/lib/db";
import { RefreshToken } from "@/data/refresh_token";
import mongoose from "mongoose";
export async function createVerifytoken(
  id: string,
  tokenHash: string,
  expiresAt?: Date
) {
  try {
    if (!id || !tokenHash) {
      throw new Error("id and tokenHash are required");
    }

    await connectDB();

    const token = await RefreshToken.create({
      user_id: new mongoose.Types.ObjectId(id),
      token_hash: tokenHash,
      expires_at: expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // default 7 ngày
    });

    return token;
  } catch (error) {
    console.error("createVerifytoken error:", error);
    throw error;
  }
}
export async function getTokenByUserId(userId: string) {
  try {
    await connectDB();

    const token = await RefreshToken.findOne({ user_id: userId })
      .sort({ createdAt: -1 });

    return token;
  } catch (error) {
    console.error("getTokenByUserId error:", error);
    throw error;
  }
}