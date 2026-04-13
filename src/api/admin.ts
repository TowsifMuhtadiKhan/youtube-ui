export interface AdminUser {
  id: string;
  username: string;
  role: "user" | "admin";
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export const fetchAdminUsers = async (adminUsername: string): Promise<AdminUser[]> => {
  const response = await fetch(`${API_BASE}/api/admin/users`, {
    headers: {
      "x-admin-user": adminUsername,
    },
  });

  const data = (await response.json()) as { users?: AdminUser[]; error?: string };
  if (!response.ok || !data.users) {
    throw new Error(data.error || "Failed to load admin users");
  }

  return data.users;
};
