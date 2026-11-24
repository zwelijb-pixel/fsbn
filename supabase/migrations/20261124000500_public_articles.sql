-- Reserve every slug permanently, including after deletion, to prevent old links
-- from ever resolving to an unrelated article.
create table public.article_slugs (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  article_id uuid references public.articles(id) on delete set null
);
insert into public.article_slugs (slug, article_id) select slug, id from public.articles;
alter table public.article_slugs enable row level security;
revoke all on public.article_slugs from anon, authenticated;
grant select on public.article_slugs to anon, authenticated;
create policy published_slug_read on public.article_slugs for select to anon, authenticated
using (exists (select 1 from public.articles a where a.id = article_id and a.status = 'published'));
create function public.reserve_article_slug() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.article_slugs (slug, article_id) values (new.slug, new.id)
  on conflict (slug) do update set article_id = excluded.article_id
    where public.article_slugs.article_id = excluded.article_id;
  if not found then raise exception 'Article slug has already been used' using errcode = '23505'; end if;
  return new;
end;
$$;
revoke all on function public.reserve_article_slug() from public;
create trigger articles_reserve_slug after insert or update of slug on public.articles
for each row execute function public.reserve_article_slug();

-- Private bucket: allow the creation of short-lived signed URLs only for objects
-- referenced by a currently published article. Draft media remains private.
create policy published_editorial_media_read on storage.objects for select to anon, authenticated
using (bucket_id = 'editorial-media' and exists (
  select 1 from public.media_assets m join public.articles a on a.cover_image_id = m.id
  where m.storage_path = storage.objects.name and a.status = 'published'
));
