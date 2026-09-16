import { NextRequest, NextResponse } from "next/server";
import { withCors } from "@/lib/cors";
import { setParentPin, verifyParentPin } from "@/lib/parentalStore";

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return withCors(new NextResponse(null, { status: 204 }), request.headers.get("origin"));
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

  if (body.action === "verify") {
    const isValid = await verifyParentPin(childId, body.pin || "");
    return withCors(
      NextResponse.json({ valid: isValid }),
      request.headers.get("origin"),
    );
  }

  if (body.action === "set") {
    // If currentPin is provided, verify it first (unless it's the very first setup)
    if (body.currentPin) {
      const isCurrentValid = await verifyParentPin(childId, body.currentPin);
      if (!isCurrentValid) {
        return withCors(
          NextResponse.json({ success: false, error: "Incorrect current PIN" }, { status: 400 }),
          request.headers.get("origin"),
        );
      }
    }

    if (!body.newPin || body.newPin.trim().length < 4) {
      return withCors(
        NextResponse.json(
          { success: false, error: "PIN must be at least 4 digits" },
          { status: 400 },
        ),
        request.headers.get("origin"),
      );
    }

    const success = await setParentPin(childId, body.newPin);
    return withCors(
      NextResponse.json({ success }),
      request.headers.get("origin"),
    );
  }

  return withCors(
    NextResponse.json({ error: "Unknown action" }, { status: 400 }),
    request.headers.get("origin"),
  );
}
