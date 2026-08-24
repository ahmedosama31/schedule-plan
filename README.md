# Fall 2026/27 Schedule Planner

A student-first schedule planner built because the university portal lists courses but does not let students plan or compare full schedules. This site fixes that with search, conflict checks, optimization, saving, and sharing.

## The Problem
Our university website does not let students assemble a workable schedule before registration opens. You cannot see conflicts, compare options, or optimize for fewer days.

## The Solution
This app lets students build schedules visually, then optimize them to thier preferences and save them.

## Key Features
- Fast course search and add with live suggestions
- Drag-and-drop weekly grid with overlap detection
- Conflict detection with alternative suggestions
- Optimization engine that minimizes days and gaps and respects preferences
- Preferences for start and end times, avoided days, and single-class days
- Lock sections so optimization keeps chosen times
- Autosave plus named schedule saving, loading, and deletion per student ID
- Shareable schedule links encoded in the URL
- Mobile-friendly UI with course and schedule tabs and quick rescheduling
- Admin dashboard: stats, schedule viewer, data import, and student schedule comparison

## How It Works
- Frontend: React + Vite + Tailwind with dnd-kit for drag and drop
- Backend: Cloudflare Pages Functions with a D1 (SQLite) database
- Data flow: course catalogs are append-only and versioned by semester in D1; the UI falls back to source-controlled snapshots in `data/semesters/` if the API is unavailable

## Tech Stack
- React 19, TypeScript, Vite
- Tailwind CSS, lucide-react
- dnd-kit
- Cloudflare Pages Functions, D1

## Local Development
1. `npm install`
2. `npm run dev`

Note: `GET /api/courses` falls back to `data.ts` when the API is unavailable. Saving schedules and admin features require the API.

## Semester Data Updates

New catalog imports do not delete old semesters. Each D1 update appends a numbered revision, and prior static catalogs remain under `data/semesters/`. The admin data page records the semester ID, label, activation choice, and change note and shows the revision history.

For attachment-based imports (portal text, PDF, and workbook), follow `docs/semester-updates.md`. `AGENTS.md` gives coding agents the same repeatable workflow and explicitly forbids inventing missing course codes.

## Full Stack Setup (Cloudflare Pages + D1)
1. Create a D1 database
   `npx wrangler d1 create schedule-db`
2. Apply schema
   `npx wrangler d1 execute schedule-db --file=./schema.sql`
3. Build the frontend
   `npm run build`
4. Run locally with Pages Functions
   `npx wrangler pages dev ./dist`
5. Deploy
   `npx wrangler pages deploy ./dist`

## Admin Access

Admin endpoints read the encrypted `ADMIN_PASSWORD` Pages secret. Configure it in the Cloudflare dashboard for production and in an ignored `.dev.vars` file for local Pages development.

## Project Structure
- `pages/` user and admin pages
- `components/` UI building blocks
- `functions/api/` Cloudflare Pages Functions
- `migrations/` D1 migrations
- `data/semesters/` versioned static semester catalogs and provenance metadata
- `scripts/` repeatable catalog import, archive, migration, and validation tools
- `schema.sql` D1 schema
- `optimizer.ts` schedule optimization engine

## Credits
Developed by Ahmed Osama.
