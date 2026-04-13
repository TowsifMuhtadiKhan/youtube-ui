import { NextRequest, NextResponse } from "next/server";
import { withCors } from "@/lib/cors";
import { getUserDetails } from "@/lib/authStore";

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return withCors(
    new NextResponse(null, { status: 204 }),
    request.headers.get("origin"),
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  const username = request.nextUrl.searchParams.get("username") || "";

  if (!username) {
    return withCors(
      NextResponse.json({ error: "username is required" }, { status: 400 }),
      origin,
    );
  }

  const user = await getUserDetails(username);
  if (!user) {
    return withCors(
      NextResponse.json({ error: "User not found" }, { status: 404 }),
      origin,
    );
  }

  return withCors(NextResponse.json({ user }), origin);
}
