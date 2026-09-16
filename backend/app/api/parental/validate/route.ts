import { NextRequest, NextResponse } from "next/server";
import { withCors } from "@/lib/cors";
import { getScreenTime, isApprovedVideo } from "@/lib/parentalStore";

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return withCors(new NextResponse(null, { status: 204 }), request.headers.get("origin"));
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const childId = searchParams.get("childId") || "default-child";
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return withCors(
      NextResponse.json({ allowed: false, error: "Missing videoId" }, { status: 400 }),
      request.headers.get("origin"),
    );
  }

  // 1. Check approved whitelist
  const isApproved = await isApprovedVideo(childId, videoId);
  if (!isApproved) {
    return withCors(
      NextResponse.json(
        {
          allowed: false,
          reason: "UNAPPROVED",
          message: "This video has not been approved by a parent.",
        },
        { status: 403 },
      ),
      request.headers.get("origin"),
    );
  }

  // 2. Check screen time
  const screenTime = await getScreenTime(childId);
  if (screenTime.remainingSeconds <= 0) {
    return withCors(
      NextResponse.json(
        {
          allowed: false,
          reason: "TIME_EXPIRED",
          message: "Daily screen time limit has been reached for today.",
          remainingSeconds: 0,
        },
        { status: 403 },
      ),
      request.headers.get("origin"),
    );
  }

  return withCors(
    NextResponse.json({
      allowed: true,
      remainingSeconds: screenTime.remainingSeconds,
      totalAllowedMinutes: screenTime.totalAllowedMinutes,
      watchedSeconds: screenTime.watchedSeconds,
    }),
    request.headers.get("origin"),
  );
}
