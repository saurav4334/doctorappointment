# Supabase → MySQL Data Migration (Phase 5)

This project imports your existing Supabase data into MySQL using a safe, **idempotent,
file-based** pipeline. No Supabase credentials are needed by the app — you export your
tables to JSON/CSV, drop the files in a folder, and run one command.

---

## 1. Safe import strategy

- **File-based, not credential-based.** You export from Supabase; the importer reads files. Nothing connects to Supabase from Laravel.
- **Idempotent.** Every source row's Supabase UUID is recorded in an `import_maps` table (`source_table` + `source_id` → new MySQL id). Re-running the import **updates** existing records instead of duplicating them. Rows are matched first by `import_maps`, then by a natural key (`slug` for doctors/hospitals/departments).
- **Transactional.** The whole run is wrapped in a single DB transaction. Any error rolls everything back — you never get a half-imported database.
- **Dry-run first.** `--dry-run` performs the full import inside the transaction, prints created/updated/skipped counts, then rolls back. Always run this before a real import.
- **Dependency order.** Tables import in order (departments → hospitals → doctors → schedules → testimonials → hero slides → ads → appointments) so foreign keys (UUID → bigint) resolve correctly.
- **Non-destructive by default.** The importer never deletes. If you want a clean slate first, see *Clean re-import* below.

---

## 2. Required export format from Supabase

**Recommended: JSON** (preserves arrays like `specializations`). In the Supabase **SQL Editor**, run one query per table and download the result as JSON, or use:

```sql
-- Produces a JSON array you can save as doctors.json
select coalesce(json_agg(t), '[]') from (
  select * from public.doctors
) t;
```

Repeat for each table, saving as the filenames in section 4. **CSV also works**
(Table Editor → Export) — the importer parses Postgres array literals
(`{Cardiology,"Internal Medicine"}`), JSON arrays, and comma strings. JSON is preferred
because CSV flattens arrays and nulls.

Supported file types: `.json` (array, or `{ "data": [...] }`), `.ndjson`/`.jsonl`, `.csv`.

Put the files here (default): **`storage/app/imports/`**
Canonical examples to copy field names from: **`database/import-samples/`**

---

## 3. Import command structure

```bash
# 1) Preview (no writes)
php artisan import:supabase --dry-run

# 2) Real import (keeps Supabase image URLs as-is)
php artisan import:supabase

# 3) Real import AND download images into local storage
php artisan import:supabase --download-images --storage-base="https://<project>.supabase.co/storage/v1/object/public/<bucket>"

# Import only specific tables
php artisan import:supabase --only=departments,hospitals,doctors

# Custom export folder
php artisan import:supabase --path=storage/app/imports

# 4) Verify afterwards
php artisan import:verify
```

| Option | Purpose |
|---|---|
| `--path=` | Folder with export files (default `storage/app/imports`) |
| `--only=` | Comma-separated table list (default: all) |
| `--dry-run` | Import inside a transaction then roll back; report only |
| `--download-images` | Fetch images into `storage/app/public/...` instead of keeping remote URLs |
| `--storage-base=` | Public base URL for Supabase Storage, to resolve bucket-relative image paths |

Architecture (all under `app/Services/Import/` + `app/Console/Commands/`):
`SourceReader` (parse files), `ImportMapper` (UUID→id), `ImageMigrator` (media),
`EntityDefinition` + `EntityImporter` (generic upsert engine), `ImportSupabase` (the
table mappings), `VerifyImport`. **Adding a new table = add one `EntityDefinition`.**

---

## 4. Table mapping (Supabase → MySQL)

