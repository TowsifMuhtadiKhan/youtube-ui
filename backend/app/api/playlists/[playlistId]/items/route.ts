import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withCors } from "@/lib/cors";
import { addItemToPlaylist } from "@/lib/store";
import { getYouTubeMeta } from "@/lib/youtube";

const addItemSchema = z.object({
  userId: z.string().min(3),
  youtubeUrl: z.string().min(5),
});

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return withCors(
    new NextResponse(null, { status: 204 }),
    request.headers.get("origin"),
  );
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ playlistId: string }> },
): Promise<NextResponse> {
  const { playlistId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = addItemSchema.safeParse(body);

  if (!parsed.success) {
    return withCors(
      NextResponse.json({ error: "Invalid request body" }, { status: 400 }),
      request.headers.get("origin"),
    );
  }

  try {
    const meta = await getYouTubeMeta(parsed.data.youtubeUrl);
    const playlist = await addItemToPlaylist(parsed.data.userId, playlistId, {
      videoId: meta.videoId,
      url: meta.url,
      title: meta.title,
      thumbnail: meta.thumbnail,
    });

    return withCors(
      NextResponse.json({ playlist }),
      request.headers.get("origin"),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add video";
    return withCors(
      NextResponse.json({ error: message }, { status: 400 }),
      request.headers.get("origin"),
    );
  }
}
