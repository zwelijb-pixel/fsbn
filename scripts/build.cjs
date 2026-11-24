// Build a minimal static deployment using only public Supabase configuration.
const fs = require('node:fs');
const path = require('node:path');
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
let parsed;
try { parsed = new URL(url); } catch { throw new Error('Set SUPABASE_URL to the HTTPS project URL.'); }
if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) throw new Error('SUPABASE_URL must be an HTTPS project origin.');
if (!key || !key.trim() || key.includes('YOUR_') || key.startsWith('sb_secret_')) throw new Error('Set SUPABASE_PUBLISHABLE_KEY to a publishable key.');
if (key.startsWith('eyJ')) {
  let payload;
  try { payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8')); } catch { throw new Error('Invalid legacy API key.'); }
  if (payload.role !== 'anon') throw new Error('Only a legacy anon key may be used in browser configuration.');
} else if (!key.startsWith('sb_publishable_')) throw new Error('Expected a Supabase publishable or legacy anon key.');
const out = path.join(process.cwd(), 'dist');
fs.mkdirSync(out, {recursive:true});
const files = fs.readdirSync('.').filter(name => /\.(html|css|js)$/.test(name) && !['public-config.js','staff-config.example.js','public-config.example.js','category-stories.js','business-news.js','economy.js','financial-markets.js','investments.js','personal-finance.js','technology.js','cryptocurrency.js'].includes(name));
for (const name of files) fs.copyFileSync(name, path.join(out, name));
fs.cpSync('public', path.join(out,'public'), {recursive:true});
fs.mkdirSync(path.join(out,'staff'), {recursive:true});
for (const name of ['index.html','staff.css','staff.js','dashboard.js','markdown.js']) fs.copyFileSync(path.join('staff',name),path.join(out,'staff',name));
const config = JSON.stringify({url:parsed.origin,publishableKey:key}).replace(/</g,'\\u003c');
fs.writeFileSync(path.join(out,'public-config.js'), `window.FSBN_PUBLIC_CONFIG = ${config};\n`);
fs.writeFileSync(path.join(out,'staff','config.js'), `window.FSBN_SUPABASE = ${config};\n`);
console.log('Static site built with public configuration.');
