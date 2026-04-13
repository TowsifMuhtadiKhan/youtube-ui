import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withCors } from "@/lib/cors";
import { createUser } from "@/lib/authStore";

const signupSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6).max(64),
});

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return withCors(
    new NextResponse(null, { status: 204 }),
    request.headers.get("origin"),
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return withCors(
      NextResponse.json({ error: "Invalid signup data" }, { status: 400 }),
      origin,
    );
  }

  try {
    const user = await createUser(parsed.data.username, parsed.data.password);
    return withCors(NextResponse.json({ user }, { status: 201 }), origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed";
    return withCors(
      NextResponse.json({ error: message }, { status: 400 }),
      origin,
    );
  }
}
