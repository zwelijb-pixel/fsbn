const assert = require('node:assert/strict'); const fs = require('node:fs');
const home=fs.readFileSync('index.html','utf8'); assert(!home.includes('href="#story"')); assert(home.includes('id="home-stories-status"'));
for(const name of ['business-news','economy','financial-markets','investments','personal-finance','technology','cryptocurrency']) { const html=fs.readFileSync(`${name}.html`,'utf8'); assert(html.includes('public-content.js')); assert(html.includes('category-engine.js')); assert(!html.includes('category-stories.js')); }
for(const file of ['homepage-content.js','category-engine.js','public-views.js']) assert(!fs.readFileSync(file,'utf8').includes('href="#'));
console.log('Page wiring: homepage and seven categories use published content; placeholder story links removed.');
