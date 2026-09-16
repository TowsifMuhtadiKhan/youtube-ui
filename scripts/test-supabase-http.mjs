import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
const status = JSON.parse(execFileSync(process.execPath, ['node_modules/supabase/dist/supabase.js', 'status', '-o', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
assert.ok(['localhost', '127.0.0.1'].includes(new URL(status.API_URL).hostname), 'Only run against local Supabase');
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, options);
const makeClient = () => createClient(status.API_URL, status.PUBLISHABLE_KEY || status.ANON_KEY, options);
const first = makeClient(), second = makeClient();
const ids = [];
try {
 const email = 'tomtube-test-' + randomUUID() + '@example.test';
 const password = randomUUID() + '!aA1';
 const signup = await first.auth.signUp({ email, password, options: { data: { role: 'admin' } } });
 assert.ifError(signup.error); ids.push(signup.data.user.id);
 assert.ok(signup.data.session, 'Local signup should return a session');
 assert.ifError((await first.auth.signOut()).error);
 const login = await first.auth.signInWithPassword({ email, password }); assert.ifError(login.error);
 const saved = await first.rpc('tomtube_api', { action: 'videos.approve', payload: { youtubeVideoId: 'abcdefghijk', title: 'API test video', thumbnail: 'https://img.youtube.com/vi/abcdefghijk/hqdefault.jpg', channelName: 'Test' } });
 assert.ifError(saved.error); assert.equal(saved.data[0].title, 'API test video');
 const fresh = makeClient();
 assert.ifError((await fresh.auth.signInWithPassword({ email, password })).error);
 const loaded = await fresh.rpc('tomtube_api', { action: 'videos.list' });
 assert.ifError(loaded.error); assert.equal(loaded.data[0].youtubeVideoId, 'abcdefghijk');
 assert.ok((await first.rpc('tomtube_api', { action: 'admin.users' })).error, 'User metadata must not grant admin privileges');
 const other = await second.auth.signUp({ email: 'tomtube-test-' + randomUUID() + '@example.test', password });
 assert.ifError(other.error); ids.push(other.data.user.id);
 const isolated = await second.rpc('tomtube_api', { action: 'videos.list', payload: { childId: ids[0] } });
 assert.ifError(isolated.error); assert.deepEqual(isolated.data, []);
 assert.ifError((await first.auth.signOut()).error);
 assert.ok((await first.rpc('tomtube_api', { action: 'videos.list' })).error, 'Signed-out access must fail');
 await fresh.auth.signOut(); await second.auth.signOut();
 console.log('PASS: real Supabase signup, login, persistent video save/reload, account isolation, untrusted role denial, and logout.');
} finally {
 for (const id of ids) {
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw new Error('Could not clean up local test user: ' + error.message);
 }
}
