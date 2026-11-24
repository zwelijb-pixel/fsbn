(() => {
  'use strict';
  const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text != null) node.textContent = text; return node; };
  const link = (article, className, text) => { const a = el('a',className,text); a.href = FSBNContent.url(article.slug); return a; };
  function publishedTime(value) {
    const time = el('time'); time.dateTime = value; time.dataset.published = value;
    time.title = FSBNContent.date(value); time.textContent = FSBNContent.relative(value);
    return time;
  }
  function updateTimes() { document.querySelectorAll('time[data-published]').forEach(time => { time.textContent = FSBNContent.relative(time.dataset.published); }); }
  function showImage(container, image, article) {
    const fallback = el('span','image-fallback','Image unavailable');
    fallback.setAttribute('role','status'); container.append(fallback); image.hidden = true;
    image.addEventListener('error', () => { image.hidden = true; fallback.hidden = false; });
    image.addEventListener('load', () => { fallback.hidden = true; image.hidden = false; });
    FSBNContent.image(article).then(src => { if (src) image.src = src; }).catch(() => {});
  }
  function card(article, categoryStyle = false) {
    const node = el('article',categoryStyle ? 'article' : 'story-card');
    const imageLink = link(article,categoryStyle ? 'thumb' : 'card-image');
    const image = el('img'); image.alt = article.image_alt_text || ''; image.loading = 'eager'; imageLink.append(image);
    showImage(imageLink,image,article);
    const badge = el('span','image-category',article.categories?.name || 'FSBN'); imageLink.append(badge);
    const copy = el('div',categoryStyle ? 'copy' : 'card-copy');
    copy.append(el('span',categoryStyle ? 'meta' : 'category',`${article.categories?.name || 'FSBN'} · ${FSBNContent.minutes(article)} MIN READ`));
    const heading = el(categoryStyle ? 'h2' : 'h3'); heading.append(link(article,'',article.headline)); copy.append(heading,el('p','',article.summary));
    const byline = el('div',categoryStyle ? 'byline' : 'story-time'); byline.append(document.createTextNode(`${article.authors?.name || 'FSBN'} · `),publishedTime(article.published_at)); copy.append(byline);
    copy.append(link(article,categoryStyle ? 'read' : 'read-more','Read story →')); node.append(imageLink,copy); return node;
  }
  window.FSBNViews = {el,link,card,showImage,publishedTime};
  setInterval(updateTimes,60000);
})();