| Export file | Supabase table | MySQL table | Notable field mapping |
|---|---|---|---|
| `departments.json` | `departments` | `departments` | `name, slug, icon, description, sort_order, is_active` |
| `hospitals.json` | `hospitals` | `hospitals` | `image_url`→`image`; `status='approved'`→`is_active`; `phone/contact`→`contact_number` |
| `doctors.json` | `doctors` | `doctors` | `photo_url`→`photo`; `specializations[]`/`qualifications[]` kept as JSON; `hospital_name` carried over |
| `doctor_hospitals.json` | `doctor_hospitals` (pivot) | (enriches `doctors`) | primary row sets `doctors.hospital_id` + `department_id` |
| `doctor_schedules.json` | `doctor_schedules` | `doctor_schedules` | `doctor_id`/`hospital_id` UUIDs remapped; `start_time`/`end_time`→`H:i` |
| `testimonials.json` | `cms_testimonials` | `testimonials` | `name`→`patient_name`; `content`→`review`; `image_url`→`image` |
| `hero_slides.json` | `cms_hero_slides` | `hero_slides` | `cta_text`→`button_text`; `cta_link`→`button_url`; `image_url`→`image` |
| `advertisements.json` | `advertisements` | `advertisements` | `image_url`→`image`; `start_date`/`end_date` parsed to dates |
| `appointments.json` | `appointments` | `appointments` | `doctor_id` remapped; `patient_id` set null (accounts not migrated); patient name/phone/email carried if present |

Tables intentionally **not** migrated by default: `profiles`/`auth.users` (recreate admins
via Breeze + `RoleSeeder`), `user_roles`, `menu_items`, `site_settings`,
`home_service_requests`, `ambulance_requests`, `reviews`. Add an `EntityDefinition` if you need any of these.

---

## 5. Image / file migration plan

Supabase Storage URLs are public, and the Blade views already render `http(s)` image
URLs directly. So you have two options:

1. **Keep remote URLs (default, fastest).** Run without `--download-images`. The
   Supabase public URL is stored as-is and served from Supabase. Good for a quick cutover.
2. **Download into local storage (recommended for full independence / cPanel).** Run with
   `--download-images`. Each image is fetched into `storage/app/public/{doctors,hospitals,ads,hero-slides,testimonials}` and the **relative path** is stored. Requires `php artisan storage:link` (already done).
   - If your export stores **bucket-relative paths** (not full URLs), also pass
     `--storage-base=https://<project>.supabase.co/storage/v1/object/public/<bucket>` so they can be resolved and downloaded.

---

## 6. Fallback handling

- **Missing image / failed download** → the importer keeps the original remote URL (or null) so the page still renders; every failure is listed at the end of the run.
- **Missing image entirely** → stored as `null`; the front-end shows its built-in placeholder (doctor avatar, hospital stock image, generated initials avatar for testimonials).
- **Mismatched / missing fields** → each field uses safe defaults: missing `slug` is generated from the name; missing `rating`/`fee` → 0; missing `is_active` → true; invalid `status`/`payment_status` → `pending`/`unpaid`; missing appointment time → `09:00`.
- **Unresolvable foreign keys** (e.g. a schedule whose doctor wasn't exported) → that row is **skipped** (counted under `skipped`), never inserted with a broken reference.
- **Alternate column names** are accepted (e.g. `name`↔`full_name`, `image`↔`image_url`, `phone`↔`contact_number`, `content`↔`review`).

---

## 7. Verification checklist (after import)

Run `php artisan import:verify`, then confirm:

- [ ] Row counts roughly match your Supabase table sizes (allow for skipped junk rows).
- [ ] "Schedules with a valid doctor" and "Appointments with a valid doctor" show no orphan gap (`X / X`).
- [ ] "Doctors with a photo" is close to expected; review the image-failure list printed by the import.
- [ ] No integrity warnings (orphans, missing slugs).
- [ ] Visit `/` — hero slides, Top Rated (featured) doctors, departments, hospitals, testimonials, and ad banners render.
- [ ] Visit `/doctors` — search, department filter, and pagination work; cards show photo/hospital/fee.
- [ ] Open a doctor profile — bio, qualifications, specializations, and weekly schedule appear.
- [ ] Log into `/admin` — each module lists the imported rows; spot-check an edit page.
- [ ] If you used `--download-images`, confirm images load from `/storage/...` (not Supabase) and survive after Supabase is decommissioned.
- [ ] Re-run `php artisan import:supabase --dry-run` — counts should now be mostly **updated**, proving idempotency (no duplicates on re-import).

---

## Clean re-import (optional)

To replace demo/seed data with real data from scratch:

```bash
php artisan migrate:fresh         # drops & recreates all tables (DESTROYS data)
php artisan db:seed --class=RoleSeeder   # roles only (skip DemoContentSeeder)
php artisan import:supabase --download-images
php artisan import:verify
```
