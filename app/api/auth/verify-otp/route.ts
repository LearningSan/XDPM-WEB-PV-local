/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Xác minh OTP
 *     description: Kiểm tra OTP dựa trên email người dùng
 *     tags:
 *       - ForgotPassword
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Xác minh OTP thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully
 *       400:
 *         description: OTP không hợp lệ hoặc đã hết hạn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid or expired OTP
 *       500:
 *         description: Lỗi server
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/helpers/passwordHelper";
export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    const result = await verifyOTP(email, otp);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Failed to verify", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}