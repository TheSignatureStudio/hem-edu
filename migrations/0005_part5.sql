-- Migration 0005 Part 5: Drop backup table and recreate indexes
DROP TABLE IF EXISTS attendance_backup;
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);

