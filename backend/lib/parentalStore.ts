import { kv } from "@vercel/kv";
import {
  hasMongo,
  mongoGetState,
  mongoSetState,
} from "@/lib/mongo";

export interface ApprovedVideo {
  childId: string;
  youtubeVideoId: string;
  title: string;
  thumbnail: string;
  channelName: string;
  duration?: string;
  approvedAt: string;
}

export interface ScreenTimeRecord {
  childId: string;
  date: string; // YYYY-MM-DD
  watchedSeconds: number;
  dailyLimitMinutes: number;
  bonusMinutes: number;
}

export interface WatchHistoryEntry {
  id: string;
  childId: string;
  youtubeVideoId: string;
  watchedSeconds: number;
  watchedAt: string;
}

// In-memory fallback maps on globalThis for Next.js route sharing
const globalAny = globalThis as unknown as {
  __parentalWhitelist?: Map<string, ApprovedVideo[]>;
  __parentalScreenTime?: Map<string, ScreenTimeRecord>;
  __parentalHistory?: Map<string, WatchHistoryEntry[]>;
  __parentalPins?: Map<string, string>;
  __parentalSettings?: Map<string, { defaultDailyLimitMinutes: number }>;
};

const inMemoryWhitelist =
  globalAny.__parentalWhitelist ||
  (globalAny.__parentalWhitelist = new Map<string, ApprovedVideo[]>());

const inMemoryScreenTime =
  globalAny.__parentalScreenTime ||
  (globalAny.__parentalScreenTime = new Map<string, ScreenTimeRecord>());

const inMemoryHistory =
  globalAny.__parentalHistory ||
  (globalAny.__parentalHistory = new Map<string, WatchHistoryEntry[]>());

const inMemoryPins =
  globalAny.__parentalPins ||
  (globalAny.__parentalPins = new Map<string, string>());

const inMemorySettings =
  globalAny.__parentalSettings ||
  (globalAny.__parentalSettings = new Map<string, { defaultDailyLimitMinutes: number }>());

const hasKv = () =>
  !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

const randomId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const getTodayDateStr = (): string => {
  return new Date().toISOString().split("T")[0];
};

// Keys
const whitelistKey = (childId: string) => `parental:whitelist:${childId}`;
const screenTimeKey = (childId: string, date: string) => `parental:screentime:${childId}:${date}`;
const historyKey = (childId: string) => `parental:history:${childId}`;
const pinKey = (childId: string) => `parental:pin:${childId}`;
const settingsKey = (childId: string) => `parental:settings:${childId}`;

// ----------------------------------------------------
// Whitelist Operations
// ----------------------------------------------------

export const getApprovedVideos = async (childId: string): Promise<ApprovedVideo[]> => {
  const key = whitelistKey(childId);
  if (hasMongo()) {
    return (await mongoGetState<ApprovedVideo[]>(key)) || [];
  }
  if (hasKv()) {
    return (await kv.get<ApprovedVideo[]>(key)) || [];
  }
  return inMemoryWhitelist.get(childId) || [];
};

const saveApprovedVideos = async (childId: string, list: ApprovedVideo[]): Promise<void> => {
  const key = whitelistKey(childId);
  if (hasMongo()) {
    await mongoSetState(key, list);
    return;
  }
  if (hasKv()) {
    await kv.set(key, list);
    return;
  }
  inMemoryWhitelist.set(childId, list);
};

export const addApprovedVideo = async (
  childId: string,
  video: {
    youtubeVideoId: string;
    title: string;
    thumbnail: string;
    channelName: string;
    duration?: string;
  },
): Promise<ApprovedVideo[]> => {
  const list = await getApprovedVideos(childId);
  const existsIndex = list.findIndex((v) => v.youtubeVideoId === video.youtubeVideoId);

  const entry: ApprovedVideo = {
    childId,
    youtubeVideoId: video.youtubeVideoId,
    title: video.title,
    thumbnail: video.thumbnail,
    channelName: video.channelName,
    duration: video.duration || "",
    approvedAt: new Date().toISOString(),
  };

  let updated: ApprovedVideo[];
  if (existsIndex >= 0) {
    updated = [...list];
    updated[existsIndex] = entry;
  } else {
    updated = [entry, ...list];
  }

  await saveApprovedVideos(childId, updated);
  return updated;
};

