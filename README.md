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
2. Apply all SQL files in supabase/migrations/ in filename order, or link your own dedicated project with the Supabase CLI and push the migrations.
3. Copy .env.example to .env.local and set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from your project's Connect dialog. Use only a publishable key in the browser, never a secret/service-role key.
4. Set VITE_YOUTUBE_API_KEY for parent-initiated YouTube searches. Restrict that Google key to the YouTube Data API and your site origins.
5. Run npm install and npm run dev. No Next.js server is required.
6. Sign up with an email and password. If email confirmation is enabled, confirm the email before signing in. Set your Supabase Auth Site URL and allowed redirect URLs to the frontend URL.

## Content flow

In Parent Mode, click **Add videos** to open the popup (full screen on phones), then use the source buttons to search videos or paste a video URL, browse a channel by name/@handle/link, or load a YouTube playlist URL/ID. Channel-name searches let you choose the matching channel. Channel uploads and playlists load in pages with **Load more videos**. Only videos you explicitly add are saved to the selected parent/kids library and optional app playlist; future channel uploads are not automatically approved. Private, deleted, and non-embeddable videos are excluded from URL/playlist imports. YouTube browsing requires an available Data API key and quota.

Parents search YouTube and select Add to approved videos. Choose My Videos or Kids Videos before adding. The two libraries and their playlists are separate; previous approvals remain in Kids Videos. Home shows My Videos, and Kids Zone shows only Kids Videos. Adding a video to a kids playlist also approves it for that library. Removing a video from a library removes it from that library's playlists. Watch history is stored separately for parent and kids playback. Screen-time limits, daily usage, bonus minutes, PIN settings, and playlists also live in Supabase.

The initial parent PIN is 1234; change it in Parent Mode. PINs are hashed and never returned to the browser. The current family model has one child profile per parent account. Kid Mode uses the parent's signed-in session and a PIN-gated interface; it is not a separate untrusted child account.

## Database access

The public tomtube_api RPC delegates to a private function with an explicit auth.uid() ownership check. Tables are in the non-exposed tomtube_private schema, have RLS enabled, and have no direct anon/authenticated table grants. Mutations lock the family row to serialize approvals and screen-time updates. Admin access checks the user's server-managed app_metadata.role in auth.users, not client input or editable user metadata.

To grant an administrator, use the Supabase Auth Admin API from a trusted server or set raw_app_meta_data.role to admin in the SQL Editor for the intended user. Users cannot choose administrator status during signup. Sign in again after changing a role.

## Deployment

### Vercel

1. Prepare a hosted Supabase project using the Hosted setup steps above, including applying every migration. The local Docker database cannot serve the published app.
2. Push this repository to GitHub, then import it at https://vercel.com/new.
3. Select the repository root (`./`) as the Root Directory, not `backend/`. The committed `vercel.json` sets the Vite framework, `npm ci` installation, `npm run build` build command, `dist` output, and the fallback to `index.html` for application routes.
4. Add these environment variables in Vercel before deploying:

   | Variable | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | Your hosted project's HTTPS URL |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | Your hosted project's public publishable key |
   | `VITE_YOUTUBE_API_KEY` | Your YouTube Data API key for searches and imports |

   Set them for Production and for Preview if you want working preview deployments. Never put a Supabase secret or service-role key in a `VITE_` variable: these values are included in the browser bundle. Local environment files are ignored by Git; configure Vercel's variables separately. Redeploy after changing any build-time variable.
5. Click Deploy. In Supabase Authentication > URL Configuration, set Site URL to the published HTTPS address and allow the authentication redirect URLs used by your app. Allow your published website in the YouTube API key's website restrictions, and restrict the key to the YouTube Data API.
6. Check signup/email confirmation, login, adding a video, and refreshing an internal application URL on the published site.

Supabase hosts authentication and database functions. The legacy `backend/` directory does not need a separate deployment. Existing local users and data are not automatically copied to hosted Supabase.

Other static hosts can use `npm run build` with `dist` as the publish directory and an `index.html` fallback for application routes.

## Existing data

The old backend/ directory is retained as migration reference because it contains existing work. It is no longer used by the frontend. Old MongoDB/KV accounts, passwords, approvals, and playlists are not automatically imported into Supabase. Plan and verify a data migration before deleting the old backend or its storage. LocalStorage login flags are no longer accepted as authentication.

