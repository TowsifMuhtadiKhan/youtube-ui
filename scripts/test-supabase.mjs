import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const sql = readFileSync('supabase/tests/backend.sql', 'utf8');
execFileSync('docker', ['exec', '-i', 'supabase_db_youtube-ui', 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'], { input: sql, stdio: ['pipe', 'inherit', 'inherit'] });
