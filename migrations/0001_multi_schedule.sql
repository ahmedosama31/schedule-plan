-- Migration: Add multi-schedule support
-- This migration adds an id column and changes the unique constraint

-- Step 1: Create new table with updated schema
CREATE TABLE schedules_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  pin TEXT,
  schedule_name TEXT NOT NULL DEFAULT 'spring26',
  schedule_json TEXT NOT NULL, 
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(student_id, schedule_name)
);

-- Step 2: Copy existing data (set schedule_name to spring26 for existing records)
INSERT INTO schedules_new (student_id, pin, schedule_name, schedule_json, created_at, updated_at)
SELECT student_id, pin, COALESCE(schedule_name, 'spring26'), schedule_json, created_at, updated_at
FROM schedules;

-- Step 3: Drop old table and rename new one
DROP TABLE schedules;
ALTER TABLE schedules_new RENAME TO schedules;