## Verification

Run npm run build for the frontend. supabase/tests/backend.sql exercises the backend in a transaction and rolls back its fixtures. Use it on a disposable local Supabase database after applying the migration. It covers account isolation, approvals, playlist ownership, screen time, PIN changes, and admin/anonymous authorization.

## Mobile and player behavior

### Build the iPhone / iPad app

The `ios/` Xcode project uses Capacitor 8 and Swift Package Manager. It shares the same hosted Supabase accounts and data as Android and the website. Native compilation and signing require a Mac with Xcode 26 or later; they cannot run on Windows. The deployment target is iOS 15 or later.

On your Mac:

1. Clone the repository and run `npm ci` using Node.js 22 or later.
2. Copy `.env.ios.example` to `.env.ios.local`, then enter your hosted Supabase URL and publishable key. Include the YouTube API key for search/imports. These local values are not committed to Git. Use the same project as the website; no new database or migrations are needed for iOS.
3. Run `npm run ios:sync`, then `npm run ios:open`. The sync builds the frontend, disables the website service worker, and prepares native dependencies.
4. In Xcode, choose the **App** target and open **Signing & Capabilities**. Select your Apple development team and enable automatic signing. The bundle identifier is `com.towsif.youtube`; if Apple requires a different identifier, use a unique identifier for the iOS target.
5. Select an iPhone simulator and press Run, or connect your iPhone, enable Developer Mode if requested, and select it as the target.
6. Check signup/email confirmation, login with an existing account, saved videos, YouTube search, playback, rotation, and safe-area layout. Confirm new-account emails in the browser, then return to the app and sign in.

TestFlight/App Store distribution needs Apple Developer Program membership, signing setup, and an archive built in Xcode. No signed IPA is generated by the Windows setup. For immediate use on iPhone, open the deployed website in Safari and choose **Share > Add to Home Screen**; it connects to the same Supabase backend.

### Build an Android APK

The existing Capacitor Android project packages the frontend as **LittleLoop** (`com.towsif.youtube`). It uses hosted Supabase and needs internet access for authentication, data, and YouTube playback.

1. Install Android Studio with Android SDK 36 and JDK 21. Set the SDK location through Android Studio or the ignored `android/local.properties` file.
2. Copy `.env.android.example` to `.env.android.local` and set the same hosted Supabase URL and publishable key as your Vercel deployment. Add your YouTube API key for search/import features. Android mode overrides `.env.local`, keeping the local Docker setup separate. Never use secret/service-role keys.
3. On Windows, run `npm run android:apk`. This builds the web app, syncs Capacitor, and assembles a debug-signed APK at `artifacts/LittleLoop-debug.apk`. The build script uses JDK 21 from `JAVA_HOME` or Android Studio's user JDK directory.
4. Transfer the APK to your phone, open it, and allow installation from that source when Android prompts. Test login, search, playback/fullscreen, and saving videos. Existing web accounts use the same hosted database. For new accounts, confirm the signup email in the browser, then return to the app and sign in.

For Android Studio, run `npm run android:sync` followed by `npm run android:open`. On other operating systems, sync and run `./gradlew assembleDebug` from `android/` with JDK 21 configured.

The debug APK is for direct installation and testing. Google Play distribution needs a release-signed Android App Bundle and a securely stored signing key. Web code updates require rebuilding and reinstalling the APK. The Android bundle disables the website service worker so it cannot cache an older app bundle.

For local phone testing, open Vite on your computer's LAN address (run npm run dev -- --host). In development, a loopback Supabase URL is mapped to that same hostname so requests reach your computer. Your firewall must allow the frontend and Supabase ports. Hosted deployments need their own VITE_SUPABASE_URL and publishable key set before building.

The YouTube iframe uses a sandbox without popup or top-navigation permissions. Links in the embed cannot open new tabs or replace the app page. The player is replaced with an in-app replay screen when a video ends. YouTube controls and branding remain visible; sandbox restrictions cannot prevent a user from manually opening another website in their browser.

Run npm run test:ui with Vite and local Supabase running. The browser checks responsive layouts, the real sign-in flow, history and list separation, and sandbox navigation blocking using deterministic mocked player content. Real YouTube playback still depends on video embedding availability and the browser.
