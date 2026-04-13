import { NextRequest, NextResponse } from "next/server";
import { withCors } from "@/lib/cors";
import { isAdminUser, listUsersForAdmin } from "@/lib/authStore";

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return withCors(
    new NextResponse(null, { status: 204 }),
    request.headers.get("origin"),
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  const adminUsername = request.headers.get("x-admin-user") || "";

  if (!adminUsername) {
    return withCors(
      NextResponse.json({ error: "Missing admin header" }, { status: 401 }),
      origin,
    );
  }

  const allowed = await isAdminUser(adminUsername);
  if (!allowed) {
    return withCors(
      NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      origin,
    );
  }

  const users = await listUsersForAdmin();
  return withCors(NextResponse.json({ users }), origin);
}
