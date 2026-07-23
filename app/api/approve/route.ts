import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = cookies().get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = process.env.API_URL || "http://localhost:5001";

  try {
    const body = await request.json();
    const { bookId, approval_type } = body;

    if (!bookId || !approval_type) {
        return NextResponse.json({ success: false, message: "Missing bookId or approval_type" }, { status: 400 });
    }

    const res = await fetch(
      `${apiUrl}/api/author/books-progress/${bookId}/approve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ approval_type }),
        cache: "no-store",
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (err) {
    console.error("Approve proxy error:", err);
    return NextResponse.json({ success: false, message: "Network error" }, { status: 500 });
  }
}
