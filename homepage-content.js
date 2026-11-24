(async () => {
  'use strict';
  const lead = document.querySelector('.lead-grid'); const latest = document.querySelector('.story-grid');
  const state = document.querySelector('#home-stories-status');
  try {
    const stories = await FSBNContent.list(null,7);
    if (!stories.length) { state.textContent = 'No published stories are available yet.'; return; }
    state.textContent = ''; const first = stories[0]; const {el,link,card} = FSBNViews;
    const feature = el('article','lead-story');
    const picture = link(first,'image-link'); const img = el('img','lead-image'); img.alt = first.image_alt_text || ''; img.hidden = true; picture.append(img);
    FSBNViews.showImage(picture,img,first);
    const copy = el('div','lead-copy'); copy.append(el('span','category',`${first.categories?.name || 'FSBN'} · ${FSBNContent.minutes(first)} MIN READ`));
    const h = el('h1'); h.append(link(first,'',first.headline)); const byline = el('div','byline'); byline.append(document.createTextNode(`${first.authors?.name || 'FSBN'} · `), FSBNViews.publishedTime(first.published_at)); copy.append(h,el('p','',first.summary),byline);
    feature.append(picture,copy); const rail = el('aside','lead-rail'); rail.setAttribute('aria-label','Top stories'); rail.append(el('h2','', 'Today’s focus'));
    stories.slice(1,4).forEach(a => {const row=el('article','rail-story');row.append(el('span','category',a.categories?.name||'FSBN'));const title=el('h3');title.append(link(a,'',a.headline));row.append(title,el('p','',a.summary),FSBNViews.publishedTime(a.published_at));rail.append(row);});
    lead.replaceChildren(feature,rail); latest.replaceChildren(...stories.slice(4,7).map(a => card(a)));
  } catch { state.textContent = 'Stories are temporarily unavailable. Please try again later.'; }
})();