export const removeApprovedVideo = async (
  childId: string,
  youtubeVideoId: string,
): Promise<ApprovedVideo[]> => {
  const list = await getApprovedVideos(childId);
  const updated = list.filter((v) => v.youtubeVideoId !== youtubeVideoId);
  await saveApprovedVideos(childId, updated);
  return updated;
};

export const isApprovedVideo = async (
  childId: string,
  youtubeVideoId: string,
): Promise<boolean> => {
  const list = await getApprovedVideos(childId);
  return list.some((v) => v.youtubeVideoId === youtubeVideoId);
};

// ----------------------------------------------------
// Screen Time & Daily Limit Operations
// ----------------------------------------------------

export const getDefaultDailyLimit = async (childId: string): Promise<number> => {
  const key = settingsKey(childId);
  if (hasMongo()) {
    const s = await mongoGetState<{ defaultDailyLimitMinutes: number }>(key);
    return s?.defaultDailyLimitMinutes ?? 60;
  }
  if (hasKv()) {
    const s = await kv.get<{ defaultDailyLimitMinutes: number }>(key);
    return s?.defaultDailyLimitMinutes ?? 60;
  }
  return inMemorySettings.get(childId)?.defaultDailyLimitMinutes ?? 60;
};

export const setDefaultDailyLimit = async (childId: string, minutes: number): Promise<void> => {
  const key = settingsKey(childId);
  const data = { defaultDailyLimitMinutes: minutes };
  if (hasMongo()) {
    await mongoSetState(key, data);
    return;
  }
  if (hasKv()) {
    await kv.set(key, data);
    return;
  }
  inMemorySettings.set(childId, data);
};

export const getScreenTime = async (
  childId: string,
  date: string = getTodayDateStr(),
): Promise<ScreenTimeRecord & { remainingSeconds: number; totalAllowedMinutes: number }> => {
  const key = screenTimeKey(childId, date);
  let record: ScreenTimeRecord | null = null;

  if (hasMongo()) {
    record = await mongoGetState<ScreenTimeRecord>(key);
  } else if (hasKv()) {
    record = await kv.get<ScreenTimeRecord>(key);
  } else {
    record = inMemoryScreenTime.get(`${childId}:${date}`) || null;
  }

  if (!record) {
    const defaultLimit = await getDefaultDailyLimit(childId);
    record = {
      childId,
      date,
      watchedSeconds: 0,
      dailyLimitMinutes: defaultLimit,
      bonusMinutes: 0,
    };
  }

  const totalAllowedMinutes = record.dailyLimitMinutes + (record.bonusMinutes || 0);
  const totalAllowedSeconds = totalAllowedMinutes * 60;
  const remainingSeconds = Math.max(0, totalAllowedSeconds - record.watchedSeconds);

  return {
    ...record,
    totalAllowedMinutes,
    remainingSeconds,
  };
};

const saveScreenTime = async (record: ScreenTimeRecord): Promise<void> => {
  const key = screenTimeKey(record.childId, record.date);
  if (hasMongo()) {
    await mongoSetState(key, record);
    return;
  }
  if (hasKv()) {
    await kv.set(key, record);
    return;
  }
  inMemoryScreenTime.set(`${record.childId}:${record.date}`, record);
};

export const updateDailyLimit = async (
  childId: string,
  limitMinutes: number,
  date: string = getTodayDateStr(),
): Promise<ScreenTimeRecord & { remainingSeconds: number; totalAllowedMinutes: number }> => {
  await setDefaultDailyLimit(childId, limitMinutes);
  const current = await getScreenTime(childId, date);
  const updated: ScreenTimeRecord = {
    ...current,
    dailyLimitMinutes: limitMinutes,
  };
  await saveScreenTime(updated);
  return getScreenTime(childId, date);
};

export const addBonusMinutes = async (
  childId: string,
  bonusMinutesToAdd: number,
  date: string = getTodayDateStr(),
): Promise<ScreenTimeRecord & { remainingSeconds: number; totalAllowedMinutes: number }> => {
  const current = await getScreenTime(childId, date);
  const updated: ScreenTimeRecord = {
    ...current,
    bonusMinutes: (current.bonusMinutes || 0) + bonusMinutesToAdd,
  };
  await saveScreenTime(updated);
  return getScreenTime(childId, date);
};

