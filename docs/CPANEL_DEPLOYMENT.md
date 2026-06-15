# cPanel Shared Hosting Deployment Guide

This guide deploys the Doctor Appointment platform (Laravel 12 + MySQL) to a standard
cPanel shared host. No SSH-only tooling is required, but SSH (Terminal in cPanel) makes
it much easier — both paths are covered.

**Host requirements:** PHP **8.2+** (8.3 recommended), MySQL 8 / MariaDB 10.4+, and the
PHP extensions `bcmath, ctype, curl, fileinfo, gd, json, mbstring, openssl, pdo_mysql,
tokenizer, xml`. Set the PHP version in cPanel → **MultiPHP Manager**, and enable
extensions in **Select PHP Version → Extensions**.

---

## 1. Get the code onto the server

### Option A — cPanel Git Version Control (recommended)
1. cPanel → **Git Version Control** → **Create**.
2. Clone URL: your repo; Repository Path: `/home/USER/doctorappointment` (NOT inside `public_html`).
3. To update later: open the repo in Git Version Control → **Update from Remote** → **Deploy HEAD Commit** (configure `.cpanel.yml`, see step 8), or via SSH:
   ```bash
   cd ~/doctorappointment && git pull origin main
   ```

### Option B — Upload a ZIP
Build locally, then upload everything **except** `node_modules/` and `vendor/` (you'll
install those on the server, or include `vendor/` if the host has no Composer).

> Keep the Laravel app **outside** `public_html`. Only the app's `public/` folder should be web-served (step 7).

---

## 2. Create the MySQL database

cPanel → **MySQL® Databases**:
1. Create a database, e.g. `USER_doctorapp`.
2. Create a DB user with a strong password.
3. **Add the user to the database** with **ALL PRIVILEGES**.
4. Note the host (usually `localhost`), DB name, user, and password.

---

## 3. Configure `.env`

Copy and edit:
```bash
cd ~/doctorappointment
cp .env.example .env
```
Set at minimum:
```env
APP_NAME="Doctor Appointment"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=USER_doctorapp
DB_USERNAME=USER_dbuser
DB_PASSWORD=your-strong-password

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=public

MAIL_MAILER=smtp        # configure your host's SMTP for password resets/notifications
```
Generate the key (step 5 runs this too):
```bash
php artisan key:generate
```

---

## 4. Install dependencies

**Composer** (via SSH; many hosts have `composer` or `composer.phar`):
```bash
cd ~/doctorappointment
composer install --no-dev --optimize-autoloader
```
If the host has no Composer/SSH: run `composer install --no-dev --optimize-autoloader`
locally and upload the resulting `vendor/` folder.

---

## 5. Build front-end assets (npm)

Vite assets are pre-built into `public/build/`. **Build locally, commit/upload `public/build/`** — shared hosts usually lack Node:
```bash
# on your machine
npm install
npm run build
# commit public/build or upload it to the server
```
The app references assets via `@vite` + the committed `manifest.json`, so **Node is not
needed on the server**. (If your host *does* have Node, you can `npm ci && npm run build` there instead.)

---

## 6. App initialization (migrate, seed, storage link)

```bash
cd ~/doctorappointment
php artisan key:generate          # if not already set
php artisan migrate --force
php artisan db:seed --class=RoleSeeder        # roles only (production)
# (optional first-run demo content) php artisan db:seed --force
php artisan storage:link
```
`storage:link` creates `public/storage → storage/app/public`. If symlinks are disabled on
your host, create the link via SSH, or as a fallback copy uploaded media under
`public/storage/...` manually (see Troubleshooting).

Create your real admin account (instead of the demo seeder):
```bash
php artisan tinker --execute="\$u=App\Models\User::create(['name'=>'Admin','email'=>'you@domain.com','password'=>bcrypt('CHANGE-ME-strong'),'email_verified_at'=>now()]); \$u->assignRole('super_admin'); echo 'done';"
```

---

## 7. Point the domain's docroot at `public/`

Laravel must serve only the `public/` directory. Two common approaches:

### A) Set the Document Root (best)
cPanel → **Domains** (or Addon/Subdomain) → set **Document Root** to
`/home/USER/doctorappointment/public`. Done.

