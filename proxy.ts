import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { refreshRefreshToken, verifyToken } from "./helpers/authenHelper";

async function handleTokens(accessToken?: string, refreshToken?: string) {
  let user: any = null;

  if (accessToken) {
    user = await verifyToken(accessToken);

    if (user) {
      return { user, newAccessToken: null, newRefreshToken: null };
    }

    if (refreshToken) {
      try {
        const tokens = await refreshRefreshToken(refreshToken);

        user = await verifyToken(tokens.accessToken);

        return {
          user,
          newAccessToken: tokens.accessToken,
          newRefreshToken: tokens.refreshToken,
        };
      } catch {
        return { user: null, newAccessToken: null, newRefreshToken: null };
      }
    }
  }

  return { user: null, newAccessToken: null, newRefreshToken: null };
}

export default async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const guestId = req.cookies.get("guest_id")?.value;

  const { user, newAccessToken, newRefreshToken } = await handleTokens(
    accessToken,
    refreshToken
  );

  const res = NextResponse.next();

  // =========================
  // ✅ CORS (cho FE 5173)
  // =========================
  res.headers.set("Access-Control-Allow-Origin", "https://xdpm-web.vercel.app/");
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers: res.headers });
  }

  // =========================
  // ✅ Tạo guest_id nếu chưa có
  // =========================
  if (!guestId) {
    res.cookies.set("guest_id", uuidv4(), {
      httpOnly: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 ngày
      sameSite: "lax",
      secure: false, // dev
    });
  }

  // =========================
  // ✅ Refresh token nếu cần
  // =========================
  if (newAccessToken) {
    res.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60,
      sameSite: "lax",
      secure: false,
    });
  }

  if (newRefreshToken) {
    res.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
      secure: false,
    });
  }

  // =========================
  // ✅ Nếu đã login mà vào /login → redirect về FE
  // =========================
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");

  if (isLoginPage && user) {
return NextResponse.redirect(new URL("https://xdpm-web.vercel.app/", req.url));

}

  // =========================
  // ✅ Cho phép tất cả request đi tiếp
  // =========================
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};