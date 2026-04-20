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
  const transporter = await nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Mã OTP đặt lại mật khẩu",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

          <h2 style="color: #333;">🔐 Xác thực OTP</h2>

          <p style="color: #555; font-size: 14px;">
            Bạn vừa yêu cầu đặt lại mật khẩu.<br/>
            Sử dụng mã OTP bên dưới để tiếp tục:
          </p>

          <div style="
            margin: 25px 0;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 6px;
            color: #4CAF50;
            background: #f1f8f4;
            padding: 15px;
            border-radius: 8px;
            display: inline-block;
          ">
            ${otp}
          </div>

          <p style="font-size: 13px; color: #999;">
            Mã này sẽ hết hạn sau <b>5 phút</b>.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

          <p style="font-size: 12px; color: #999;">
            Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
          </p>

        </div>
      </div>
      `,
    });

    console.log(" Mail sent:", info);

  } catch (err) {
    console.error("Send mail error:", err);
    throw err;
  }
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