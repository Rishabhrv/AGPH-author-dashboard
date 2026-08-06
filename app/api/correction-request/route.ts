import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("bookId");

  if (!bookId) {
    return NextResponse.json({ success: false, message: "Missing bookId" }, { status: 400 });
  }

  const token = cookies().get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = process.env.API_URL || "http://localhost:5001";

  try {
    const formData = await request.formData();

    const res = await fetch(
      `${apiUrl}/api/author/books-progress/${bookId}/request-correction`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        cache: "no-store",
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (err) {
    console.error("Correction request proxy error:", err);
    return NextResponse.json({ success: false, message: "Network error" }, { status: 500 });
  }
}
