import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { createToken,setCookies } from "@/helpers/authenHelper";
import { getUser } from "@/lib/user";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await getUser(session.user.email);
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
let tokens
 try {
  tokens = await createToken({
    user_id: dbUser.user_id,
    email: dbUser.email,
    name: dbUser.name,
  });
} catch (err) {
  return NextResponse.json(
    { error: "Failed to create tokens" },
    { status: 500 }
  );
}

const res = NextResponse.json({ ok: true });

if (!tokens) {
  return NextResponse.json(
    { error: "Token creation failed" },
    { status: 500 }
  );
}

await setCookies(res, tokens.accessToken, tokens.refreshToken);

return res;
}