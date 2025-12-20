-- Migration: Add index for efficient schedule listing
CREATE INDEX idx_schedules_student_updated ON schedules(student_id, updated_at DESC);
