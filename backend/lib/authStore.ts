import { kv } from "@vercel/kv";

interface StoredUser {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

const inMemoryUsers: StoredUser[] = [];
const USERS_KEY = "auth:users";

const hasKv = () =>
  !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

const randomId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const getUsers = async (): Promise<StoredUser[]> => {
  if (hasKv()) {
    return (await kv.get<StoredUser[]>(USERS_KEY)) || [];
  }
  return inMemoryUsers;
};

const setUsers = async (users: StoredUser[]): Promise<void> => {
  if (hasKv()) {
    await kv.set(USERS_KEY, users);
    return;
  }

  inMemoryUsers.length = 0;
  inMemoryUsers.push(...users);
};

export const createUser = async (
  username: string,
  password: string,
): Promise<{ id: string; username: string }> => {
  const normalizedUsername = username.trim().toLowerCase();
  const users = await getUsers();

  const exists = users.some(
    (u) => u.username.toLowerCase() === normalizedUsername,
  );
  if (exists) {
    throw new Error("Username already exists");
  }

  const createdUser: StoredUser = {
    id: randomId(),
    username: username.trim(),
    password,
    createdAt: new Date().toISOString(),
  };

  await setUsers([createdUser, ...users]);
  return { id: createdUser.id, username: createdUser.username };
};

export const validateUser = async (
  username: string,
  password: string,
): Promise<{ id: string; username: string } | null> => {
  const users = await getUsers();
  const normalizedUsername = username.trim().toLowerCase();

  const user = users.find(
    (u) =>
      u.username.toLowerCase() === normalizedUsername &&
      u.password === password,
  );

  if (!user) {
    return null;
  }

  return { id: user.id, username: user.username };
};
