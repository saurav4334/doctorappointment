# Production Go-Live Checklist

Run through this before and right after pointing the domain at the app. See
`docs/CPANEL_DEPLOYMENT.md` for the how-to behind each item.

## Environment (`.env`)
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`  ← never leave `true` in production (leaks stack traces & config)
- [ ] `APP_URL=https://yourdomain.com` (correct scheme + domain)
- [ ] `APP_KEY` is set (`php artisan key:generate`)
- [ ] Real DB credentials; DB user has privileges
- [ ] `SESSION_DRIVER=database`, `CACHE_STORE=database`, `QUEUE_CONNECTION=database`
- [ ] Mail (SMTP) configured so password resets & notifications send
- [ ] Ran `php artisan config:cache` **after** finalizing `.env`

## HTTPS
- [ ] SSL certificate installed (cPanel → **SSL/TLS Status** → AutoSSL/Let's Encrypt)
- [ ] Force HTTPS — add to `public/.htaccess` (top of the rewrite block):
      ```apache
      RewriteCond %{HTTPS} !=on
      RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
      ```
- [ ] `APP_URL` uses `https://`; in `app/Providers/AppServiceProvider::boot()` you may add
      `if ($this->app->environment('production')) { \URL::forceScheme('https'); }`
- [ ] Mixed-content check: no `http://` asset URLs on any page

## Security
- [ ] App lives **outside** `public_html`; only `public/` is web-served
- [ ] `.env`, `storage/`, `vendor/`, `.git/` are NOT web-accessible (try visiting `/.env` → should 403/404)
- [ ] Admin area protected (verified: guest → login, non-admin → 403) — covered by automated tests
- [ ] File upload validation active (images only, ≤5 MB) — enforced by Form Requests
- [ ] Redirect URLs on ads are sanitized (http/https or internal only) — enforced by `AdBanner`
- [ ] Strong DB and admin passwords; default demo admin removed (below)

## Admin account
- [ ] Removed/!disabled the demo seeder account `admin@doctorappointment.test`
- [ ] Created a real super_admin (see deployment guide step 6)
- [ ] **Password reset works** — request a reset at `/forgot-password`, confirm the email arrives and the link works
- [ ] To reset a password manually:
      ```bash
      php artisan tinker --execute="App\Models\User::where('email','you@domain.com')->update(['password'=>bcrypt('NEW-strong-pass')]);"
      ```

## Data & media
- [ ] Real data imported & verified (`php artisan import:verify`) — see `docs/DATA_MIGRATION.md`
- [ ] `php artisan storage:link` done; images load from `/storage/...`
- [ ] **Image upload verification:** log into `/admin`, upload a doctor photo and an ad banner,
      confirm the preview shows, it saves, and it renders on the public site
- [ ] If migrated with `--download-images`, confirm media is local (not pointing at Supabase)

## Performance
- [ ] `composer install --no-dev --optimize-autoloader`
- [ ] `php artisan optimize` (config + route + view caches built)
- [ ] `public/build/` assets uploaded (minified CSS/JS)
- [ ] Opcache enabled in cPanel PHP settings (recommended)

## Backups
- [ ] **Database:** schedule a dump (cPanel → **Cron Jobs**), e.g. daily:
      ```bash
      mysqldump -u USER_dbuser -p'PASSWORD' USER_doctorapp | gzip > ~/backups/db-$(date +\%F).sql.gz
      ```
- [ ] **Files:** include `storage/app/public` (uploaded media) and `.env` in backups
- [ ] Verify a restore at least once; keep off-server copies (cPanel Backup / download)
- [ ] Retain the Supabase export files until the MySQL site is confirmed stable

## Post-launch smoke test
- [ ] `/` loads: hero, top-rated doctors, departments, hospitals, testimonials, ad banners
- [ ] `/doctors` search + department filter + pagination work
- [ ] A doctor profile loads (bio, schedule)
- [ ] `/admin` login works; create/edit/delete a record in one module
- [ ] 404 page works for a bad URL; no debug stack traces visible anywhere
- [ ] `storage/logs/laravel.log` has no recurring errors after browsing

## Automated tests (run in staging/local, not on shared host)
- [ ] `php artisan test` is green (44 tests: public pages, admin access, CRUD, import)