### B) When you can't change the docroot (app must live in `public_html`)
1. Put the app in `~/doctorappointment` and copy the contents of its `public/` into `public_html/`.
2. Edit `public_html/index.php` paths to point at the app folder:
   ```php
   require __DIR__.'/../doctorappointment/vendor/autoload.php';
   $app = require_once __DIR__.'/../doctorappointment/bootstrap/app.php';
   ```
3. Ensure `public_html/.htaccess` (shipped in `public/.htaccess`) is present for pretty URLs.

> Never expose `.env`, `storage/`, or `vendor/` to the web. Keeping the app outside `public_html` (option A) avoids this entirely.

---

## 8. (Optional) Auto-deploy with `.cpanel.yml`

Place at repo root so "Deploy HEAD Commit" copies files into place:
```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/USER/doctorappointment
    - /bin/cp -R * $DEPLOYPATH
    - cd $DEPLOYPATH && /usr/local/bin/php artisan migrate --force
    - cd $DEPLOYPATH && /usr/local/bin/php artisan optimize
```

---

## 9. Permissions

```bash
cd ~/doctorappointment
find storage bootstrap/cache -type d -exec chmod 775 {} \;
find storage bootstrap/cache -type f -exec chmod 664 {} \;
```
`storage/` and `bootstrap/cache/` must be writable by the web user. Files `644`, dirs
`755`/`775` elsewhere. Never `chmod 777`.

---

## 10. Cache optimization (run after every deploy)

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
# convenience: php artisan optimize
```
To clear when something misbehaves:
```bash
php artisan optimize:clear
```
> Re-run `config:cache` whenever you change `.env`, or the old values stay cached.

---

## 11. Deploy/update flow (summary)

```bash
cd ~/doctorappointment
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
php artisan optimize
```
(Upload a fresh `public/build/` if front-end assets changed.)

---

## Scheduled tasks & notifications

The notification system works **without** a queue worker by default
(`notifications.queue=false` → delivered inline during the request). Channels are
currently **mock** (logged to `notification_logs`, no external send) until you plug in a
real provider — see the channel classes in `app/Notifications/Channels/`.

- **Appointment reminders** (cron). In cPanel → **Cron Jobs**, add a daily job:
  ```bash
  cd /home/USER/doctorappointment && /usr/local/bin/php artisan appointments:send-reminders >> storage/logs/cron.log 2>&1
  ```
- **Optional queue** (only if you set `NOTIFICATIONS_QUEUE=true`): run a per-minute cron to
  drain the database queue without a long-running worker:
  ```bash
  cd /home/USER/doctorappointment && /usr/local/bin/php artisan queue:work --stop-when-empty >> storage/logs/queue.log 2>&1
  ```

## Troubleshooting common 500 errors

| Symptom | Cause | Fix |
|---|---|---|
| Blank white page / HTTP 500 | App error with debug off | `tail storage/logs/laravel.log`; temporarily set `APP_DEBUG=true`, reload, then turn it **back off** |
| `No application encryption key` | `APP_KEY` missing | `php artisan key:generate` then `php artisan config:cache` |
| 500 right after deploy | Stale cached config/routes | `php artisan optimize:clear` |
| `SQLSTATE … Access denied` / `Unknown database` | Wrong DB creds | Fix `.env`, ensure user is **added to** the DB with privileges, `config:cache` |
| `The stream or file storage/logs… could not be opened` | Permissions | `chmod -R 775 storage bootstrap/cache` |
| Images 404 under `/storage/...` | No symlink | `php artisan storage:link` (or copy files into `public/storage/`) |
| CSS/JS 404 or unstyled | Missing build | Upload `public/build/` (run `npm run build` locally) |
| `Class "..." not found` | Autoload not optimized | `composer install --optimize-autoloader` / `composer dump-autoload` |
| 404 on every route except `/` | `.htaccess` / mod_rewrite | Ensure `public/.htaccess` exists and AllowOverride is on |
| `Vite manifest not found` | Assets not built/uploaded | Build locally and upload `public/build/manifest.json` + assets |

See also `docs/DATA_MIGRATION.md` to import your real data, and
`docs/PRODUCTION_CHECKLIST.md` before going live.
