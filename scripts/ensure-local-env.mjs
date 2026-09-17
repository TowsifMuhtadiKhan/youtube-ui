import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const env = { ...process.env };
for (const file of [".env", ".env.local"])
  if (existsSync(file))
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match) env[match[1]] = match[2].trim();
    }
if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  try {
    execFileSync(process.execPath, ["scripts/configure-local-supabase.mjs"], {
      stdio: "inherit",
    });
  } catch {
    console.error(
      "Start this project backend with npm run backend:start, then run npm run backend:configure.",
    );
    process.exitCode = 1;
  }
}
