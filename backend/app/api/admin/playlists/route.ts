import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withCors } from "@/lib/cors";
import { createPlaylist } from "@/lib/store";
import { isAdminUser, listUsersForAdmin } from "@/lib/authStore";

const schema = z.object({
  adminUser: z.string().min(3),
  targetUserId: z.string().min(3),
  playlistName: z.string().min(1).max(80),
});

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return withCors(new NextResponse(null, { status: 204 }), request.headers.get("origin"));
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return withCors(NextResponse.json({ error: "Invalid request body" }, { status: 400 }), origin);
  }

  const allowed = await isAdminUser(parsed.data.adminUser);
  if (!allowed) {
    return withCors(NextResponse.json({ error: "Forbidden" }, { status: 403 }), origin);
  }

  const users = await listUsersForAdmin();
  const target = users.find((u) => u.id === parsed.data.targetUserId);

  if (!target) {
    return withCors(NextResponse.json({ error: "Target user not found" }, { status: 404 }), origin);
  }

  const playlist = await createPlaylist(target.id, parsed.data.playlistName.trim());
  return withCors(NextResponse.json({ playlist }, { status: 201 }), origin);
}
