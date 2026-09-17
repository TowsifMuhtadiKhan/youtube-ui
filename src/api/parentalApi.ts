import { backendRpc } from "./supabase";
// src/api/parentalApi.ts
export interface ApprovedVideo {
  childId: string;
  youtubeVideoId: string;
  title: string;
  thumbnail: string;
  channelName: string;
  duration?: string;
  approvedAt: string;
}

export interface ScreenTimeData {
  childId: string;
  date: string;
  watchedSeconds: number;
  dailyLimitMinutes: number;
  bonusMinutes: number;
  totalAllowedMinutes: number;
  remainingSeconds: number;
}

export interface TrackResult {
  reason?: string;
  allowed: boolean;
  remainingSeconds: number;
  watchedSeconds: number;
  totalAllowedMinutes: number;
  message?: string;
}

export interface ValidateResult {
  allowed: boolean;
  remainingSeconds?: number;
  totalAllowedMinutes?: number;
  watchedSeconds?: number;
  reason?: "UNAPPROVED" | "TIME_EXPIRED" | string;
  message?: string;
}

// The authenticated Supabase user owns one family profile. Legacy childId arguments
// remain for the UI contract; the database derives ownership from auth.uid().
export const getOrCreateChildId = (): string => "primary";
export const fetchApprovedVideos = async (_childId = getOrCreateChildId()): Promise<ApprovedVideo[]> => backendRpc("videos.list");
export const approveVideo = async (_childId: string, video: { youtubeVideoId: string; title: string; thumbnail: string; channelName: string; duration?: string }): Promise<ApprovedVideo[]> => backendRpc("videos.approve", video);
export const removeApprovedVideo = async (_childId: string, youtubeVideoId: string): Promise<ApprovedVideo[]> => backendRpc("videos.remove", { youtubeVideoId });
export const fetchScreenTime = async (_childId = getOrCreateChildId()): Promise<ScreenTimeData> => backendRpc("time.get");
export const updateDailyLimit = async (_childId: string, dailyLimitMinutes: number): Promise<ScreenTimeData> => backendRpc("time.setLimit", { dailyLimitMinutes });
export const addExtraBonusMinutes = async (_childId: string, bonusMinutes: number): Promise<ScreenTimeData> => backendRpc("time.addBonus", { bonusMinutes });
export const trackWatchTime = async (_childId: string, youtubeVideoId: string, seconds: number): Promise<TrackResult> => backendRpc("playback.track", { youtubeVideoId, seconds });
export const validateVideoPlayback = async (_childId: string, youtubeVideoId: string): Promise<ValidateResult> => backendRpc("playback.validate", { youtubeVideoId });
export const verifyParentPin = async (_childId: string, pin: string): Promise<boolean> => {
 const result = await backendRpc<{ valid: boolean }>("pin.verify", { pin });
 return result.valid;
};
export const setParentPin = async (_childId: string, newPin: string, currentPin?: string): Promise<{ success: boolean; error?: string }> => backendRpc("pin.set", { newPin, currentPin });
