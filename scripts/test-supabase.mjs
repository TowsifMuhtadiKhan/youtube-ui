import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
for(const file of ['backend.sql','libraries.sql']) execFileSync('docker',['exec','-i','supabase_db_youtube-ui','psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1'],{input:readFileSync('supabase/tests/'+file,'utf8'),stdio:['pipe','inherit','inherit']});
