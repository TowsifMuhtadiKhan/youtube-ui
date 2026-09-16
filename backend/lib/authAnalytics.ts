import { kv } from "@vercel/kv";
import { hasMongo, mongoGetState, mongoSetState } from "@/lib/mongo";

interface LoginEvent {
  username: string;
  loggedAt: string;
}

interface LoginTrendPoint {
  label: string;
  count: number;
}

const EVENTS_KEY = "auth:login-events";
const inMemoryEvents: LoginEvent[] = [];
const MAX_EVENTS = 5000;

const hasKv = () =>
  !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

const getEvents = async (): Promise<LoginEvent[]> => {
  if (hasMongo()) {
    return (await mongoGetState<LoginEvent[]>(EVENTS_KEY)) || [];
  }

  if (hasKv()) {
    return (await kv.get<LoginEvent[]>(EVENTS_KEY)) || [];
  }

  return inMemoryEvents;
};

const setEvents = async (events: LoginEvent[]): Promise<void> => {
  if (hasMongo()) {
    await mongoSetState(EVENTS_KEY, events);
    return;
  }

  if (hasKv()) {
    await kv.set(EVENTS_KEY, events);
    return;
  }

  inMemoryEvents.length = 0;
  inMemoryEvents.push(...events);
};

const lastNDaysLabels = (days: number): string[] => {
  const now = new Date();
  const labels: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    labels.push(d.toISOString().slice(0, 10));
  }
  return labels;
};

export const recordPortalLogin = async (username: string): Promise<void> => {
  const events = await getEvents();
  const next: LoginEvent[] = [
    ...events,
    {
      username,
      loggedAt: new Date().toISOString(),
    },
  ];

  const trimmed = next.length > MAX_EVENTS ? next.slice(next.length - MAX_EVENTS) : next;
  await setEvents(trimmed);
};

export const getPortalAnalytics = async (days = 7): Promise<{
  totalLogins: number;
  uniqueUsers: number;
  activeUsersLastDays: number;
  lastLoginAt: string | null;
  loginTrend: LoginTrendPoint[];
  topUsers: Array<{ username: string; logins: number; lastLoginAt: string }>;
  recentLogins: LoginEvent[];
}> => {
  const events = await getEvents();
  const totalLogins = events.length;
  const uniqueUsers = new Set(events.map((e) => e.username.toLowerCase())).size;

  const labels = lastNDaysLabels(days);
  const trendMap = labels.reduce<Record<string, number>>((acc, label) => {
    acc[label] = 0;
    return acc;
  }, {});

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  const countsByUser = new Map<string, { username: string; logins: number; lastLoginAt: string }>();

  events.forEach((event) => {
    const date = new Date(event.loggedAt);
    const day = date.toISOString().slice(0, 10);
    if (day in trendMap) {
      trendMap[day] += 1;
    }

    const key = event.username.toLowerCase();
    const current = countsByUser.get(key) || {
      username: event.username,
      logins: 0,
      lastLoginAt: event.loggedAt,
    };

    current.logins += 1;
    if (new Date(event.loggedAt) > new Date(current.lastLoginAt)) {
      current.lastLoginAt = event.loggedAt;
    }
    countsByUser.set(key, current);
  });

  const activeUsersLastDays = new Set(
    events
      .filter((event) => new Date(event.loggedAt) >= startDate)
      .map((event) => event.username.toLowerCase()),
  ).size;

  const topUsers = Array.from(countsByUser.values())
    .sort((a, b) => b.logins - a.logins)
    .slice(0, 8);

  const recentLogins = [...events]
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
    .slice(0, 20);

  return {
    totalLogins,
    uniqueUsers,
    activeUsersLastDays,
    lastLoginAt:
      recentLogins.length > 0
        ? recentLogins[0].loggedAt
        : null,
    loginTrend: labels.map((label) => ({ label, count: trendMap[label] || 0 })),
    topUsers,
    recentLogins,
  };
};
