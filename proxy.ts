import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken,refreshRefreshToken,verifyToken } from "./helpers/authenHelper";

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

  const {user, newAccessToken, newRefreshToken } = await handleTokens(accessToken, refreshToken);

  const res = NextResponse.next();


  if (newAccessToken) {
    res.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60, // 1 giờ
    });
  }
  if (newRefreshToken) {
    res.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 ngày
    });
  }

  const onDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (onDashboard && !user) {
  return NextResponse.redirect(new URL("/login", req.url));
}

// if (!onDashboard && user) {
//   return NextResponse.redirect(new URL("/swagger", req.url));
// }
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
