
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getUser } from "@/lib/user";
import { createVerifytoken,getTokenByUserId } from "@/lib/refresh_token";
import { NextRequest,NextResponse } from "next/server";
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
  const user = await getUser(email);
  if (!user || !user.passwordHash) return null;
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return null;

  return await sanitizeUser(user)
}

export async function sanitizeUser(user:UserType) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
export async function createToken(
  user: { user_id: string; email: string; name: string }
): Promise<TokenResponse> {
  if (!user.user_id) throw new Error("User ID is required");

  const accessToken = jwt.sign(
    { user_id: user.user_id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  const expiresAtStr = expiresAt.toISOString().slice(0, 19).replace("T", " ");

  const refreshToken = jwt.sign(
    { user_id: user.user_id, email: user.email },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const result = await createVerifytoken(
    user.user_id,
    refreshTokenHash,
    expiresAtStr
  );

  if (!result) {
    throw new Error("Failed to store refresh token");
  }

  return {
    accessToken,
    refreshToken,
  };
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

  // ✅ SO SÁNH HASH (BẮT BUỘC)
  const isMatch = await bcrypt.compare(oldRefreshToken, session.token);

  if (!isMatch) {
    throw new Error("Refresh token mismatch");
  }

  // 🔥 tạo access token mới
  const newAccessToken = jwt.sign(
    { user_id: payload.user_id, email: payload.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  const expiresAtStr = expiresAt.toISOString().slice(0, 19).replace("T", " ");


const newRefreshToken = jwt.sign(
    { user_id: payload.user_id, email: payload.email },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // 🔥 update lại DB (QUAN TRỌNG)
  const newHash = await bcrypt.hash(newRefreshToken, 10);
  await createVerifytoken(userId, newHash, expiresAtStr);

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