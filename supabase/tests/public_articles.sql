-- Run as postgres on a disposable Supabase project after migrations. Rolls back.
begin;
insert into public.authors(id,name) values ('51000000-0000-0000-0000-000000000001','Public test author');
insert into public.categories(id,slug,name) values ('52000000-0000-0000-0000-000000000001','public-test-category','Public test category');
insert into public.articles(id,slug,headline,summary,body,author_id,category_id,status,published_at) values
 ('53000000-0000-0000-0000-000000000001','public-test-old','Published test','Summary','Body','51000000-0000-0000-0000-000000000001','52000000-0000-0000-0000-000000000001','published',now()),
 ('53000000-0000-0000-0000-000000000002','public-test-draft','Draft test','Summary','Body','51000000-0000-0000-0000-000000000001','52000000-0000-0000-0000-000000000001','draft',null),
 ('53000000-0000-0000-0000-000000000003','public-test-archive','Archived test','Summary','Body','51000000-0000-0000-0000-000000000001','52000000-0000-0000-0000-000000000001','archived',null);
update public.articles set slug='public-test-new' where id='53000000-0000-0000-0000-000000000001';
set local role anon;
do $$ begin
 if (select count(*) from public.article_slugs where slug in ('public-test-old','public-test-new')) <> 2 then raise exception 'published old and new slugs must resolve'; end if;
 if exists(select 1 from public.article_slugs where slug in ('public-test-draft','public-test-archive')) then raise exception 'unpublished slugs exposed'; end if;
 if exists(select 1 from public.articles where slug in ('public-test-draft','public-test-archive')) then raise exception 'unpublished articles exposed'; end if;
end $$;
reset role;
do $$ begin
 begin
  insert into public.articles(slug,headline,author_id,category_id) values ('public-test-old','Reuse','51000000-0000-0000-0000-000000000001','52000000-0000-0000-0000-000000000001');
  raise exception 'old slug reuse was allowed';
 exception when unique_violation then null; end;
end $$;
delete from public.articles where id='53000000-0000-0000-0000-000000000001';
do $$ begin
 begin
  insert into public.articles(slug,headline,author_id,category_id) values ('public-test-old','Reuse','51000000-0000-0000-0000-000000000001','52000000-0000-0000-0000-000000000001');
  raise exception 'deleted slug reuse was allowed';
 exception when unique_violation then null; end;
end $$;
rollback;
