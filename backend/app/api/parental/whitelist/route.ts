import { NextRequest, NextResponse } from "next/server";
import { hasMongo } from "@/lib/mongo";
import { withCors } from "@/lib/cors";
import {
  addApprovedVideo,
  getApprovedVideos,
  removeApprovedVideo,
} from "@/lib/parentalStore";

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return withCors(new NextResponse(null, { status: 204 }), request.headers.get("origin"));
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const childId = searchParams.get("childId") || "default-child";

  const list = await getApprovedVideos(childId);
  return withCors(
    NextResponse.json({ approvedVideos: list }),
    request.headers.get("origin"),
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  if (!body || !body.youtubeVideoId || !body.title) {
    return withCors(
      NextResponse.json({ error: "Missing required video details" }, { status: 400 }),
      request.headers.get("origin"),
    );
  }

  if (!hasMongo() && !(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)) {
    return withCors(NextResponse.json({ error: "Video was not saved: configure MongoDB or KV on the backend for persistent storage." }, { status: 503 }), request.headers.get("origin"));
  }
  if (!/^[A-Za-z0-9_-]{11}$/.test(body.youtubeVideoId) || typeof body.title !== "string" || !body.title.trim()) {
    return withCors(NextResponse.json({ error: "Invalid video ID or title" }, { status: 400 }), request.headers.get("origin"));
  }
  const childId = body.childId || "default-child";
  try {
  const updated = await addApprovedVideo(childId, {
    youtubeVideoId: body.youtubeVideoId,
    title: body.title,
    thumbnail: body.thumbnail || `https://img.youtube.com/vi/${body.youtubeVideoId}/hqdefault.jpg`,
    channelName: body.channelName || "YouTube",
    duration: body.duration || "",
  });

  return withCors(
    NextResponse.json({ success: true, approvedVideos: updated }),
    request.headers.get("origin"),
  );
  } catch {
    return withCors(NextResponse.json({ error: "Could not save the selected video to the database. Please try again." }, { status: 503 }), request.headers.get("origin"));
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  let childId = "default-child";
  let youtubeVideoId = "";

  const { searchParams } = new URL(request.url);
  if (searchParams.get("youtubeVideoId")) {
    childId = searchParams.get("childId") || "default-child";
    youtubeVideoId = searchParams.get("youtubeVideoId")!;
  } else {
    const body = await request.json().catch(() => null);
    if (body) {
      childId = body.childId || "default-child";
      youtubeVideoId = body.youtubeVideoId;
    }
  }

  if (!youtubeVideoId) {
    return withCors(
      NextResponse.json({ error: "Missing youtubeVideoId" }, { status: 400 }),
      request.headers.get("origin"),
    );
  }

  const updated = await removeApprovedVideo(childId, youtubeVideoId);
  return withCors(
    NextResponse.json({ success: true, approvedVideos: updated }),
    request.headers.get("origin"),
  );
}
