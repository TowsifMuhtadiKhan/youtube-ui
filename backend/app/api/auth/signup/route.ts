import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withCors } from "@/lib/cors";
import { createUser, promoteUserToAdmin } from "@/lib/authStore";

const signupSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6).max(64),
  role: z.enum(["user", "admin"]).optional(),
  adminCode: z.string().optional(),
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
    const requestedRole = parsed.data.role || "user";
    if (requestedRole === "admin") {
      const expectedAdminCode = process.env.ADMIN_SIGNUP_CODE;
      if (!expectedAdminCode || parsed.data.adminCode !== expectedAdminCode) {
        return withCors(
          NextResponse.json({ error: "Invalid admin signup code" }, { status: 403 }),
          origin,
        );
      }
    }

    const user = await createUser(parsed.data.username, parsed.data.password, requestedRole);
    return withCors(NextResponse.json({ user }, { status: 201 }), origin);
  } catch (error) {
    const requestedRole = parsed.data.role || "user";
    if (
      requestedRole === "admin" &&
      error instanceof Error &&
      error.message === "Username already exists"
    ) {
      const promoted = await promoteUserToAdmin(
        parsed.data.username,
        parsed.data.password,
      );

      if (promoted) {
        return withCors(
          NextResponse.json({ user: promoted, upgraded: true }, { status: 200 }),
          origin,
        );
      }
    }

    const message = error instanceof Error ? error.message : "Signup failed";
    return withCors(
      NextResponse.json({ error: message }, { status: 400 }),
      origin,
    );
  }
}
