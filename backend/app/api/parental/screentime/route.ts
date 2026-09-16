import { NextRequest, NextResponse } from "next/server";
import { withCors } from "@/lib/cors";
import {
  addBonusMinutes,
  getScreenTime,
  updateDailyLimit,
} from "@/lib/parentalStore";

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return withCors(new NextResponse(null, { status: 204 }), request.headers.get("origin"));
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const childId = searchParams.get("childId") || "default-child";
  const date = searchParams.get("date") || undefined;

  const screenTime = await getScreenTime(childId, date);
  return withCors(NextResponse.json(screenTime), request.headers.get("origin"));
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  if (!body) {
    return withCors(
      NextResponse.json({ error: "Invalid request body" }, { status: 400 }),
      request.headers.get("origin"),
    );
  }

  const childId = body.childId || "default-child";

  if (body.action === "setLimit" && typeof body.dailyLimitMinutes === "number") {
    const updated = await updateDailyLimit(childId, Math.max(1, body.dailyLimitMinutes));
    return withCors(NextResponse.json(updated), request.headers.get("origin"));
  }

  if (body.action === "addBonus" && typeof body.bonusMinutes === "number") {
    const updated = await addBonusMinutes(childId, Math.max(1, body.bonusMinutes));
    return withCors(NextResponse.json(updated), request.headers.get("origin"));
  }

  return withCors(
    NextResponse.json({ error: "Invalid action or parameters" }, { status: 400 }),
    request.headers.get("origin"),
  );
}
