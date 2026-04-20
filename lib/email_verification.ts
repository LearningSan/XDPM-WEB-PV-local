import { connectDB } from "@/lib/db";
import { EmailVerification } from "@/data/email_verification";
import mongoose from "mongoose";
export async function createEmailVerification(
  user_id: string,
  token: string,
  expires_at: Date
) {
  await connectDB();

  try {
    await EmailVerification.create({
      user_id,
      token,
      expires_at,
      used_at: null,
      created_at: new Date(),
    });

    return { message: "Email verification created" };
  } catch (error) {
    console.error("createEmailVerification error:", error);
    throw new Error("Failed to create email verification");
  }
}

export async function getVerificationByToken(token: string) {
  await connectDB();

  try {
    return await EmailVerification.findOne({ token });
  } catch (error) {
    console.error("getVerificationByToken error:", error);
    throw new Error("Failed to get verification");
  }
}
export async function markVerificationUsed(verify_id: string) {
  await connectDB();

  const result = await EmailVerification.updateOne(
    {
      _id: verify_id,
      used_at: null, // chống reuse
    },
    {
      $set: {
        used_at: new Date(),
      },
    }
  );

  console.log("UPDATE RESULT:", result);

  return result;
}