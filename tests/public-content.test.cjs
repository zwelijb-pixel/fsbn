const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const records = [{id:'1',slug:'current-story',status:'published',category_id:'cat',headline:'Published',summary:'Summary',body:'Text',published_at:'2026-11-24T10:00:00Z'}, {id:'2',slug:'draft-story',status:'draft',category_id:'cat',headline:'Draft'}, {id:'3',slug:'archived-story',status:'archived',category_id:'cat',headline:'Archived'}];
const slugs = [{slug:'old-story',article_id:'1'},{slug:'current-story',article_id:'1'},{slug:'draft-story',article_id:'2'},{slug:'archived-story',article_id:'3'}];
function query(table) {
 let filters=[], start=0, max=1000;
 const q={select(){return q},eq(k,v){filters.push([k,v]);return q},order(){return q},limit(n){max=n;return q},range(from,to){start=from;max=to+1;return q},
  async maybeSingle(){return {data:rows()[0]||null,error:null}},then(resolve,reject){return Promise.resolve({data:rows().slice(start,max),error:null}).then(resolve,reject)}};
 function rows(){let items=table==='articles'?records:table==='article_slugs'?slugs.filter(s=>records.some(a=>a.id===s.article_id&&a.status==='published')):[];return items.filter(a=>filters.every(([k,v])=>a[k]===v));} return q;
}
const client={from:query,storage:{from(){return {createSignedUrl:async()=>({data:null,error:true})}}}};
const window={FSBN_PUBLIC_CONFIG:{url:'https://test.invalid',publishableKey:'public'},supabase:{createClient:()=>client}};
const context={window,URL,Intl,console};vm.runInNewContext(fs.readFileSync('public-content.js','utf8'),context);
const api=window.FSBNContent;
(async()=>{
 const published=await api.list('cat');assert.equal(published.length,1);
 for (const article of published) { const u=api.url(article.slug); const slug=new URL(u,'https://example.test/').searchParams.get('slug'); assert.equal((await api.resolve(slug)).id,article.id); }
 assert.equal(api.minutes({body: Array(201).fill('word').join(' '), read_time_minutes:99}),2);
 assert.equal(api.relative('2026-11-24T09:00:00Z',Date.parse('2026-11-24T10:00:00Z')),'1 hour ago');
 assert.equal((await api.resolve('old-story')).slug,'current-story');
 assert.equal(await api.resolve('draft-story'),null); assert.equal(await api.resolve('archived-story'),null); assert.equal(await api.resolve('missing'),null); assert.equal(await api.resolve('../bad'),null);
 console.log('Public content: published links resolve to the right record; old slug, draft, archive and missing paths passed (mock database).');
})().catch(e=>{console.error(e);process.exit(1)});
