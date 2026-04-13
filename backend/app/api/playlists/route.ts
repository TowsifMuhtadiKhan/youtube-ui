import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withCors } from "@/lib/cors";
import { createPlaylist, listPlaylists } from "@/lib/store";

const createPlaylistSchema = z.object({
  userId: z.string().min(3),
  name: z.string().min(1).max(80),
});

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return withCors(
    new NextResponse(null, { status: 204 }),
    request.headers.get("origin"),
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.nextUrl.searchParams.get("userId") || "";
  if (!userId) {
    return withCors(
      NextResponse.json({ error: "userId is required" }, { status: 400 }),
      request.headers.get("origin"),
    );
  }

  const playlists = await listPlaylists(userId);
  return withCors(
    NextResponse.json({ playlists }),
    request.headers.get("origin"),
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  const parsed = createPlaylistSchema.safeParse(body);

  if (!parsed.success) {
    return withCors(
      NextResponse.json({ error: "Invalid request body" }, { status: 400 }),
      request.headers.get("origin"),
    );
  }

  const playlist = await createPlaylist(
    parsed.data.userId,
    parsed.data.name.trim(),
  );
  return withCors(
    NextResponse.json({ playlist }, { status: 201 }),
    request.headers.get("origin"),
  );
}
