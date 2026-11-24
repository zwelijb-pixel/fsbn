# Development progress

Last updated: 24 November 2026

## Completed: repository assessment

- Created and switched to the local `development` branch from `main`; the existing `category-base.css` working-tree change was retained.
- Confirmed this is a static HTML/CSS/JavaScript site: no package manifest, build configuration, framework or existing Supabase integration was found at the repository root. No dependencies were installed.
- Preserved the existing FSBN branding, navigation, layouts and responsive styles; no site files were changed in this assessment.

## Existing site

- Pages: `index.html` and seven category pages: Business News, Economy, Financial Markets, Investments, Personal Finance, Technology and Cryptocurrency.
- Homepage: `styles.css` and `script.js` provide presentation, mobile navigation, local card search and a disconnected newsletter form. Homepage stories are hard-coded; story links are placeholders.
- Category pages: each has a small category-specific CSS import and JavaScript selector. `category-base.css` contains shared responsive styles; `category-stories.js` holds static story data; `category-engine.js` renders cards and implements filtering, sorting and pagination. Category article links currently point to their own card anchors, not full articles.
- Reusable patterns are shared styles, the category renderer and repeated header/footer markup; there is no component framework. Brand images are in `public/images/`.

## Architecture decisions

- Keep the existing static site and visual language. Supabase is a suitable proposed managed backend for PostgreSQL, authentication and media storage; project setup, cost and operational settings remain to be confirmed. Its browser Data API can work with the existing JavaScript without a framework migration.
- Minimum data model: an `articles` table with a unique slug, title, summary, body, category, topic, author, cover image reference and alt text, reading time, status (`draft` or `published`), created/updated timestamps and publication timestamp. Enforce required fields, valid statuses and unique slugs in the database. Keep category identifiers aligned with existing pages.
- Enable row-level security and explicit grants: public visitors can read only published articles; only explicitly authorized editorial users can read drafts and create, update, publish or delete articles. Maintain authorization in a protected role/membership table tied to Supabase Auth users, not editable user metadata. Disable public sign-up or otherwise restrict account provisioning. Test policies using anonymous, unauthorized and authorized sessions.
- Use Supabase Auth for admin sign-in and session handling. A small static admin page can manage article drafts, publishing and image uploads with the authenticated client; hiding the UI is not authorization. Use only the publishable key in browser code; never expose secret/service-role keys. Provision editorial users through a trusted administrative process.
- Use a public Storage bucket only for images intended to be public, with editorial-only upload/update/delete policies, file type and size limits. Public bucket URLs are accessible to anyone even for unpublished articles; use private storage if draft media must remain confidential. Record image paths and alt text with articles.
- Adapt the existing category renderer and homepage to fetch published records; add a simple article detail page addressed by slug. Preserve existing responsive card and navigation patterns. Render untrusted text safely and sanitize any supported rich HTML; handle loading, empty and error states. Decide how to migrate or retire placeholder stories before connecting live content.
- Client-rendered article pages may need server-side rendering or prerendering later for reliable search/social previews; assess hosting and SEO requirements before adding infrastructure. Define a backup/recovery process and review project costs and quotas before production.
- References: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [database security](https://supabase.com/docs/guides/database/secure-data), [storage access control](https://supabase.com/docs/guides/storage/security/access-control), [bucket access models](https://supabase.com/docs/guides/storage/buckets/fundamentals).

## Outstanding work / next section

1. Confirm Supabase project and hosting configuration, editorial account provisioning, content format and publication requirements.
2. Implement and review schema migrations, grants, RLS and storage policies; verify access with each relevant role before exposing data.
3. Connect published articles to existing pages, add article detail and implement the authenticated admin workflow, retaining the current design.
4. Test authoring, publishing, public access, denied access, image handling, error states and responsive layouts; document deployment, backups and operational setup.

## Verification

- Inspected Git status and branches, root files, page structure, shared category data/renderer and homepage interactions. Existing uncommitted change: `category-base.css`.
- Reviewed Supabase's official documentation for browser keys, database security and storage access. This is an architecture assessment; no Supabase project, policies or live connection were tested.
- No application tests or visual browser checks were run because no application code or styles were changed.

## Completed: central content database

- Added versioned Supabase migrations for profiles, protected staff roles, authors, categories, topics, tags, media assets, articles and article-topic/tag relationships. Constraints, foreign keys, indexes, update timestamps, grants and row-level security are included.
- Anonymous users can select only published articles and their linked media/relationships. Authenticated editors can manage content; staff role assignments and profile provisioning require a trusted administrator. Taxonomy and authors are publicly readable. A private `editorial-media` bucket limits image operations to editors and restricts file types and size.
- Imported all 42 category sample records as `is_demo = true` drafts, with a demo author and no invented article body. The database prevents publishing demo records unless they are explicitly converted to real content. Existing homepage-only placeholder copy remains in the static site and is not represented as reporting in the database; it must be reviewed before dynamic launch. Existing sample image URLs are external; attribution and rights require review.
- Added `.env.example` with public client configuration placeholders and `.gitignore` rules for local environment files. No credentials were added and no admin interface was built.

## External configuration and next section

- Create or select a Supabase project and apply the migrations through a trusted deployment workflow. No project was connected or modified in this section. Confirm backup, recovery, hosting, signup restrictions and account provisioning.
- Create Auth users and provision matching `profiles` and `staff_roles` rows via a trusted administrator; never grant role-table writes to clients. Test anonymous, ordinary authenticated and editorial users, including draft access and storage operations, on the actual project before exposing it.
- The media bucket is private: choose a safe published-media delivery approach in the publishing section; do not expose draft uploads via public URLs. Review demo content and replace it with verified material before publishing. Then connect existing pages and implement the article and admin interfaces in subsequent sections.

## Database verification

- Generated the demo migration directly from the existing category dataset: 42 articles across seven categories. Ran JavaScript syntax verification and `git diff --check`.
- No local PostgreSQL, Supabase CLI or Docker executable was available; migrations, RLS, constraints and storage policies have not been executed against a database. Live role-based tests remain required.

## Completed: staff authentication and roles

- Added the staff sign-in page, password recovery, logout, session/role checks, role-specific navigation and clear nonstaff or expired-session messages. The interface is a staff-access shell; article editing and the settings editor remain future work.
- Added a migration for administrator, editor and author roles. Administrators can manage profile/role rows and settings; editors retain editorial content access; authors can read, create and update only their own draft articles through an `authors.profile_id` link. Public users cannot modify roles. Existing editor policies enforce publishing access. Role checks use protected database rows, not user metadata.
- Added `staff/README.md` with initial administrator provisioning, public client configuration, signup/redirect requirements and launch checks. No credentials or public signup flow were added. Staff assignment requires an existing Auth user; Auth user creation/deletion remains a trusted administrative operation.
- The Supabase browser SDK persists sessions in browser storage; use HTTPS, trusted devices and a restrictive hosting CSP. RLS remains authoritative if a previously authorized browser still displays a stale screen. Recovery email and cross-device flows require deployment testing.

## Staff verification and outstanding configuration

- `node staff/auth.test.cjs` exercises mocked role navigation, nonstaff denial and signed-out state; `node --check staff/staff.js` and `git diff --check` passed. This does not verify real Supabase authentication or SQL policies.
- No local PostgreSQL, Supabase CLI, Docker or configured project was available. Apply the migrations to a non-production project, configure Auth and email, provision an administrator, and run the role matrix and full recovery/logout/expiry tests documented in `staff/README.md` before deployment. In particular, validate direct database/API attempts by each role, including authors attempting to edit others' drafts or publish and editors attempting role changes.
- The protected settings table has no editor UI yet; article authoring, review, publishing and reader-facing integration remain subsequent sections. Private media delivery for published articles remains unresolved.

## Article dashboard

- The protected staff workspace now lists articles and status totals, and provides create, edit, draft, preview, publish, archive and delete actions. Archive and delete require confirmation and are limited to editors and administrators. Authors can work on their own drafts, provided their Auth profile is linked to an author record.
- Article fields include category, topics, author, Markdown body, image metadata and SEO. The preview builds DOM nodes from a limited Markdown subset without interpreting HTML. Unsaved changes prompt before closing the editor, switching articles, signing out or leaving the page. Cover uploads use the private editorial bucket; image files are limited to JPEG, PNG, WebP and GIF, 10 MB maximum.
- `20261124000400_article_dashboard.sql` adds narrowly scoped author policies and an invoker-security `save_article` function to save article data and topic assignments in one database transaction. Media upload is a separate Storage operation: interrupted or failed saves can leave an unreferenced private object or media record; administrators should clean these up after checking references. Existing demo records remain flagged and cannot be published.
- Published image delivery remains unresolved: the bucket is private and the current public site is not connected to this database. Publishing changes database status; it does not yet produce a public-facing article or a public image URL.

## Dashboard verification and external work

- Ran `node staff/markdown.test.cjs`, `node staff/auth.test.cjs`, JavaScript syntax checks and `git diff --check`. The Markdown test verifies that HTML-like input becomes text, and that supported formatting renders.
- Added `supabase/tests/article_permissions.sql` for transactional author CRUD/denial and editor publish/archive/delete checks. It has **not been run**: no PostgreSQL, Supabase CLI, Docker or configured Supabase project is available here. Browser CRUD, image upload, session and live RLS tests likewise remain unverified. Apply migrations to a disposable Supabase project and execute that test as a trusted database administrator; extend it with anonymous/nonstaff, author cross-record and media-policy tests before launch.
- Configure the Supabase project, browser config, Auth and linked author profiles as described in `staff/README.md`. Verify bucket policies, failed-upload cleanup, multiple-device conflicts and responsive browser behavior before production. The editor currently uses last-write-wins updates; concurrent edits can overwrite one another.

## Public article pages

- Added `article.html?slug=<slug>` pages for published records, with category, headline, summary, author, publication and modification dates, cover image and caption/credit, Markdown body, reading time and related published articles. Markdown is rendered as DOM text and limited formatting, without HTML interpretation. Homepage and seven category pages now use published database content instead of sample story links. Empty and unavailable states are shown without presenting demo material as reporting.
- Added `article_slugs` and a trigger to reserve current and historical slugs. Old slugs for still-published articles resolve to the current slug using a browser redirect. Slugs remain reserved after deletion; slug history starts when this migration is applied. Draft and archived article data and their slug records remain hidden by RLS.
- Published cover images in the private editorial bucket use 60-second signed URLs issued under a policy tied to a published article. Signed URLs already issued can remain usable until their expiry after unpublishing. Draft media remains private. External demo media is not exposed as published content.
- Static hosting serves `article.html` regardless of the query string: an unknown or unpublished slug displays a not-found state but does **not** return HTTP 404, and historic-slug redirection is client-side rather than HTTP 301/308. Correct HTTP status codes, server redirects, server-rendered SEO and social previews require a hosting-specific server/edge route and remain outstanding. No hosting platform has been assumed.

## Public article configuration and verification

- Copy `public-config.example.js` to `public-config.js` and set the Supabase URL and publishable key; configure hosting to serve it. Apply all migrations, including `20261124000500_public_articles.sql`, before enabling public content. Never include a secret key. Review public read access, Storage policies and project API exposure before launch.
- `node tests/public-pages.test.cjs` checked that the homepage and seven categories use the published-content wiring without placeholder story links. `node tests/public-content.test.cjs` checked linked published records, old slug resolution and draft/archive/not-found behavior using a mocked database. Markdown safety, JavaScript syntax and `git diff --check` passed.
- A database test is provided at `supabase/tests/public_articles.sql` but could not be run: no PostgreSQL, Supabase CLI, Docker or configured project is available. Actual published stories, signed images, direct anonymous access, slug changes and responsive browser behavior have not been tested against a live project. Verify every real published link and the storage policy on a non-production project before release.

## Phase 1 public content integration

- Homepage lead, rail and latest stories, all seven category pages, and article/related-story pages use the same published-only Supabase source. Category filtering, chronological/title sorting, reset and incremental display remain available. Category fetches are paged to avoid silently truncating at the API row limit.
- Public listings use the actual `published_at` timestamp for sorting and relative time labels; labels refresh every minute. Reading time is calculated from the current article body. Missing or failed images show a visible fallback, and loading, empty and error messages remain in place.
- Legacy `category-stories.js` and category selector scripts are no longer loaded by public pages. They are retained until the database-backed replacement has passed a real integration check; the existing database migration also preserves their records as explicitly marked drafts.
- Tests passed: `node tests/public-content.test.cjs` (published filtering, slug lookup, calculated time; mock backend), `node tests/public-pages.test.cjs` (public page wiring), `node tests/category-engine.test.cjs` (filter/sort/load more/reset; mock data), `node staff/markdown.test.cjs`, `node staff/auth.test.cjs`, JavaScript syntax checks and `git diff --check`.
- Added `supabase/tests/phase1_integration.sql`, a rollback-only check for author draft creation, public draft denial, editor publication, category visibility and public slug resolution. It has not been executed: there is no configured Supabase project or local PostgreSQL/Supabase/Docker installation in this workspace. Actual article creation, publishing, public access, image storage and browser rendering remain unverified. Configure a disposable project and run the migrations and SQL/browser checks before considering Phase 1 complete or removing the sample source files.
- No commit was made because the required end-to-end integration check could not be run. HTTP 404 and server-side redirects remain outstanding hosting decisions as documented above. Phase 2 has not been started.

## Connecting the new Supabase and Vercel accounts

- The selected Vercel account for this project is different from the account previously visible to this session. Do not link or deploy FSBN to that account.
- `vercel.json` and `scripts/build.cjs` prepare a static deployment. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` as Vercel environment variables in the new project's appropriate environments. The build generates the public and staff browser configuration and deploys only site assets; it does not deploy migrations, environment files or admin secrets. Never use a Supabase secret/service-role key in either variable.
- After linking the intended Vercel project and verifying environment keys, configure Supabase Auth site/recovery URLs, disable public signup, apply versioned migrations to the intended Supabase project, provision staff securely, and execute the rollback-only integration and permission tests. Use an isolated project/environment for testing and confirm the target before running migrations.
- Verification: the build succeeded with placeholder public values; generated both browser configs and excluded the `supabase` directory. No real account was linked, migrated or deployed, and no real credentials were tested. Pending the new account connections and project selection, live Phase 1 integration remains unverified.
