import { NextResponse } from "next/server";

const getAllowedOrigins = (): string[] => {
  const value = process.env.ALLOWED_ORIGINS || "";
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

export const withCors = (
  response: NextResponse,
  origin: string | null,
): NextResponse => {
  const allowed = getAllowedOrigins();
  const allowAll = allowed.length === 0 || allowed.includes("*");
  const canAllow = allowAll || (!!origin && allowed.includes(origin));

  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization",
  );

  if (canAllow) {
    response.headers.set(
      "Access-Control-Allow-Origin",
      allowAll ? "*" : (origin as string),
    );
  }

  return response;
};
