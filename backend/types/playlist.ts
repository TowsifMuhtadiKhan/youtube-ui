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
