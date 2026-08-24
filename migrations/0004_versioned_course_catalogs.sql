-- Preserve existing course rows as Summer 2026 revisions, then make all future
-- imports append-only and semester-specific.
ALTER TABLE course_data ADD COLUMN semester_id TEXT NOT NULL DEFAULT 'summer-2026';
ALTER TABLE course_data ADD COLUMN semester_label TEXT NOT NULL DEFAULT 'Summer 2026';
ALTER TABLE course_data ADD COLUMN revision INTEGER NOT NULL DEFAULT 1;
ALTER TABLE course_data ADD COLUMN source_summary TEXT;
ALTER TABLE course_data ADD COLUMN change_note TEXT;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY semester_id ORDER BY id) AS revision_number
  FROM course_data
)
UPDATE course_data
SET revision = (SELECT revision_number FROM ranked WHERE ranked.id = course_data.id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_course_data_semester_revision_unique
  ON course_data(semester_id, revision);
CREATE INDEX IF NOT EXISTS idx_course_data_semester_revision
  ON course_data(semester_id, revision DESC);

CREATE TABLE IF NOT EXISTS semester_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  active_semester_id TEXT NOT NULL,
  updated_at INTEGER DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO semester_settings (id, active_semester_id)
VALUES (1, 'summer-2026');
