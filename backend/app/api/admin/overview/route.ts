import { NextRequest, NextResponse } from "next/server";
import { withCors } from "@/lib/cors";
import { isAdminUser, listUsersForAdmin } from "@/lib/authStore";
import { listAllPlaylists } from "@/lib/store";

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return withCors(
    new NextResponse(null, { status: 204 }),
    request.headers.get("origin"),
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  const adminUsername =
    request.nextUrl.searchParams.get("adminUser") ||
    request.headers.get("x-admin-user") ||
    "";

  if (!adminUsername) {
    return withCors(
      NextResponse.json({ error: "Missing admin identity" }, { status: 401 }),
      origin,
    );
  }

  const allowed = await isAdminUser(adminUsername);
  if (!allowed) {
    return withCors(
      NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      origin,
    );
  }

  const users = await listUsersForAdmin();
  const playlists = await listAllPlaylists();

  const playlistCountByOwner = new Map<string, number>();
  const videoCountByOwner = new Map<string, number>();

  playlists.forEach((playlist) => {
    const currentPlaylists = playlistCountByOwner.get(playlist.userId) || 0;
    playlistCountByOwner.set(playlist.userId, currentPlaylists + 1);

    const currentVideos = videoCountByOwner.get(playlist.userId) || 0;
    videoCountByOwner.set(playlist.userId, currentVideos + playlist.items.length);
  });

  const usersWithStats = users.map((user) => ({
    ...user,
    playlists: playlistCountByOwner.get(user.id) || 0,
    videos: videoCountByOwner.get(user.id) || 0,
  }));

  const orphanOwners = Array.from(playlistCountByOwner.keys())
    .filter((ownerId) => !users.some((u) => u.id === ownerId))
    .map((ownerId) => ({
      ownerId,
      playlists: playlistCountByOwner.get(ownerId) || 0,
      videos: videoCountByOwner.get(ownerId) || 0,
    }));

  const totalVideos = playlists.reduce((sum, playlist) => sum + playlist.items.length, 0);

  return withCors(
    NextResponse.json({
      totals: {
        users: users.length,
        admins: users.filter((u) => u.role === "admin").length,
        playlists: playlists.length,
        videos: totalVideos,
      },
      users: usersWithStats,
      playlists,
      orphanOwners,
    }),
    origin,
  );
}
