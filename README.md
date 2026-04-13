# YouTube UI with Playlist Backend

This repository now has two parts:

- `frontend` (existing Vite React app in project root), deploy to Netlify.
- `backend` (new Next.js API app in `backend/`), deploy to Vercel.

The backend supports user playlists where users paste YouTube URLs.
It avoids YouTube Data API quota by using YouTube oEmbed for metadata lookup (no Google API key required).

## What Was Added

- New backend app: `backend/`
- API endpoints:
  - `GET /api/health`
  - `GET /api/playlists?userId=...`
  - `POST /api/playlists`
  - `POST /api/playlists/:playlistId/items`
- Frontend playlist page: route `/playlist`
- Frontend API client: `src/api/playlistBackend.ts`

## Local Development

### 1. Frontend (root)

```bash
npm install
cp .env.example .env
npm run dev
```

Default frontend dev URL: `http://localhost:5173`

### 2. Backend (`backend/`)

```bash
cd backend
npm install
cp .env.example .env.local
npm run dev
```

Default backend dev URL: `http://localhost:3000`

Set `ALLOWED_ORIGINS` in `backend/.env.local`, for example:

```env
ALLOWED_ORIGINS=http://localhost:5173
ADMIN_SIGNUP_CODE=your-local-admin-code
```

Set frontend backend URL in root `.env`:

```env
VITE_BACKEND_API_URL=http://localhost:3000
```

## Deploy Backend to Vercel

1. Push this repo to GitHub.
2. In Vercel, create a new project and set **Root Directory** to `backend`.
3. Build settings (usually auto-detected):
   - Build command: `npm run build`
   - Output: Next.js default
4. Environment variables in Vercel project:
   - `ALLOWED_ORIGINS=https://YOUR-NETLIFY-SITE.netlify.app`
   - `ADMIN_SIGNUP_CODE=YOUR_SECRET_ADMIN_CODE`
5. Optional persistence (recommended): attach Vercel KV to this backend project.
   - When KV is attached, `KV_REST_API_URL` and `KV_REST_API_TOKEN` are injected automatically.
   - Without KV, backend uses in-memory storage (resets on cold starts/redeploy).

After deploy, your backend URL will look like:

`https://your-backend-name.vercel.app`

## Deploy Frontend to Netlify

1. In Netlify, create a new site from this repo.
2. Use project root as the base directory.
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variable in Netlify:

```env
VITE_BACKEND_API_URL=https://your-backend-name.vercel.app
```

5. Deploy.

## API Request Examples

Create admin account:

```bash
curl -X POST https://your-backend-name.vercel.app/api/auth/signup \
   -H "content-type: application/json" \
   -d '{"username":"admin@example.com","password":"Admin123!","role":"admin","adminCode":"YOUR_SECRET_ADMIN_CODE"}'
```

Open admin view in frontend:

`https://your-frontend.netlify.app/admin`

Create playlist:

```bash
curl -X POST https://your-backend-name.vercel.app/api/playlists \
  -H "content-type: application/json" \
  -d '{"userId":"user-123","name":"My Chill Playlist"}'
```

Add YouTube URL:

```bash
curl -X POST https://your-backend-name.vercel.app/api/playlists/PLAYLIST_ID/items \
  -H "content-type: application/json" \
  -d '{"userId":"user-123","youtubeUrl":"https://www.youtube.com/watch?v=JAnYzWpBhAw"}'
```

## Notes

- This playlist flow does not require YouTube Data API key/quota.
- oEmbed can still fail for unavailable/private/restricted videos.
- If you need fully durable multi-user auth + database, next step is adding Supabase/Postgres auth and tables.
- Backend scripts:
   - `npm run dev` for development.
   - `npm run start` now builds and starts production server in one command.
   - `npm run start:prod` starts from existing build only.