// ----------------------------------------------------
// Watch History & Tracking Operations
// ----------------------------------------------------

export const getWatchHistory = async (childId: string): Promise<WatchHistoryEntry[]> => {
  const key = historyKey(childId);
  if (hasMongo()) {
    return (await mongoGetState<WatchHistoryEntry[]>(key)) || [];
  }
  if (hasKv()) {
    return (await kv.get<WatchHistoryEntry[]>(key)) || [];
  }
  return inMemoryHistory.get(childId) || [];
};

const appendWatchHistory = async (entry: WatchHistoryEntry): Promise<void> => {
  const list = await getWatchHistory(entry.childId);
  const updated = [entry, ...list].slice(0, 100); // keep last 100 entries
  const key = historyKey(entry.childId);

  if (hasMongo()) {
    await mongoSetState(key, updated);
    return;
  }
  if (hasKv()) {
    await kv.set(key, updated);
    return;
  }
  inMemoryHistory.set(entry.childId, updated);
};

export const recordWatchTime = async (
  childId: string,
  youtubeVideoId: string,
  secondsIncrement: number,
): Promise<{
  allowed: boolean;
  remainingSeconds: number;
  watchedSeconds: number;
  totalAllowedMinutes: number;
  message?: string;
}> => {
  // 1. Backend whitelist verification
  const isApproved = await isApprovedVideo(childId, youtubeVideoId);
  if (!isApproved) {
    return {
      allowed: false,
      remainingSeconds: 0,
      watchedSeconds: 0,
      totalAllowedMinutes: 0,
      message: "Video is not approved for this child",
    };
  }

  // 2. Screen time check
  const today = getTodayDateStr();
  const current = await getScreenTime(childId, today);

  if (current.remainingSeconds <= 0) {
    return {
      allowed: false,
      remainingSeconds: 0,
      watchedSeconds: current.watchedSeconds,
      totalAllowedMinutes: current.totalAllowedMinutes,
      message: "Daily screen time limit reached",
    };
  }

  const added = Math.max(1, Math.min(secondsIncrement, 30)); // guard against huge single ticks
  const newWatched = current.watchedSeconds + added;

  const updatedRecord: ScreenTimeRecord = {
    childId,
    date: today,
    watchedSeconds: newWatched,
    dailyLimitMinutes: current.dailyLimitMinutes,
    bonusMinutes: current.bonusMinutes,
  };
  await saveScreenTime(updatedRecord);

  // 3. Log history entry
  void appendWatchHistory({
    id: randomId(),
    childId,
    youtubeVideoId,
    watchedSeconds: added,
    watchedAt: new Date().toISOString(),
  });

  const totalAllowedSeconds = current.totalAllowedMinutes * 60;
  const remainingSeconds = Math.max(0, totalAllowedSeconds - newWatched);
  const allowed = remainingSeconds > 0;

  return {
    allowed,
    remainingSeconds,
    watchedSeconds: newWatched,
    totalAllowedMinutes: current.totalAllowedMinutes,
  };
};

// ----------------------------------------------------
// Parent PIN Operations
// ----------------------------------------------------

export const getParentPin = async (childId: string): Promise<string> => {
  const key = pinKey(childId);
  if (hasMongo()) {
    const pin = await mongoGetState<string>(key);
    return pin || "1234";
  }
  if (hasKv()) {
    const pin = await kv.get<string>(key);
    return pin || "1234";
  }
  return inMemoryPins.get(childId) || "1234";
};

export const setParentPin = async (childId: string, newPin: string): Promise<boolean> => {
  const cleanPin = newPin.trim();
  if (cleanPin.length < 4) {
    return false;
  }
  const key = pinKey(childId);
  if (hasMongo()) {
    await mongoSetState(key, cleanPin);
    return true;
  }
  if (hasKv()) {
    await kv.set(key, cleanPin);
    return true;
  }
  inMemoryPins.set(childId, cleanPin);
  return true;
};

export const verifyParentPin = async (childId: string, pin: string): Promise<boolean> => {
  const expected = await getParentPin(childId);
  return expected === pin.trim();
};
