import { NextRequest, NextResponse } from "next/server";
import { withCors } from "@/lib/cors";
import { recordWatchTime } from "@/lib/parentalStore";

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return withCors(new NextResponse(null, { status: 204 }), request.headers.get("origin"));
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  if (!body || !body.youtubeVideoId) {
    return withCors(
      NextResponse.json({ error: "Missing required tracking parameters" }, { status: 400 }),
      request.headers.get("origin"),
    );
  }

  const childId = body.childId || "default-child";
  const seconds = typeof body.seconds === "number" ? body.seconds : 5;

  const result = await recordWatchTime(childId, body.youtubeVideoId, seconds);

  return withCors(
    NextResponse.json(result, { status: result.allowed ? 200 : 403 }),
    request.headers.get("origin"),
  );
}
