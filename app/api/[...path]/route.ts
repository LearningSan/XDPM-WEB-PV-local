import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// ─────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────
function cors() {
  return {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, authorId",
  };
}

// ─────────────────────────────────────────────
// OPTIONS (preflight)
// ─────────────────────────────────────────────
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: cors(),
  });
}

// ─────────────────────────────────────────────
// HANDLERS
// ─────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: any) {
  return forward(req, params, req.method);
}

export async function POST(req: NextRequest, { params }: any) {
  return forward(req, params, req.method);
}

export async function PUT(req: NextRequest, { params }: any) {
  return forward(req, params, req.method);
}

export async function DELETE(req: NextRequest, { params }: any) {
  return forward(req, params, req.method);
}

// ─────────────────────────────────────────────
// CORE PROXY
// ─────────────────────────────────────────────
async function forward(req: NextRequest, params: any, method: string) {
  const { path } = await params;
  const fullPath = path?.join("/") || "";

  console.log("🔥 HIT PROXY:", method, fullPath);

  const accessToken = req.cookies.get("access_token")?.value;

  // 🔥 decode JWT để lấy userId
  let userId: string | undefined;
if (accessToken) {
  try {
    const decoded: any = jwt.decode(accessToken);

    console.log("DECODE:", decoded);

    userId = decoded?.user_id; // 🔥 FIX CHÍNH
  } catch (e) {
    console.log("JWT decode failed");
  }
}

  // ───── đọc body 1 lần duy nhất ─────
  let body;

  if (!["GET", "DELETE"].includes(method)) {
    const rawBody = await req.text();
    console.log("BODY FROM FE:", rawBody);

    body = rawBody || undefined;
  }

  try {
    const headers: any = {
      "Content-Type": "application/json",
    };

    // ✔ forward token (thử 2 format)
   if (accessToken) {
  headers.Authorization = `Bearer ${accessToken}`; // ✅ đúng chuẩn
}
    // 🔥 QUAN TRỌNG: inject authorId
    if (userId) {
      headers.authorId = userId;
    }

    console.log("HEADERS gửi BE2:", headers);

    const res = await fetch(
      `https://nhom15-chieu-t6.onrender.com/api/${fullPath}`,
      {
        method,
        headers,
        body,
        signal: AbortSignal.timeout(15000),
      }
    );

    const text = await res.text();

    if (res.status >= 400) {
      console.error(`🔥 BE2 ERROR ${res.status}:`, text);
    }

    // ✔ trả về FE + giữ status BE2
    return new Response(text, {
      status: res.status,
      headers: cors(),
    });
  } catch (err) {
    console.error("🔥 BE2 CATCH ERROR:", err);

    return new Response(
      JSON.stringify({ error: "BE2 unreachable", details: String(err) }),
      {
        status: 502,
        headers: cors(),
      }
    );
  }
}