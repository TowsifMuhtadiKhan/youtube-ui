import { backendRpc } from "./supabase";
import type { ApprovedVideo } from "./parentalApi";
export type Audience = "parent" | "kids";
export type VideoInput = Pick<
  ApprovedVideo,
  "youtubeVideoId" | "title" | "thumbnail" | "channelName"
>;
export interface LibraryPlaylist {
  id: string;
  name: string;
  audience: Audience;
  items: { id: string; videoId: string; title: string; thumbnail: string }[];
}
export interface HistoryVideo extends VideoInput {
  audience: Audience;
  watchedSeconds: number;
  lastWatchedAt: string;
  available: boolean;
}
export const listVideos = (audience: Audience) =>
  backendRpc<ApprovedVideo[]>("videos.list", { audience });
export const saveVideo = (audience: Audience, video: VideoInput) =>
  backendRpc<ApprovedVideo[]>("videos.approve", { audience, ...video });
export const deleteVideo = (audience: Audience, youtubeVideoId: string) =>
  backendRpc<ApprovedVideo[]>("videos.remove", { audience, youtubeVideoId });
export const listPlaylists = (audience: Audience) =>
  backendRpc<LibraryPlaylist[]>("playlists.list", { audience });
export const newPlaylist = (audience: Audience, name: string) =>
  backendRpc<LibraryPlaylist>("playlists.create", { audience, name });
export const deletePlaylist = (audience: Audience, playlistId: string) =>
  backendRpc("playlists.delete", { audience, playlistId });
export const addToPlaylist = (
  audience: Audience,
  playlistId: string,
  video: VideoInput,
) =>
  backendRpc<LibraryPlaylist>("playlists.add", {
    audience,
    playlistId,
    ...video,
  });
export const removeFromPlaylist = (
  audience: Audience,
  playlistId: string,
  youtubeVideoId: string,
) =>
  backendRpc<LibraryPlaylist>("playlists.remove", {
    audience,
    playlistId,
    youtubeVideoId,
  });
export const listHistory = (audience: Audience) =>
  backendRpc<HistoryVideo[]>("history.list", { audience });
export const clearHistory = (audience: Audience) =>
  backendRpc("history.clear", { audience });
export const recordHistory = (audience: Audience, youtubeVideoId: string) =>
  backendRpc("history.record", { audience, youtubeVideoId });
export const trackParentHistory = (youtubeVideoId: string, seconds: number) =>
  backendRpc("history.track", { audience: "parent", youtubeVideoId, seconds });
export function decodeTitle(value: string) {
  const el = document.createElement("textarea");
  el.innerHTML = value;
  return el.value;
}
