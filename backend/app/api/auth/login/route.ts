import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withCors } from "@/lib/cors";
import { validateUser } from "@/lib/authStore";

const loginSchema = z.object({
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
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return withCors(
      NextResponse.json({ error: "Invalid login data" }, { status: 400 }),
      origin,
    );
  }

  const user = await validateUser(parsed.data.username, parsed.data.password);
  if (!user) {
    return withCors(
      NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      ),
      origin,
    );
  }

  return withCors(NextResponse.json({ user }), origin);
}
