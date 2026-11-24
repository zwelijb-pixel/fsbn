(() => {
  'use strict';
  const c = window.FSBN_PUBLIC_CONFIG;
  const client = c && window.supabase && !c.url.includes('YOUR_PROJECT') && !c.publishableKey.includes('YOUR_')
    ? window.supabase.createClient(c.url, c.publishableKey, {auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}, global:{headers:{'X-Client-Info':'fsbn-public'}}}) : null;
  const fields = 'id,slug,headline,summary,body,published_at,updated_at,read_time_minutes,image_alt_text,image_caption,image_credit,seo_title,seo_description,category_id,authors(name),categories(name,slug),media_assets(storage_path,external_url),article_topics(topics(name,slug))';
  const check = result => { if (result.error) throw result.error; return result.data; };
  const needClient = () => { if (!client) throw new Error('Content service is not configured.'); return client; };
  const url = slug => `article.html?slug=${encodeURIComponent(slug)}`;
  async function list(categoryId, limit = Infinity) {
    const records = [], pageSize = 100;
    while (records.length < limit) {
      const size = Math.min(pageSize, limit - records.length);
      let q = needClient().from('articles').select(fields).eq('status','published').order('published_at',{ascending:false}).order('id',{ascending:false}).range(records.length, records.length + size - 1);
      if (categoryId) q = q.eq('category_id', categoryId);
      const page = check(await q) || [];
      records.push(...page);
      if (page.length < size) break;
    }
    return records;
  }
  async function category(slug) { return check(await needClient().from('categories').select('id,name,slug,description').eq('slug',slug).maybeSingle()); }
  async function resolve(slug) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) return null;
    const found = check(await needClient().from('article_slugs').select('article_id').eq('slug',slug).maybeSingle());
    if (!found?.article_id) return null;
    return check(await needClient().from('articles').select(fields).eq('id',found.article_id).eq('status','published').maybeSingle());
  }
  async function image(article) {
    const media = article.media_assets;
    if (!media) return null;
    if (media.storage_path) {
      const result = await needClient().storage.from('editorial-media').createSignedUrl(media.storage_path, 60);
      return result.error ? null : result.data.signedUrl;
    }
    try { const parsed = new URL(media.external_url); return parsed.protocol === 'https:' ? parsed.href : null; } catch { return null; }
  }
  const date = value => value ? new Intl.DateTimeFormat('en-ZA',{day:'numeric',month:'long',year:'numeric',timeZone:'Africa/Johannesburg'}).format(new Date(value)) : '';
  const minutes = article => Math.max(1, Math.ceil((article.body || '').trim().split(/\s+/).filter(Boolean).length / 200));
  function relative(value, now = Date.now()) {
    const time = new Date(value).getTime();
    if (!Number.isFinite(time)) return '';
    const seconds = Math.round((time - now) / 1000);
    const magnitude = Math.abs(seconds);
    const [unit, divisor] = magnitude < 60 ? ['second',1] : magnitude < 3600 ? ['minute',60] : magnitude < 86400 ? ['hour',3600] : magnitude < 604800 ? ['day',86400] : magnitude < 2629800 ? ['week',604800] : magnitude < 31557600 ? ['month',2629800] : ['year',31557600];
    return new Intl.RelativeTimeFormat('en', {numeric:'auto'}).format(Math.round(seconds / divisor), unit);
  }
  window.FSBNContent = {list,category,resolve,image,url,date,relative,minutes};
})();
