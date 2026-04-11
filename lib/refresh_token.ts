import { connectDB } from "@/lib/db";
import { RefreshToken } from "@/data/refresh_token";
export async function createVerifytoken(
  id: string,
  tokenHash: string,
  expiresAt?: string
) {
  try {
    await connectDB();
    if (!id || !tokenHash) {
      throw new Error("id and tokenHash are required");
    }

    await connectDB();

    const token = await RefreshToken.create({
      user_id: id,
      token_hash: tokenHash,
      expires_at: expiresAt ? new Date(expiresAt) : null,
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