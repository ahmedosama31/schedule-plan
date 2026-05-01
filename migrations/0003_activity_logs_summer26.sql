-- Migration: Add schedule activity logs and switch new default schedules to summer26

CREATE TABLE IF NOT EXISTS schedule_activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  schedule_name TEXT NOT NULL DEFAULT 'summer26',
  action TEXT NOT NULL CHECK (action IN ('autosave', 'manual_save', 'delete')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  course_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_schedule_activity_created ON schedule_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_schedule_activity_student ON schedule_activity_logs(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_schedule_activity_name ON schedule_activity_logs(schedule_name, created_at DESC);
