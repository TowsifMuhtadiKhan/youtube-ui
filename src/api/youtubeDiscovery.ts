import { fetchSearchResults, type YouTubeVideoInfo } from "./youtube";

export interface ChannelResult {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
}
export interface DiscoveryPage {
  videos: YouTubeVideoInfo[];
  channels?: ChannelResult[];
  playlistId?: string;
  nextPageToken?: string;
}
type Item = {
  id: string | { channelId: string };
  snippet: {
    title: string;
    channelTitle?: string;
    description?: string;
    thumbnails?: Record<string, { url: string }>;
  };
  contentDetails?: {
    relatedPlaylists?: { uploads?: string };
    videoId?: string;
  };
  status?: { embeddable?: boolean };
};
async function request(
  endpoint: string,
  params: Record<string, string>,
): Promise<{ items: Item[]; nextPageToken?: string }> {
  const key = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!key)
    throw new Error(
      "YouTube is unavailable. Configure the YouTube API key and try again.",
    );
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/${endpoint}?${new URLSearchParams({ ...params, key })}`,
    { signal: AbortSignal.timeout(20000) },
  );
  const data = await response.json();
  if (!response.ok || data.error)
    throw new Error(
      data.error?.message ||
        "Unable to load YouTube content. Please try again.",
    );
  return { items: data.items || [], nextPageToken: data.nextPageToken };
}
function youtubeUrl(input: string): URL | undefined {
  if (
    !/^(https?:\/\/|(?:www\.|m\.|music\.)?youtube\.com\/|youtu\.be\/)/i.test(
      input,
    )
  )
    return;
  const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  if (
    ![
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "music.youtube.com",
      "youtu.be",
      "www.youtu.be",
      "youtube-nocookie.com",
      "www.youtube-nocookie.com",
    ].includes(url.hostname.toLowerCase())
  )
    throw new Error("Please enter a YouTube link.");
  return url;
}
const thumbnail = (item: Item) =>
  item.snippet.thumbnails?.high?.url ||
  item.snippet.thumbnails?.medium?.url ||
  item.snippet.thumbnails?.default?.url ||
  "";
async function videoDetails(ids: string[]): Promise<YouTubeVideoInfo[]> {
  if (!ids.length) return [];
  const data = await request("videos", {
    part: "snippet,status",
    id: ids.join(","),
  });
  const mapped = data.items
    .filter((i) => i.status?.embeddable !== false)
    .map((i) => ({
      id: String(i.id),
      title: i.snippet.title,
      thumbnail: thumbnail(i),
      subTitle: i.snippet.channelTitle || "",
      link: `https://www.youtube.com/watch?v=${i.id}`,
    }));
  return ids.flatMap((id) => mapped.find((v) => v.id === id) || []);
}
export async function loadYouTubePlaylist(
  playlistId: string,
  pageToken = "",
): Promise<DiscoveryPage> {
  const data = await request("playlistItems", {
    part: "contentDetails",
    playlistId,
    maxResults: "24",
    ...(pageToken ? { pageToken } : {}),
  });
  const ids = [
    ...new Set(
      data.items
        .map((i) => i.contentDetails?.videoId)
        .filter((id): id is string => !!id),
    ),
  ];
  return {
    videos: await videoDetails(ids),
    playlistId,
    nextPageToken: data.nextPageToken,
  };
}
export async function loadChannelVideos(
  channelId: string,
): Promise<DiscoveryPage> {
  const data = await request("channels", {
    part: "contentDetails",
    id: channelId,
  });
  const uploads = data.items[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error("This channel has no accessible uploads.");
  return loadYouTubePlaylist(uploads);
}
export async function discoverYouTube(
  input: string,
  source: "videos" | "channel" | "playlist",
): Promise<DiscoveryPage> {
  const value = input.trim();
  const url = youtubeUrl(value);
  const segments = url?.pathname.split("/").filter(Boolean).map(decodeURIComponent) || [];
  if (
    source === "playlist" ||
    (url?.searchParams.has("list") && !url.searchParams.has("v"))
  ) {
    const id = url ? url.searchParams.get("list") : value;
    if (!id || !/^[\w-]+$/.test(id))
      throw new Error("Enter a YouTube playlist link or playlist ID.");
    return loadYouTubePlaylist(id);
  }
  if (
    source === "channel" ||
    (url && ["channel", "user", "c"].includes(segments[0])) ||
    segments[0]?.startsWith("@") ||
    value.startsWith("@")
  ) {
    const handle = segments[0]?.startsWith("@")
      ? segments[0]
      : value.startsWith("@")
        ? value
        : undefined;
    const id =
      segments[0] === "channel"
        ? segments[1]
        : /^UC[\w-]{22}$/.test(value)
          ? value
          : undefined;
    const username = segments[0] === "user" ? segments[1] : undefined;
    if (handle || id || username) {
      const data = await request("channels", {
        part: "contentDetails",
        ...(handle
          ? { forHandle: handle }
          : id
            ? { id }
            : { forUsername: username! }),
      });
      const uploads = data.items[0]?.contentDetails?.relatedPlaylists?.uploads;
      if (!uploads)
        throw new Error("Channel not found. Try its @handle or channel link.");
      return loadYouTubePlaylist(uploads);
    }
    if (url && segments[0] !== "c")
      throw new Error("Enter a channel name, @handle, or channel link.");
    const data = await request("search", {
      part: "snippet",
      type: "channel",
      q: url ? segments[1] : value,
      maxResults: "12",
    });
    return {
      videos: [],
      channels: data.items.map((i) => ({
        id: typeof i.id === "string" ? i.id : i.id.channelId,
        title: i.snippet.title,
        thumbnail: thumbnail(i),
        description: i.snippet.description || "",
      })),
    };
  }
  if (url) {
    const id = url
      ? url.hostname.endsWith("youtu.be")
        ? segments[0]
        : url.searchParams.get("v") ||
          (["embed", "shorts", "live"].includes(segments[0]) ? segments[1] : "")
      : value;
    if (!id || !/^[\w-]{11}$/.test(id))
      throw new Error("Enter a valid YouTube video link.");
    const videos = await videoDetails([id]);
    if (!videos.length)
      throw new Error(
        "This video is unavailable, private, or cannot be embedded.",
      );
    return { videos };
  }
  return { videos: await fetchSearchResults(value, 12, true) };
}
