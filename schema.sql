DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS course_data;
DROP TABLE IF EXISTS stats_courses;

-- schedules: Stores user saved schedules
CREATE TABLE schedules (
  student_id TEXT PRIMARY KEY,
  pin TEXT,
  schedule_name TEXT,
  schedule_json TEXT NOT NULL, 
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
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
