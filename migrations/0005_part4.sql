-- Migration 0005 Part 4: Restore data from backup
INSERT INTO attendance (id, member_id, attendance_date, service_type, status, note, recorded_by, created_at)
SELECT id, member_id, attendance_date, service_type, status, note, recorded_by, created_at
FROM attendance_backup;

