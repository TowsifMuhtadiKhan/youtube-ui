import { kv } from "@vercel/kv";
import type { Playlist, PlaylistItem } from "@/types/playlist";

const inMemory = new Map<string, Playlist[]>();

const hasKv = () =>
  !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

const keyFor = (userId: string) => `playlists:user:${userId}`;

const randomId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const getList = async (userId: string): Promise<Playlist[]> => {
  if (hasKv()) {
    return (await kv.get<Playlist[]>(keyFor(userId))) || [];
  }
  return inMemory.get(userId) || [];
};

const setList = async (
  userId: string,
  playlists: Playlist[],
): Promise<void> => {
  if (hasKv()) {
    await kv.set(keyFor(userId), playlists);
    return;
  }
  inMemory.set(userId, playlists);
};

export const listPlaylists = async (userId: string): Promise<Playlist[]> => {
  return getList(userId);
};

export const createPlaylist = async (
  userId: string,
  name: string,
): Promise<Playlist> => {
  const now = new Date().toISOString();
  const playlists = await getList(userId);

  const playlist: Playlist = {
    id: randomId(),
    userId,
    name,
    createdAt: now,
    updatedAt: now,
    items: [],
  };

  const updated = [playlist, ...playlists];
  await setList(userId, updated);
  return playlist;
};

export const addItemToPlaylist = async (
  userId: string,
  playlistId: string,
  item: Omit<PlaylistItem, "id" | "addedAt">,
): Promise<Playlist> => {
  const playlists = await getList(userId);
  const index = playlists.findIndex((p) => p.id === playlistId);

  if (index === -1) {
    throw new Error("Playlist not found");
  }

  const existing = playlists[index];
  if (existing.items.some((it) => it.videoId === item.videoId)) {
    return existing;
  }

  const nextItem: PlaylistItem = {
    id: randomId(),
    addedAt: new Date().toISOString(),
    ...item,
  };

  const updatedPlaylist: Playlist = {
    ...existing,
    updatedAt: new Date().toISOString(),
    items: [nextItem, ...existing.items],
  };

  const next = [...playlists];
  next[index] = updatedPlaylist;
  await setList(userId, next);
  return updatedPlaylist;
};

export const listAllPlaylists = async (): Promise<Playlist[]> => {
  if (hasKv()) {
    const keys = await kv.keys("playlists:user:*");
    if (!keys.length) {
      return [];
    }

    const all = await Promise.all(keys.map((key) => kv.get<Playlist[]>(key)));
    return all.flatMap((entry) => entry || []);
  }

  return Array.from(inMemory.values()).flatMap((entry) => entry);
};
