(() => {
  'use strict';
  const grid = document.querySelector('#article-grid'), topic = document.querySelector('#topic-filter'), sort = document.querySelector('#sort-order');
  const count = document.querySelector('#results-count'), empty = document.querySelector('#empty-state'), more = document.querySelector('#load-more');
  let articles = [], shown = 3;
  function update() {
    const filtered = articles.filter(a => topic.value === 'all' || (a.article_topics || []).some(t => t.topics?.slug === topic.value));
    filtered.sort((a,b) => sort.value === 'title' ? a.headline.localeCompare(b.headline) : sort.value === 'oldest' ? new Date(a.published_at) - new Date(b.published_at) : new Date(b.published_at) - new Date(a.published_at));
    const visible = filtered.slice(0,shown); grid.replaceChildren(...visible.map(a => FSBNViews.card(a,true)));
    count.textContent = `Showing ${visible.length} of ${filtered.length} ${filtered.length === 1 ? 'story' : 'stories'}`;
    empty.style.display = filtered.length ? 'none' : 'block'; more.hidden = shown >= filtered.length;
  }
  topic.addEventListener('change',() => { shown = 3; update(); }); sort.addEventListener('change',update); more.addEventListener('click',() => { shown += 3; update(); });
  document.querySelector('#clear-filters').addEventListener('click',() => {topic.value='all';sort.value='newest';shown=3;update();});
  (async () => {
    count.textContent = 'Loading stories…'; more.hidden = true;
    try {
      const slug = location.pathname.split('/').pop().replace(/\.html$/, '');
      const category = await FSBNContent.category(slug);
      if (!category) { count.textContent = 'Category not found.'; return; }
      document.title = `${category.name} | FSBN`; document.querySelector('#category-title').textContent = category.name;
      document.querySelector('#category-crumb').textContent = category.name; document.querySelector('#category-description').textContent = category.description || '';
      articles = await FSBNContent.list(category.id);
      const unique = new Map(); articles.forEach(a => (a.article_topics || []).forEach(t => { if(t.topics) unique.set(t.topics.slug,t.topics.name); }));
      [...unique].sort((a,b) => a[1].localeCompare(b[1])).forEach(([id,name]) => {const option=document.createElement('option');option.value=id;option.textContent=name;topic.append(option);});
      update();
    } catch { count.textContent = 'Stories are temporarily unavailable. Please try again later.'; }
  })();
})();
