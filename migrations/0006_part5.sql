-- Migration 0006 Part 5: Create information_access_logs table
CREATE TABLE IF NOT EXISTS information_access_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  accessed_by_user_id INTEGER NOT NULL,
  accessed_member_id INTEGER NOT NULL,
  accessed_field TEXT NOT NULL,
  access_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  accessor_ip TEXT,
  FOREIGN KEY (accessed_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (accessed_member_id) REFERENCES members(id) ON DELETE CASCADE
);

