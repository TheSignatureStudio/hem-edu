-- Migration 0006 Part 6: Create information_access_logs indexes
CREATE INDEX IF NOT EXISTS idx_access_logs_user ON information_access_logs(accessed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_member ON information_access_logs(accessed_member_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_date ON information_access_logs(access_timestamp);

