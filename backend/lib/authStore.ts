import { kv } from "@vercel/kv";

interface StoredUser {
  id: string;
  username: string;
  password: string;
  role: "user" | "admin";
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
  role: "user" | "admin" = "user",
): Promise<{ id: string; username: string; role: "user" | "admin" }> => {
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
    role,
    createdAt: new Date().toISOString(),
  };

  await setUsers([createdUser, ...users]);
  return { id: createdUser.id, username: createdUser.username, role: createdUser.role };
};

export const validateUser = async (
  username: string,
  password: string,
): Promise<{ id: string; username: string; role: "user" | "admin" } | null> => {
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

  return { id: user.id, username: user.username, role: user.role || "user" };
};

export const getUserDetails = async (
  username: string,
): Promise<{ id: string; username: string; role: "user" | "admin"; createdAt: string } | null> => {
  const users = await getUsers();
  const normalizedUsername = username.trim().toLowerCase();
  const user = users.find((u) => u.username.toLowerCase() === normalizedUsername);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role || "user",
    createdAt: user.createdAt,
  };
};

export const isAdminUser = async (username: string): Promise<boolean> => {
  const users = await getUsers();
  const normalizedUsername = username.trim().toLowerCase();
  const user = users.find((u) => u.username.toLowerCase() === normalizedUsername);
  return !!user && user.role === "admin";
};

export const listUsersForAdmin = async (): Promise<Array<{ id: string; username: string; role: "user" | "admin"; createdAt: string }>> => {
  const users = await getUsers();
  return users.map((u) => ({
    id: u.id,
    username: u.username,
    role: u.role || "user",
    createdAt: u.createdAt,
  }));
};

export const promoteUserToAdmin = async (
  username: string,
  password: string,
): Promise<{ id: string; username: string; role: "admin" } | null> => {
  const users = await getUsers();
  const normalizedUsername = username.trim().toLowerCase();
  const index = users.findIndex(
    (u) =>
      u.username.toLowerCase() === normalizedUsername &&
      u.password === password,
  );

  if (index === -1) {
    return null;
  }

  const target = users[index];
  if (target.role === "admin") {
    return { id: target.id, username: target.username, role: "admin" };
  }

  const next = [...users];
  next[index] = { ...target, role: "admin" };
  await setUsers(next);

  return { id: target.id, username: target.username, role: "admin" };
};
