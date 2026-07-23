import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
  }

  const token = cookies().get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = process.env.API_URL || "http://localhost:5001";

  try {
    const res = await fetch(`${apiUrl}/api/author/drive-file/${fileId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Don't cache — always fetch fresh from Drive
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file from backend" },
        { status: res.status }
      );
    }

    const pdfBytes = await res.arrayBuffer();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        // Allow the iframe to display it
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (err) {
    console.error("Drive proxy error:", err);
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
