# TomTube

Vite + React frontend with Supabase Auth and PostgreSQL as the backend. The app no longer calls the legacy Next.js API in backend/.

## Local setup for this repository

With Docker running, use:

```sh
npm install
npm run backend:start
npm run backend:configure
npm run dev
```

This creates the separate local Supabase project youtube-ui and writes its public connection settings to the ignored .env.local file. It does not connect to any hosted project. Keep VITE_YOUTUBE_API_KEY in .env or .env.local for parent searches. Run npm run backend:test to test the local database and npm run backend:test:api to verify real signup, login, persistence, and account isolation. Use npm run backend:stop to stop only this repository's Supabase stack.

## Hosted setup (optional)

1. Create or choose a Supabase project.
2. Apply supabase/migrations/20260916172542_tomtube_backend.sql in the Supabase SQL Editor, or link the project with the Supabase CLI and push the migration.
3. Copy .env.example to .env.local and set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from your project's Connect dialog. Use only a publishable key in the browser, never a secret/service-role key.
4. Set VITE_YOUTUBE_API_KEY for parent-initiated YouTube searches. Restrict that Google key to the YouTube Data API and your site origins.
5. Run npm install and npm run dev. No Next.js server is required.
6. Sign up with an email and password. If email confirmation is enabled, confirm the email before signing in. Set your Supabase Auth Site URL and allowed redirect URLs to the frontend URL.

## Content flow

Parents search YouTube and select Add to approved videos. Selections are stored in Supabase under the signed-in user's ID. Home and Kids Zone read only that account's approved videos. Screen-time limits, daily usage, bonus minutes, PIN settings, and playlists also live in Supabase.

The initial parent PIN is 1234; change it in Parent Mode. PINs are hashed and never returned to the browser. The current family model has one child profile per parent account. Kid Mode uses the parent's signed-in session and a PIN-gated interface; it is not a separate untrusted child account.

## Database access

The public tomtube_api RPC delegates to a private function with an explicit auth.uid() ownership check. Tables are in the non-exposed tomtube_private schema, have RLS enabled, and have no direct anon/authenticated table grants. Mutations lock the family row to serialize approvals and screen-time updates. Admin access checks the user's server-managed app_metadata.role in auth.users, not client input or editable user metadata.

To grant an administrator, use the Supabase Auth Admin API from a trusted server or set raw_app_meta_data.role to admin in the SQL Editor for the intended user. Users cannot choose administrator status during signup. Sign in again after changing a role.

## Deployment

Deploy the root frontend to Netlify or another static host using npm run build and publish dist. Configure the same three VITE_ variables at build time. Configure your host to serve index.html for application routes. Supabase hosts authentication and database functions; no Vercel/Next.js backend deployment is needed.

## Existing data

The old backend/ directory is retained as migration reference because it contains existing work. It is no longer used by the frontend. Old MongoDB/KV accounts, passwords, approvals, and playlists are not automatically imported into Supabase. Plan and verify a data migration before deleting the old backend or its storage. LocalStorage login flags are no longer accepted as authentication.

## Verification

Run npm run build for the frontend. supabase/tests/backend.sql exercises the backend in a transaction and rolls back its fixtures. Use it on a disposable local Supabase database after applying the migration. It covers account isolation, approvals, playlist ownership, screen time, PIN changes, and admin/anonymous authorization.
