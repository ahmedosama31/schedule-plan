DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS course_data;
DROP TABLE IF EXISTS stats_courses;

-- schedules: Stores user saved schedules (supports multiple per user)
CREATE TABLE schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  pin TEXT,
  schedule_name TEXT NOT NULL DEFAULT 'spring26',
  schedule_json TEXT NOT NULL, 
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(student_id, schedule_name)
);

-- course_data: Stores the raw course text blob
CREATE TABLE course_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  raw_text TEXT NOT NULL,
  parsed_json TEXT NOT NULL, 
  updated_at INTEGER DEFAULT (unixepoch())
);

-- stats_courses: Tracks course selection frequency
CREATE TABLE stats_courses (
  course_code TEXT PRIMARY KEY,
  selection_count INTEGER DEFAULT 0
);

-- Index for efficient schedule listing
CREATE INDEX IF NOT EXISTS idx_schedules_student_updated ON schedules(student_id, updated_at DESC);
