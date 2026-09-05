# Updating semester course data

Course data is versioned in two places:

- `data/semesters/<semester-id>.json` is the source-controlled frontend fallback. Old semester files stay in the repository.
- D1's `course_data` table stores append-only revisions keyed by `semester_id` and `revision`. The active semester is a pointer in `semester_settings`; changing it does not delete any catalog.

The Fall 2026/27 import combines three complementary sources in priority order:

1. Portal TSV: authoritative course codes, rooms, and currently published rows.
2. Faculty PDF: detailed CCE/CCEE course codes and section groups.
3. Curated workbook: additional computer-engineering offerings; its missing course codes are resolved through the explicit, source-backed mapping in the importer.

Duplicate meetings are removed. When lower-priority sources disagree only about a meeting type, the higher-priority source wins and the conflict is counted in the metadata file.

## Build a catalog from attachments

Use the bundled document runtime described by Codex for PDF and workbook parsing:

```powershell
python scripts/build_semester_catalog.py `
  --portal <portal-export.tsv> `
  --pdf <faculty-schedule.pdf> `
  --workbook <curated-schedule.xlsx> `
  --output data/semesters/<semester-id>.json `
  --metadata data/semesters/<semester-id>.meta.json `
  --semester-id <semester-id> `
  --semester-label "<Semester label>"
```

The command fails if the workbook contains an unmapped course title. Verify new codes against an authoritative university catalog or schedule, add the mapping to `WORKBOOK_CODE_BY_NAME`, then rerun.

When the portal export must be treated as the sole authority, omit `--pdf` and
`--workbook`. The generated catalog and metadata will then contain only portal
rows and portal provenance:

```powershell
python scripts/build_semester_catalog.py `
  --portal <portal-export.tsv> `
  --output data/semesters/<semester-id>.json `
  --metadata data/semesters/<semester-id>.meta.json `
  --semester-id <semester-id> `
  --semester-label "<Semester label>"
```

## Validate and publish

```powershell
npm run validate:data
node scripts/generate_catalog_migration.mjs `
  data/semesters/<semester-id>.json `
  data/semesters/<semester-id>.meta.json `
  migrations/<next>_<semester-id>.sql `
  <revision> `
  "<concise change note>"
npm run build
```

Apply migrations in numeric order before deploying the Pages build. The admin page can also append revisions from normalized JSON or portal TSV. It requires a semester ID, display label, and optional change note. It never prunes previous revisions.

Configure the encrypted `ADMIN_PASSWORD` secret for the Pages project before using catalog imports. For local Pages development, put the same value in an ignored `.dev.vars` file; the API deliberately refuses catalog writes when the secret is missing.

## History behavior

- A new semester adds a new catalog; it does not overwrite another semester.
- Re-importing the same semester creates revision `v2`, `v3`, and so on.
- `GET /api/courses?semester_id=<id>` returns the latest revision for that semester.
- `GET /api/semesters?include_revisions=true` returns the semester list and revision audit trail.
- Git preserves reviewed changes to static catalogs and provenance metadata.
