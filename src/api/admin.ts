import { backendRpc } from "./supabase";
export interface AdminUser {
  id: string;
  username: string;
  role: "user" | "admin";
  createdAt: string;
  playlists?: number;
  videos?: number;
}

export interface AdminOverview {
  totals: {
    users: number;
    admins: number;
    playlists: number;
    videos: number;
  };
  users: AdminUser[];
  playlists: Array<{
    id: string;
    userId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    items: Array<{
      id: string;
      videoId: string;
      title: string;
      url: string;
      thumbnail: string;
      addedAt: string;
    }>;
  }>;
  orphanOwners: Array<{
    ownerId: string;
    playlists: number;
    videos: number;
  }>;
}

export const fetchAdminUsers = async (_adminUsername: string): Promise<AdminUser[]> => backendRpc("admin.users");
export const fetchAdminOverview = async (_adminUsername: string): Promise<AdminOverview> => backendRpc("admin.overview");
export const createPlaylistForUser = async (_adminUsername: string, targetUserId: string, playlistName: string): Promise<void> => {
 await backendRpc("admin.createPlaylist", { targetUserId, playlistName });
};
