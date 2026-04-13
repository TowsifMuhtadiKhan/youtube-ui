export interface PlaylistItem {
  id: string;
  videoId: string;
  url: string;
  title: string;
  thumbnail: string;
  addedAt: string;
}

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: PlaylistItem[];
}

const API_BASE =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const toUrl = (path: string) => `${API_BASE}${path}`;

export const getOrCreateClientUserId = (): string => {
  const key = "ytui_user_id";
  const existing = localStorage.getItem(key);
  if (existing) {
    return existing;
  }

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  localStorage.setItem(key, next);
  return next;
};

export const fetchPlaylists = async (userId: string): Promise<Playlist[]> => {
  const response = await fetch(
    toUrl(`/api/playlists?userId=${encodeURIComponent(userId)}`),
  );
  if (!response.ok) {
    throw new Error("Failed to load playlists");
  }

  const data = (await response.json()) as { playlists: Playlist[] };
  return data.playlists;
};

export const createPlaylist = async (
  userId: string,
  name: string,
): Promise<Playlist> => {
  const response = await fetch(toUrl("/api/playlists"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, name }),
  });

  const data = (await response.json()) as {
    playlist?: Playlist;
    error?: string;
  };
  if (!response.ok || !data.playlist) {
    throw new Error(data.error || "Failed to create playlist");
  }

  return data.playlist;
};

export const addYoutubeUrlToPlaylist = async (
  userId: string,
  playlistId: string,
  youtubeUrl: string,
): Promise<Playlist> => {
  const response = await fetch(toUrl(`/api/playlists/${playlistId}/items`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, youtubeUrl }),
  });

  const data = (await response.json()) as {
    playlist?: Playlist;
    error?: string;
  };
  if (!response.ok || !data.playlist) {
    throw new Error(data.error || "Failed to add video");
  }

  return data.playlist;
};
