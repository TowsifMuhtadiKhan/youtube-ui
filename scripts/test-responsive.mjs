import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
const status = JSON.parse(
  execFileSync(
    process.execPath,
    ["node_modules/supabase/dist/supabase.js", "status", "-o", "json"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ),
);
assert.ok(
  ["127.0.0.1", "localhost"].includes(new URL(status.API_URL).hostname),
);
const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const email = "responsive-" + randomUUID() + "@example.test",
  password = randomUUID() + "!Aa1";
const created = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
assert.ifError(created.error);
const user = createClient(status.API_URL, status.PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
assert.ifError((await user.auth.signInWithPassword({ email, password })).error);
const rpc = async (action, payload) => {
  const r = await user.rpc("tomtube_api", { action, payload });
  assert.ifError(r.error);
  return r.data;
};
let browser;
try {
  await rpc("videos.approve", {
    audience: "parent",
    youtubeVideoId: "abcdefghijk",
    title: "Parent science documentary",
    channelName: "Science",
    thumbnail: "https://img.youtube.com/vi/M7lc1UVf-VE/hqdefault.jpg",
  });
  await rpc("videos.approve", {
    audience: "kids",
    youtubeVideoId: "lmnopqrstuv",
    title: "Kids learning adventure",
    channelName: "Learning",
    thumbnail: "https://img.youtube.com/vi/M7lc1UVf-VE/hqdefault.jpg",
  });
  const parent = await rpc("playlists.create", {
    audience: "parent",
    name: "My documentaries",
  });
  const kid = await rpc("playlists.create", {
    audience: "kids",
    name: "Kids learning",
  });
  await rpc("playlists.add", {
    audience: "kids",
    playlistId: kid.id,
    youtubeVideoId: "lmnopqrstuv",
    title: "Kids learning adventure",
  });
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("https://www.youtube.com/iframe_api", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `window.YT={Player:function(frame,options){this.destroy=()=>frame.remove();this.stopVideo=()=>{};this.getVideoData=()=>({video_id:frame.src.split('/embed/')[1].split('?')[0]});window.__testYT={options,player:this};frame.addEventListener('load',()=>options.events.onStateChange({data:1,target:this}),{once:true});}};window.onYouTubeIframeAPIReady();`,
    }),
  );
  await page.route("https://www.youtube-nocookie.com/embed/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<body style="background:#152330;color:white;font:20px sans-serif"><p>Video playback test</p><a id="popup" target="_blank" href="https://www.youtube.com/watch?v=test">YouTube</a><a id="top" target="_top" href="https://www.youtube.com/">Open YouTube</a></body>',
    }),
  );
  await page.goto("http://localhost:5173/login");
  await page.getByLabel(/^Email/).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.waitForURL(/\/(home)?$/);
  await page.getByText("Parent science documentary", { exact: true }).waitFor();
  assert.equal(
    await page.getByText("Kids learning adventure", { exact: true }).count(),
    0,
  );
  mkdirSync("artifacts", { recursive: true });
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of ["/parent", "/playlist", "/settings", "/kids"]) {
      await page.evaluate(() => localStorage.removeItem("ytui_active_mode"));
      await page.goto("http://localhost:5173" + path);
      if (path === "/parent") {
        await page
          .getByRole("button", { name: "Add videos", exact: true })
          .click();
        await page.getByRole("dialog").waitFor();
        const bounds = await page
          .getByRole("dialog")
          .evaluate((el) => ({
            width: el.clientWidth,
            scroll: el.scrollWidth,
          }));
        assert.ok(
          bounds.scroll <= bounds.width + 1,
          "Add popup overflows at " + width,
        );
        await page.getByRole("button", { name: "Done", exact: true }).click();
      }
      if (path === "/playlist")
        await page.getByText("My documentaries", { exact: true }).waitFor();
      if (path === '/settings') await page.getByLabel('Daily minutes').waitFor();
      if (path === "/kids")
        await page
          .getByText("Kids learning adventure", { exact: true })
          .waitFor();
      const overflow = await page
        .locator("main")
        .evaluate((el) => ({ width: el.clientWidth, scroll: el.scrollWidth }));
      assert.ok(
        overflow.scroll <= overflow.width + 1,
        JSON.stringify({ width, path, overflow }),
      );
      if (path === '/kids' && width === 390) {
        await page.getByRole('button', { name: 'Switch to light theme', exact: true }).click();
        await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).waitFor();
        await page.screenshot({ path: 'artifacts/kids-light.png', fullPage: true, animations: 'disabled' });
        await page.reload();
        await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).waitFor();
        assert.equal(await page.evaluate(() => localStorage.getItem('tomtube-theme')), 'light');
        await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).click();
        await page.getByRole('button', { name: 'Switch to light theme', exact: true }).waitFor();
        await page.screenshot({ path: 'artifacts/kids-dark.png', fullPage: true, animations: 'disabled' });
      }
      if (path === "/kids" && width === 390)
        await page.screenshot({
          path: "artifacts/kids-mobile.png",
          fullPage: true,
        });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:5173/kids/watch/lmnopqrstuv");
  await page.locator('iframe[title="Video player"]').waitFor();
  const frame = page.frameLocator('iframe[title="Video player"]');
  await frame.locator("#popup").click();
  assert.equal(context.pages().length, 1, "YouTube popup escaped sandbox");
  await frame.locator("#top").click();
  assert.ok(
    page.url().endsWith("/kids/watch/lmnopqrstuv"),
    "YouTube top navigation escaped sandbox",
  );
  const sandbox = await page.locator("iframe").getAttribute("sandbox");
  assert.equal(sandbox, "allow-scripts allow-same-origin allow-presentation");
  await page.screenshot({ path: "artifacts/watch-mobile.png", fullPage: true });
  await page.evaluate(() =>
    window.__testYT.options.events.onStateChange({
      data: 0,
      target: window.__testYT.player,
    }),
  );
  await page.getByText("Video finished", { exact: true }).waitFor();
  assert.equal(await page.locator("iframe").count(), 0);
  await page.goto("http://localhost:5173/kids/history");
  await page.getByText("Kids learning adventure", { exact: true }).waitFor();
  await page.goto("http://localhost:5173/kids");
  await page.getByRole("button", { name: "Parent exit", exact: true }).click();
  await page.getByLabel("Parent PIN", { exact: true }).fill("1234");
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  await page.waitForURL("**/parent");
  await page.getByRole("button", { name: "Kids Videos", exact: true }).click();
  await page
    .getByRole("button", { name: "Manage saved videos", exact: true })
    .click();
  await page.getByRole("tab", { name: /Saved/ }).click();
  await page.getByRole('dialog').getByText("Kids learning adventure", { exact: true }).waitFor();
  assert.equal(
    await page.getByText("Parent science documentary", { exact: true }).count(),
    0,
  );
  await page.getByLabel("New playlist name").fill("New kids playlist");
  await page
    .getByRole("button", { name: "Create playlist", exact: true })
    .click();
  await page.getByRole("tab", { name: "Search YouTube", exact: true }).click();
  await page.route("https://www.googleapis.com/youtube/v3/search**", (route) =>
    route.fulfill({
      json: {
        items: [
          {
            id: { videoId: "zyxwvutsrqp" },
            snippet: {
              title: "New learning video",
              channelTitle: "Learning",
              thumbnails: {
                high: {
                  url: "https://img.youtube.com/vi/M7lc1UVf-VE/hqdefault.jpg",
                },
              },
            },
          },
        ],
      },
    }),
  );
  await page.getByLabel("Search YouTube", { exact: true }).fill("learning");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page
    .getByRole("button", { name: "Add to playlist", exact: true })
    .click();
  await page
    .getByText("Added to Kids Videos and the selected playlist.", {
      exact: true,
    })
    .waitFor();
  // URL imports and channel/playlist browsing must only save explicitly chosen videos.
  await page.route(
    "https://www.googleapis.com/youtube/v3/videos**",
    (route) => {
      const ids = new URL(route.request().url()).searchParams
        .get("id")
        .split(",");
      return route.fulfill({
        json: {
          items: ids.map((id) => ({
            id,
            snippet: {
              title: "Imported " + id,
              channelTitle: "Test channel",
              thumbnails: {},
            },
            status: { embeddable: true },
          })),
        },
      });
    },
  );
  await page
    .getByLabel("Search YouTube", { exact: true })
    .fill("https://youtu.be/abcdefghij1?t=10");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.getByText("Imported abcdefghij1", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Add to playlist", exact: true })
    .click();
  await page.getByRole("button", { name: "Added", exact: true }).waitFor();
  await page.route(
    "https://www.googleapis.com/youtube/v3/playlistItems**",
    (route) => {
      const next = new URL(route.request().url()).searchParams.get("pageToken");
      return route.fulfill({
        json: {
          items: [
            {
              contentDetails: { videoId: next ? "abcdefghij3" : "abcdefghij2" },
            },
          ],
          ...(next ? {} : { nextPageToken: "second" }),
        },
      });
    },
  );
  await page
    .getByRole("button", { name: "YouTube playlist URL or ID", exact: true })
    .click();
  await page
    .getByLabel("YouTube playlist link or ID")
    .fill("https://www.youtube.com/playlist?list=PLtest");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.getByText("Imported abcdefghij2", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Load more videos", exact: true })
    .click();
  await page.getByText("Imported abcdefghij3", { exact: true }).waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "Load more videos", exact: true })
      .count(),
    0,
  );
  await page.route("https://www.googleapis.com/youtube/v3/search**", (route) =>
    route.fulfill({
      json: {
        items: [
          {
            id: { channelId: "UCtest" },
            snippet: {
              title: "Matching channel",
              description: "Choose this channel",
              thumbnails: {},
            },
          },
        ],
      },
    }),
  );
  await page.route(
    "https://www.googleapis.com/youtube/v3/channels**",
    (route) =>
      route.fulfill({
        json: {
          items: [
            {
              id: "UCtest",
              contentDetails: { relatedPlaylists: { uploads: "UUtest" } },
            },
          ],
        },
      }),
  );
  await page
    .getByRole("button", { name: "Channel name, @handle, or URL", exact: true })
    .click();
  await page.getByLabel("Channel name or link").fill("Learning channel");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.getByText("Matching channel", { exact: true }).waitFor();
  await page.getByRole("button", { name: "View videos", exact: true }).click();
  await page.getByText("Imported abcdefghij2", { exact: true }).waitFor();
  await page
    .getByLabel("Channel name or link")
    .fill("https://www.youtube.com/@Learning");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.getByText("Imported abcdefghij2", { exact: true }).waitFor();
  const kidsSaved = await rpc("videos.list", { audience: "kids" });
  assert.ok(kidsSaved.some((v) => v.youtubeVideoId === "abcdefghij1"));
  assert.ok(
    !kidsSaved.some((v) =>
      ["abcdefghij2", "abcdefghij3"].includes(v.youtubeVideoId),
    ),
    "Browsing must not approve videos",
  );
  const parentSaved = await rpc("videos.list", { audience: "parent" });
  assert.ok(!parentSaved.some((v) => v.youtubeVideoId === "abcdefghij1"));
  await page.goto("http://localhost:5173/playlist");
  await page
    .getByRole("button", { name: "Kids playlists", exact: true })
    .click();
  await page.getByText("New kids playlist", { exact: true }).waitFor();
  await page.getByText("New learning video", { exact: true }).waitFor();
  await page.goto("http://localhost:5173/home");
  assert.equal(
    await page.getByText("New learning video", { exact: true }).count(),
    0,
  );
  await page.goto('http://localhost:5173/parent');
  assert.equal(await page.getByLabel('Daily minutes').count(), 0, 'Screen time controls should live only in Settings');
  await page.goto('http://localhost:5173/settings');
  await page.getByLabel('Daily minutes').fill('45');
  await page.getByRole('button', { name: 'Save limit', exact: true }).click();
  await page.getByText('Daily limit saved.', { exact: true }).waitFor();
  await page.reload();
  await page.getByRole('button', { name: 'Save limit', exact: true }).waitFor();
  await page.waitForFunction(() => document.querySelector('input[type="number"]')?.value === '45');
  await page.getByRole('button', { name: '+10 minutes', exact: true }).click();
  await page.getByText('Added 10 minutes for your child.', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Change parent PIN', exact: true }).click();
  await page.getByLabel('Current PIN', { exact: true }).fill('1234');
  await page.getByLabel(/^New PIN/).fill('5678');
  await page.getByRole('button', { name: 'Save PIN', exact: true }).click();
  await page.getByText('PIN updated.', { exact: true }).waitFor();
  await page.route("**/rest/v1/rpc/tomtube_api", (route) =>
    route.fulfill({ status: 503, json: { message: "Connection unavailable" } }),
  );
  await page.goto("http://localhost:5173/kids");
  await page.getByText("Screen time unavailable", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Try again", exact: true }).waitFor();
  assert.equal(
    await page.getByText("0 minutes left today", { exact: true }).count(),
    0,
  );
  await page.screenshot({
    path: "artifacts/kids-error-mobile.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: real UI login/config, separate lists/playlists, mobile/tablet layouts at 320/390/768/1280px, history, PIN exit, and sandbox popup/top-navigation blocking. Player content is mocked for deterministic browser checks.",
  );
} finally {
  await browser?.close();
  await admin.auth.admin.deleteUser(created.data.user.id);
}
