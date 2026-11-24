-- Phase 1 integration test: run as postgres against a disposable Supabase project.
-- Migrations must be applied first. The transaction rolls back all fixtures.
begin;
insert into auth.users(id,email) values
 ('61000000-0000-0000-0000-000000000001','phase1-author@example.invalid'),
 ('61000000-0000-0000-0000-000000000002','phase1-editor@example.invalid');
insert into public.profiles(id,display_name) values
 ('61000000-0000-0000-0000-000000000001','Phase 1 author'),
 ('61000000-0000-0000-0000-000000000002','Phase 1 editor');
insert into public.staff_roles(user_id,role) values
 ('61000000-0000-0000-0000-000000000001','author'),
 ('61000000-0000-0000-0000-000000000002','editor');
insert into public.authors(id,name,profile_id) values ('62000000-0000-0000-0000-000000000001','Phase 1 author','61000000-0000-0000-0000-000000000001');
insert into public.categories(id,slug,name) values ('63000000-0000-0000-0000-000000000001','phase1-test','Phase 1 test');
set local role authenticated;
select set_config('request.jwt.claim.sub','61000000-0000-0000-0000-000000000001',true);
select public.save_article(null,'{"slug":"phase1-test-article","headline":"Phase 1 test","summary":"Test summary","body":"Test body","author_id":"62000000-0000-0000-0000-000000000001","category_id":"63000000-0000-0000-0000-000000000001","status":"draft"}'::jsonb,array[]::uuid[]);
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 if exists(select 1 from public.articles where slug='phase1-test-article') then raise exception 'Draft visible to public'; end if;
 if exists(select 1 from public.article_slugs where slug='phase1-test-article') then raise exception 'Draft slug visible to public'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','61000000-0000-0000-0000-000000000002',true);
update public.articles set status='published',published_at=now() where slug='phase1-test-article';
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 if not exists(select 1 from public.articles a join public.categories c on c.id=a.category_id where a.slug='phase1-test-article' and a.status='published' and c.slug='phase1-test') then raise exception 'Published article not visible in category'; end if;
 if not exists(select 1 from public.article_slugs s join public.articles a on a.id=s.article_id where s.slug='phase1-test-article' and a.status='published') then raise exception 'Published article route cannot resolve'; end if;
end $$;
rollback;
