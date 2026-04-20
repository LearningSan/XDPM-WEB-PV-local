
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getUser,activateUser } from "@/lib/user";
import { createVerifytoken,getTokenByUserId } from "@/lib/refresh_token";
import { NextRequest,NextResponse } from "next/server";
import { getVerificationByToken,markVerificationUsed } from "@/lib/email_verification";

import nodemailer from "nodemailer";

const JWT_SECRET = process.env.JWT_SECRET! 
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

type UserType = {
  user_id: string;
  username: string;
  email: string;
  name: string;
  passwordHash?: string;
};

type TokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function authenticateUser(email: string, password: string) {
  try {
    const user = await getUser(email);
  if (!user || !user.passwordHash) return null;
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return null;

  return await sanitizeUser(user)
  } catch (error) {
    console.error("Authentication failed:", error);
    throw new Error("Authentication failed");
  }
  
}
export async function sanitizeUser(user:UserType) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
export async function createToken(
  user: { user_id: string; email: string; name: string },
) {
  try {
    if (!user.user_id) throw new Error("User ID is required");

    // =====================
    // ACCESS TOKEN
    // =====================
    const accessToken = jwt.sign(
      { user_id: user.user_id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // =====================
    // REFRESH TOKEN
    // =====================
    const refreshToken = jwt.sign(
      { user_id: user.user_id, email: user.email },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    // =====================
    // EXPIRES DATE (MONGO STYLE)
    // =====================
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // =====================
    // SAVE DB
    // =====================
    const result = await createVerifytoken(
      user.user_id,
      refreshTokenHash,
      expiresAt
    );

    console.log("refresh token saved:", result);

    if (!result) return null;

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("Token creation failed:", error);
    throw new Error("Token creation failed");
  }
}
  
export async function setCookies(response:NextResponse,accessToken:string,refreshToken:string) {
  
    response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: false, // nên true nếu HTTPS
    sameSite: "strict",
    maxAge: 60 * 60 // 1 giờ
  });
  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 
  });
}



export function refreshAccessToken(oldAccessToken: string) {
  let   payload = jwt.verify(oldAccessToken, JWT_SECRET) as JwtPayload;

  const accessToken = jwt.sign(
    { user_id: payload.user_id, email: payload.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  return accessToken;
}


export async function refreshRefreshToken(oldRefreshToken: string) {
  let payload: any;

  try {
    payload = jwt.verify(oldRefreshToken, JWT_REFRESH_SECRET);
  } catch (err) {
    throw new Error("Refresh token expired or invalid");
  }

  const userId = payload.user_id;

  const session = await getTokenByUserId(userId);

  if (!session) {
    throw new Error("No refresh token found");
  }

  const isMatch = await bcrypt.compare(oldRefreshToken, session.token_hash || session.token);

  if (!isMatch) {
    throw new Error("Refresh token mismatch");
  }

  // =========================
  // NEW ACCESS TOKEN
  // =========================
  const newAccessToken = jwt.sign(
    { user_id: payload.user_id, email: payload.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // =========================
  // NEW REFRESH TOKEN
  // =========================
  const newRefreshToken = jwt.sign(
    { user_id: payload.user_id, email: payload.email },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  const newHash = await bcrypt.hash(newRefreshToken, 10);

  // =========================
  // FIX HERE (IMPORTANT)
  // =========================
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await createVerifytoken(
    userId,
    newHash,
    expiresAt
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

  export async function verifyToken(token: string) {
  try {
    let decode = jwt.verify(token, JWT_SECRET) as JwtPayload
    return decode;
  } catch (err) {
    return null;
  }
}

export async function verifyEmailToken(token: string) {
  try {
    const record = await getVerificationByToken(token);

    if (!record) {
      return { success: false, message: "Invalid token" };
    }

    if (record.used_at) {
      return { success: false, message: "Token already used" };
    }

    const now = new Date();
    const expires = new Date(record.expires_at);

    if (now > expires) {
      return { success: false, message: "Token expired" };
    }


    await markVerificationUsed(record.verify_id);
    return {
      success: true,
      message: "Email verified successfully",
    };
  } catch (error) {
    console.error("verifyEmailToken error:", error);
    throw new Error("Failed to verify email");
  }
}

export async function   sendVerifyEmail(email: string, token: string) {
  const transporter = await nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verifyLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Xác thực tài khoản của bạn",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <h2 style="color: #333;">Xác thực Email</h2>
          
          <p style="color: #555; font-size: 14px;">
            Cảm ơn bạn đã đăng ký tài khoản 🎉 <br/>
            Vui lòng nhấn nút bên dưới để xác thực email của bạn.
          </p>

          <a href="${verifyLink}" 
            style="
              display: inline-block;
              margin-top: 20px;
              padding: 12px 24px;
              background-color: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
            ">
            Xác thực ngay
          </a>

          <p style="margin-top: 25px; font-size: 12px; color: #999;">
            Link này sẽ hết hạn sau 15 phút.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

          <p style="font-size: 12px; color: #999;">
            Nếu nút không hoạt động, hãy copy link bên dưới:
          </p>

          <p style="word-break: break-all; font-size: 12px; color: #555;">
            ${verifyLink}
          </p>

        </div>
      </div>
      `,
    });

  } catch (error) {
    console.error("sendVerifyEmail error:", error);
    throw new Error("Failed to send verify email");
  }
}