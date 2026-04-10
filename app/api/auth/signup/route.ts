/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Đăng ký tài khoản bằng email + password + name
  *     tags:
 *       - Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: admin@gmail.com
 *             password: "123456"
 *             name: admin
 *     responses:
 *       200:
 *         description: OK
 */

import { NextRequest,NextResponse } from "next/server";
import { sanitizeUser } from "@/helpers/authenHelper";
import { createUser } from "@/lib/user";
export async function POST(req:Request) {
  try{
    const data=await req.json()

  const newUser = await createUser({email: data.email, password: data.password, name: data.name, avatar: ""});
if (newUser) {
   return NextResponse.json(await sanitizeUser(newUser) );
} else {
   return NextResponse.json({ message: "User already exists" }, { status: 400 });
}}
catch(error){
    console.error("Failed to create user", error);
    return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
}
}