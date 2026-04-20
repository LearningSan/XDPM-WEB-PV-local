import { connectDB } from "@/lib/db";
import {PasswordReset} from "@/data/password_reset"; 
import mongoose from "mongoose";
export async function createPassword_Reset(user_id: string, otp: string) {
  await connectDB();

  console.log("Creating PasswordReset record for user_id:", user_id, "with OTP:", otp);
  try {
    await PasswordReset.create({
      user_id,
      otp,
      expires_at:new Date(Date.now() + 5 * 60 * 1000),
      used_at: null, 
      created_at: new Date(),
    });

    return { message: "OTP created" };
  } catch (error) {
    console.error("createPassword_Reset error:", error);
    throw error;
  }
}
export async function checkOTP(user_id: string, otp: string) {
  await connectDB();
 const cleanOtp = Array.isArray(otp)
  ? otp.join("")
  : String(otp).trim();


const record = await PasswordReset.findOne({
  user_id: new mongoose.Types.ObjectId(user_id),
  otp: cleanOtp,
}).sort({ created_at: -1 });

  if (!record) {
    return {
      success: false,
      message: "OTP không hợp lệ hoặc hết hạn"
    };
  }

  record.used_at = new Date();
  await record.save();

  return { success: true };
}
export async function deleteOTP(user_id: string) {
  try {
    await PasswordReset.deleteMany({ user_id });
    return { success: true };
  } catch (error) {
    console.error("deleteOTP error:", error);
    return { success: false };
  }
}