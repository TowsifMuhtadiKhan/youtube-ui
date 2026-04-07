export interface YouTubeVideoInfo {
  id: string;
  title: string;
  link: string;
  thumbnail: string;
  subTitle: string; // We'll use channel title here
  description?: string;
  publishedAt?: string;
  viewCount?: string;
  likeCount?: string;
  duration?: string;
}

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const FORCE_LOCAL_ONLY = true; // Set to true since quota is hit
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Mock data fallback for quota management
import mockData from '../components/data.json';

const getMockVideos = (category?: string, maxResults = 20): YouTubeVideoInfo[] => {
  const baseData = mockData.map(item => ({
    id: item.id,
    title: item.title,
    link: item.link || `https://www.youtube.com/watch?v=${item.id}`,
    thumbnail: item.thumbnail,
    subTitle: item.subTitle || (item as any).channelTitle || "Unknown Artist",
    publishedAt: (item as any).publishedAt || "2024-01-01T00:00:00Z",
    viewCount: (item as any).viewCount || "1.2M",
    duration: (item as any).duration || "4:30",
    description: (item as any).description || "Local fallback content"
  }));

  if (!category || category === "All") return baseData.slice(0, maxResults);
  
  const filtered = baseData.filter(v => 
    v.title.toLowerCase().includes(category.toLowerCase()) || 
    v.subTitle.toLowerCase().includes(category.toLowerCase())
  );

  // If no results for category, return some popular ones instead of empty
  if (filtered.length === 0) return baseData.slice(0, maxResults);
  
  return filtered.slice(0, maxResults);
};

export const fetchPopularVideos = async (maxResults = 20, regionCode = 'BD'): Promise<YouTubeVideoInfo[]> => {
  if (!API_KEY || FORCE_LOCAL_ONLY) {
    console.warn("YouTube API local mode active.");
    return getMockVideos("All", maxResults);
  }

  try {
    const response = await fetch(
      `${BASE_URL}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=${regionCode}&maxResults=${maxResults}&key=${API_KEY}`
    );
    const data = await response.json();

    if (data.error) {
        console.error("YouTube API Error (Quota likely hit):", data.error.message);
        return getMockVideos("All", maxResults);
    }

    return data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      link: `https://www.youtube.com/watch?v=${item.id}`,
      thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      subTitle: item.snippet.channelTitle,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics?.viewCount,
      likeCount: item.statistics?.likeCount,
    }));
  } catch (error) {
    console.error("Error fetching videos, using mock fallback:", error);
    return getMockVideos("All", maxResults);
  }
};

export const fetchVideoDetails = async (videoId: string): Promise<YouTubeVideoInfo | null> => {
    // Check local data first if no API KEY
    const localVideo = getMockVideos("All", 100).find(v => v.id === videoId);
    
    if (!API_KEY || FORCE_LOCAL_ONLY) {
      if (localVideo) return localVideo;
      // If not in local data, but we have an ID, return a generic object so it can still play via URL
      return {
        id: videoId,
        title: "YouTube Video",
        link: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        subTitle: "YouTube Content",
        description: "Direct playback via URL/ID"
      };
    }

    try {
        const response = await fetch(
            `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`
          );
          const data = await response.json();
          
          if (data.error || !data.items || data.items.length === 0) {
            return localVideo || null;
          }
          
          const item = data.items[0];
          return {
            id: item.id,
            title: item.snippet.title,
            link: `https://www.youtube.com/watch?v=${item.id}`,
            thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url,
            subTitle: item.snippet.channelTitle,
            description: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            viewCount: item.statistics?.viewCount,
            likeCount: item.statistics?.likeCount,
          };
    } catch(error) {
        console.error("Error fetching video details:", error);
        return localVideo || null;
    }
}

export const fetchSearchResults = async (query: string, maxResults = 10): Promise<YouTubeVideoInfo[]> => {
  if (!API_KEY || FORCE_LOCAL_ONLY || !query.trim()) {
    return getMockVideos(query, maxResults);
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${API_KEY}`
    );
    const data = await response.json();

    if (data.error) {
      console.error("YouTube Search API Error:", data.error.message);
      return getMockVideos(query, maxResults);
    }

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      subTitle: item.snippet.channelTitle,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error("Error searching videos:", error);
    return getMockVideos(query, maxResults);
  }
};

export const fetchVideosByCategory = async (category: string, maxResults = 20): Promise<YouTubeVideoInfo[]> => {
  if (category === "All") return fetchPopularVideos(maxResults);
  
  if (!API_KEY || FORCE_LOCAL_ONLY) {
    return getMockVideos(category, maxResults);
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(category)}&type=video&maxResults=${maxResults}&key=${API_KEY}`
    );
    const data = await response.json();

    if (data.error) {
      console.error("YouTube Category Search API Error:", data.error.message);
      return getMockVideos(category, maxResults);
    }

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      subTitle: item.snippet.channelTitle,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error("Error searching videos by category, using mock fallback:", error);
    return getMockVideos(category, maxResults);
  }
};

