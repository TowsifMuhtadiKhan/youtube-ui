export interface YouTubeMeta {
  videoId: string;
  url: string;
  title: string;
  thumbnail: string;
}

export const extractYouTubeVideoId = (input: string): string | null => {
  const value = input.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);

    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v;
      }

      const segments = url.pathname.split("/").filter(Boolean);
      const possible = segments.length > 1 ? segments[1] : null;
      if (
        possible &&
        ["shorts", "embed", "live"].includes(segments[0]) &&
        /^[a-zA-Z0-9_-]{11}$/.test(possible)
      ) {
        return possible;
      }
    }
  } catch {
    return null;
  }

  return null;
};

export const getYouTubeMeta = async (
  rawInput: string,
): Promise<YouTubeMeta> => {
  const videoId = extractYouTubeVideoId(rawInput);
  if (!videoId) {
    throw new Error("Invalid YouTube URL or video ID");
  }

  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`;

  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to fetch YouTube metadata");
  }

  const data = (await response.json()) as {
    title?: string;
    thumbnail_url?: string;
  };

  return {
    videoId,
    url: canonicalUrl,
    title: data.title || `YouTube Video ${videoId}`,
    thumbnail:
      data.thumbnail_url ||
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };
};
