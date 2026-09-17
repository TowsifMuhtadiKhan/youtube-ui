import { createClient, type SupabaseClient } from "@supabase/supabase-js";
let client: SupabaseClient | undefined;
export function getSupabase(): SupabaseClient {
  let url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error(
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local to connect Supabase.",
    );
  // A phone opening Vite over LAN must reach the computer's local backend, not its own loopback.
  if (import.meta.env.DEV) {
    const endpoint = new URL(url);
    if (
      ["127.0.0.1", "localhost"].includes(endpoint.hostname) &&
      !["127.0.0.1", "localhost"].includes(window.location.hostname)
    ) {
      endpoint.hostname = window.location.hostname;
      url = endpoint.toString();
    }
  }
  client ??= createClient(url, key);
  return client;
}
export async function backendRpc<T>(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  const { data, error } = await getSupabase().rpc("tomtube_api", {
    action,
    payload,
  });
  if (error) throw new Error(error.message);
  return data as T;
}
