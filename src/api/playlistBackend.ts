import { backendRpc } from "./supabase";
import { fetchVideoDetails } from "./youtube";
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

export const getOrCreateClientUserId = (): string => "current-user";
export const fetchPlaylists = async (_userId: string): Promise<Playlist[]> => backendRpc("playlists.list");
export const createPlaylist = async (_userId: string, name: string): Promise<Playlist> => backendRpc("playlists.create", { name });
export const addYoutubeUrlToPlaylist = async (_userId: string, playlistId: string, youtubeUrl: string): Promise<Playlist> => {
 let id = youtubeUrl.trim();
 if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
  const url = new URL(id);
  if (!["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(url.hostname)) throw new Error("Enter a YouTube video link.");
  id = url.hostname === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v") || url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1] || "";
 }
 if (!/^[A-Za-z0-9_-]{11}$/.test(id)) throw new Error("Invalid YouTube video link.");
 const video = await fetchVideoDetails(id);
 return backendRpc("playlists.add", { playlistId, youtubeVideoId: id, title: video?.title || "YouTube Video", thumbnail: video?.thumbnail || "https://img.youtube.com/vi/" + id + "/hqdefault.jpg" });
};
