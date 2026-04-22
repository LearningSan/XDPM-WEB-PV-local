export async function GET(req: Request, { params }: any) {
  return forward(req, params)
}

export async function POST(req: Request, { params }: any) {
  return forward(req, params)
}

export async function PUT(req: Request, { params }: any) {
  return forward(req, params)
}

export async function DELETE(req: Request, { params }: any) {
  return forward(req, params)
}

async function forward(req: Request, params: any) {
  const path = params.path.join("/")

  // Lấy token từ cookie BE1
  const cookieHeader = req.headers.get("cookie") || ""
  const accessTokenMatch = cookieHeader.match(/access_token=([^;]+)/)
  const accessToken = accessTokenMatch?.[1]

  const res = await fetch(`https://xdpm-web.onrender.com/api/${path}`, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",

      // ✔ CHUẨN NHẤT: gửi JWT sang BE2
      ...(accessToken && {
        Authorization: `Bearer ${accessToken}`
      })
    },

    body: ["GET", "DELETE"].includes(req.method)
      ? undefined
      : await req.text()
  })

  // an toàn hơn (tránh crash nếu BE2 không trả JSON)
  const text = await res.text()

  try {
    return Response.json(JSON.parse(text))
  } catch {
    return new Response(text)
  }
}