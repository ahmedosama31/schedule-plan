DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS course_data;
DROP TABLE IF EXISTS semester_settings;
DROP TABLE IF EXISTS stats_courses;
DROP TABLE IF EXISTS schedule_activity_logs;

-- schedules: Stores user saved schedules (supports multiple per user)
CREATE TABLE schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  pin TEXT,
  schedule_name TEXT NOT NULL DEFAULT 'fall26-27',
  schedule_json TEXT NOT NULL, 
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(student_id, schedule_name)
);

-- course_data: Append-only, versioned course catalogs by semester.
CREATE TABLE course_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  semester_id TEXT NOT NULL,
  semester_label TEXT NOT NULL,
  revision INTEGER NOT NULL,
  raw_text TEXT NOT NULL,
  parsed_json TEXT NOT NULL,
  source_summary TEXT,
  change_note TEXT,
  updated_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(semester_id, revision)
);

CREATE TABLE semester_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  active_semester_id TEXT NOT NULL,
  updated_at INTEGER DEFAULT (unixepoch())
);

INSERT INTO semester_settings (id, active_semester_id) VALUES (1, 'fall-2026-27');

-- stats_courses: Tracks course selection frequency
CREATE TABLE stats_courses (
  course_code TEXT PRIMARY KEY,
  selection_count INTEGER DEFAULT 0
);

-- schedule_activity_logs: Tracks save/delete attempts for admin auditing
CREATE TABLE schedule_activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  schedule_name TEXT NOT NULL DEFAULT 'fall26-27',
  action TEXT NOT NULL CHECK (action IN ('autosave', 'manual_save', 'delete')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  course_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Index for efficient schedule listing
CREATE INDEX IF NOT EXISTS idx_schedules_student_updated ON schedules(student_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_schedule_activity_created ON schedule_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_schedule_activity_student ON schedule_activity_logs(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_schedule_activity_name ON schedule_activity_logs(schedule_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_data_semester_revision ON course_data(semester_id, revision DESC);
