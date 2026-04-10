import { getUser } from "@/lib/user";
import { checkOTP, createPassword_Reset } from "@/lib/password_reset";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { updatePassword } from "@/lib/user";
import { deleteOTP } from "@/lib/password_reset";
export async function sendMail(email: string) {
  const user = await getUser(email);

  if (!user) {
    return { message: "Email doesn't exist" };
  }

  try {
    const otp = await generateOTP(); // random OTP
    await createPassword_Reset(user.user_id, otp);
    await sendOTPEmail(email, otp);
  } catch (error) {
    console.error(error);
    return { message: "OTP fail to send" };
  }

  return { message: "OTP sent" };
}


export async function sendOTPEmail(to: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "OTP Reset Password",
    text: `Mã OTP của bạn là: ${otp} (hết hạn 5 phút)`,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Mail sent:", info);
}
export function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

export async function verifyOTP(email: string, otp: string) {
  const user = await getUser(email);

  if (!user) {
    return {
      success: false,
      message: "Email doesn't exist"
    };
  }

  const { user_id } = user;

  const result = await checkOTP(user_id, otp);

  return result;
}
export async function resetPassword(
  email: string,
  newPassword: string
) {
  try {

    // 1. tìm user
    const user = await getUser(email);

    if (!user) {
      return { success: false, message: "Email doesn't exist" };
    }

    
    const hashed = await bcrypt.hash(newPassword, 10);

    await updatePassword(user.user_id.toString(), hashed);

    await deleteOTP(user.user_id.toString());

    return {
      success: true,
      message: "Reset password successfully",
    };

  } catch (error) {
    console.error("resetPassword error:", error);

    return {
      success: false,
      message: "Server error",
    };
  }}