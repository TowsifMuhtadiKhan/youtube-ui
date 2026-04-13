import { NextRequest, NextResponse } from "next/server";
import { withCors } from "@/lib/cors";
import { isAdminUser, listUsersForAdmin } from "@/lib/authStore";
import { listAllPlaylists } from "@/lib/store";

interface CountPoint {
  label: string;
  count: number;
}

const last7Days = (): string[] => {
  const result: string[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    result.push(d.toISOString().slice(0, 10));
  }

  return result;
};

const buildSeries = (labels: string[]): Record<string, number> => {
  return labels.reduce<Record<string, number>>((acc, label) => {
    acc[label] = 0;
    return acc;
  }, {});
};

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return withCors(
    new NextResponse(null, { status: 204 }),
    request.headers.get("origin"),
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  const adminUsername = request.headers.get("x-admin-user") || "";

  if (!adminUsername) {
    return withCors(
      NextResponse.json({ error: "Missing admin header" }, { status: 401 }),
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

  const totalSongs = playlists.reduce((sum, p) => sum + p.items.length, 0);
  const labels = last7Days();

  const usersByDay = buildSeries(labels);
  const playlistsByDay = buildSeries(labels);
  const songsByDay = buildSeries(labels);

  users.forEach((u) => {
    const day = new Date(u.createdAt).toISOString().slice(0, 10);
    if (day in usersByDay) {
      usersByDay[day] += 1;
    }
  });

  playlists.forEach((p) => {
    const day = new Date(p.createdAt).toISOString().slice(0, 10);
    if (day in playlistsByDay) {
      playlistsByDay[day] += 1;
    }

    p.items.forEach((item) => {
      const itemDay = new Date(item.addedAt).toISOString().slice(0, 10);
      if (itemDay in songsByDay) {
        songsByDay[itemDay] += 1;
      }
    });
  });

  const roleByUserId = new Map<string, string>();
  users.forEach((u) => roleByUserId.set(u.id, u.role));

  const songsByOwner = new Map<string, { owner: string; songs: number; playlists: number; role: string }>();
  playlists.forEach((p) => {
    const current = songsByOwner.get(p.userId) || {
      owner: p.userId,
      songs: 0,
      playlists: 0,
      role: roleByUserId.get(p.userId) || "unknown",
    };

    current.songs += p.items.length;
    current.playlists += 1;
    songsByOwner.set(p.userId, current);
  });

  const topOwners = Array.from(songsByOwner.values())
    .sort((a, b) => b.songs - a.songs)
    .slice(0, 5);

  const topPlaylists = playlists
    .map((p) => ({
      id: p.id,
      name: p.name,
      owner: p.userId,
      songCount: p.items.length,
      createdAt: p.createdAt,
    }))
    .sort((a, b) => b.songCount - a.songCount)
    .slice(0, 8);

  const asPoints = (source: Record<string, number>): CountPoint[] =>
    labels.map((label) => ({ label, count: source[label] || 0 }));

  return withCors(
    NextResponse.json({
      totals: {
        users: users.length,
        admins: users.filter((u) => u.role === "admin").length,
        regularUsers: users.filter((u) => u.role === "user").length,
        playlists: playlists.length,
        songs: totalSongs,
        avgSongsPerPlaylist:
          playlists.length > 0 ? Number((totalSongs / playlists.length).toFixed(2)) : 0,
      },
      trends: {
        usersByDay: asPoints(usersByDay),
        playlistsByDay: asPoints(playlistsByDay),
        songsByDay: asPoints(songsByDay),
      },
      topOwners,
      topPlaylists,
    }),
    origin,
  );
}
