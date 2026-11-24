(async () => {
  'use strict';
  const $ = id => document.getElementById(id); const state = $('article-state');
  try {
    const slug = new URLSearchParams(location.search).get('slug');
    const article = await FSBNContent.resolve(slug);
    if (!article) { document.title = 'Article not found | FSBN'; state.textContent = 'Article not found. It may have been removed or is no longer available.'; return; }
    if (slug !== article.slug) { location.replace(FSBNContent.url(article.slug)); return; }
    document.title = `${article.seo_title || article.headline} | FSBN`;
    document.querySelector('meta[name="description"]').content = article.seo_description || article.summary;
    const canonical = document.createElement('link'); canonical.rel='canonical'; canonical.href=new URL(FSBNContent.url(article.slug),location.href).href; document.head.append(canonical);
    $('article-category').textContent = article.categories?.name || 'FSBN';
    const knownCategories = ['business-news','economy','financial-markets','investments','personal-finance','technology','cryptocurrency'];
    $('article-category').href = knownCategories.includes(article.categories?.slug) ? `${article.categories.slug}.html` : 'index.html';
    $('article-headline').textContent = article.headline; $('article-summary').textContent = article.summary;
    $('article-author').textContent = `By ${article.authors?.name || 'FSBN'}`;
    $('article-published').dateTime = article.published_at; $('article-published').textContent = `Published ${FSBNContent.date(article.published_at)}`;
    if (article.updated_at && new Date(article.updated_at).getTime() - new Date(article.published_at).getTime() > 60000) { $('article-updated').hidden = false; $('article-updated').dateTime=article.updated_at; $('article-updated').textContent = `Updated ${FSBNContent.date(article.updated_at)}`; }
    $('article-read-time').textContent = `${FSBNContent.minutes(article)} min read`;
    FSBNMarkdown.render($('article-body'),article.body); $('article-content').hidden = false; state.textContent = '';
    $('article-image').alt = article.image_alt_text || ''; $('article-caption').textContent = [article.image_caption,article.image_credit].filter(Boolean).join(' · '); $('article-figure').hidden = false; FSBNViews.showImage($('article-figure'), $('article-image'), article);
    try {
      const related = (await FSBNContent.list(article.category_id,4)).filter(a => a.id !== article.id).slice(0,3);
      if (related.length) { $('related-grid').replaceChildren(...related.map(a => FSBNViews.card(a,true))); $('related').hidden=false; }
    } catch { /* Article remains available if related stories cannot load. */ }
  } catch { state.textContent = 'This article is temporarily unavailable. Please try again later.'; }
})();
