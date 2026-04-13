import { NextRequest, NextResponse } from "next/server";
import { withCors } from "@/lib/cors";

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return withCors(
    new NextResponse(null, { status: 204 }),
    request.headers.get("origin"),
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.json({
    ok: true,
    service: "youtube-ui-backend",
  });
  return withCors(response, request.headers.get("origin"));
}
