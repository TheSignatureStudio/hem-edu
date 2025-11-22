#!/bin/bash
# 자동 마이그레이션 적용 스크립트

set -e

DB_NAME="hem-edu-db"
echo "🚀 마이그레이션 자동 적용 시작: $DB_NAME"
echo ""

# Migration 0005: attendance 테이블 수정
echo "📝 Migration 0005 적용 중..."
npx wrangler d1 execute "$DB_NAME" --remote --command "CREATE TABLE IF NOT EXISTS attendance_backup AS SELECT * FROM attendance" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "DROP TABLE IF EXISTS attendance" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "CREATE TABLE attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL, attendance_date DATE NOT NULL, service_type TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('출석', '결석', '기타')), note TEXT, recorded_by INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE, FOREIGN KEY (recorded_by) REFERENCES users(id), UNIQUE(member_id, attendance_date, service_type))" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "INSERT INTO attendance (id, member_id, attendance_date, service_type, status, note, recorded_by, created_at) SELECT id, member_id, attendance_date, service_type, status, note, recorded_by, created_at FROM attendance_backup" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "DROP TABLE IF EXISTS attendance_backup" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id)" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date)" 2>&1 | grep -v "⛅️\|────────────────" || true
echo "✅ Migration 0005 완료"
echo ""

# Migration 0006: 부서 구조 재정의
echo "📝 Migration 0006 적용 중..."
npx wrangler d1 execute "$DB_NAME" --remote --command "ALTER TABLE users ADD COLUMN department_id INTEGER" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "ALTER TABLE users ADD COLUMN is_super_admin INTEGER DEFAULT 0" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "ALTER TABLE classes ADD COLUMN department_id INTEGER" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "CREATE INDEX IF NOT EXISTS idx_classes_department ON classes(department_id)" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "ALTER TABLE members ADD COLUMN department_id INTEGER" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "CREATE INDEX IF NOT EXISTS idx_members_department ON members(department_id)" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "ALTER TABLE service_types ADD COLUMN department_id INTEGER" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "CREATE INDEX IF NOT EXISTS idx_service_types_department ON service_types(department_id)" 2>&1 | grep -v "⛅️\|────────────────" || true

# trainings 테이블
npx wrangler d1 execute "$DB_NAME" --remote --command "CREATE TABLE IF NOT EXISTS trainings (id INTEGER PRIMARY KEY AUTOINCREMENT, department_id INTEGER NOT NULL, name TEXT NOT NULL, description TEXT, start_date DATE, end_date DATE, location TEXT, instructor TEXT, is_active INTEGER DEFAULT 1, created_by INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (department_id) REFERENCES departments(id), FOREIGN KEY (created_by) REFERENCES users(id))" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "CREATE INDEX IF NOT EXISTS idx_trainings_department ON trainings(department_id)" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "CREATE INDEX IF NOT EXISTS idx_trainings_dates ON trainings(start_date, end_date)" 2>&1 | grep -v "⛅️\|────────────────" || true

# information_access_logs 테이블
npx wrangler d1 execute "$DB_NAME" --remote --command "CREATE TABLE IF NOT EXISTS information_access_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, accessed_by_user_id INTEGER NOT NULL, accessed_member_id INTEGER NOT NULL, accessed_field TEXT NOT NULL, access_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, accessor_ip TEXT, FOREIGN KEY (accessed_by_user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (accessed_member_id) REFERENCES members(id) ON DELETE CASCADE)" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "CREATE INDEX IF NOT EXISTS idx_access_logs_user ON information_access_logs(accessed_by_user_id)" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "CREATE INDEX IF NOT EXISTS idx_access_logs_member ON information_access_logs(accessed_member_id)" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "CREATE INDEX IF NOT EXISTS idx_access_logs_date ON information_access_logs(access_timestamp)" 2>&1 | grep -v "⛅️\|────────────────" || true

# 부서 데이터
npx wrangler d1 execute "$DB_NAME" --remote --command "INSERT OR IGNORE INTO departments (name, display_order) VALUES ('유초등부', 1)" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "INSERT OR IGNORE INTO departments (name, display_order) VALUES ('젊은이부', 2)" 2>&1 | grep -v "⛅️\|────────────────" || true

# 예배 구분
npx wrangler d1 execute "$DB_NAME" --remote --command "INSERT OR IGNORE INTO service_types (name, display_order, department_id) SELECT '유초등부 예배', 1, id FROM departments WHERE name = '유초등부' LIMIT 1" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "INSERT OR IGNORE INTO service_types (name, display_order, department_id) SELECT '젊은이 예배', 2, id FROM departments WHERE name = '젊은이부' LIMIT 1" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "INSERT OR IGNORE INTO service_types (name, display_order, department_id) VALUES ('통합예배', 3, NULL)" 2>&1 | grep -v "⛅️\|────────────────" || true
echo "✅ Migration 0006 완료"
echo ""

# Migration 0007: 부모 연락처 필드
echo "📝 Migration 0007 적용 중..."
npx wrangler d1 execute "$DB_NAME" --remote --command "ALTER TABLE members ADD COLUMN parent_phone TEXT" 2>&1 | grep -v "⛅️\|────────────────" || true
npx wrangler d1 execute "$DB_NAME" --remote --command "ALTER TABLE members ADD COLUMN parent_name TEXT" 2>&1 | grep -v "⛅️\|────────────────" || true
echo "✅ Migration 0007 완료"
echo ""

echo "🎉 모든 마이그레이션이 완료되었습니다!"
echo ""
echo "✅ 확인:"
npx wrangler d1 execute "$DB_NAME" --remote --command "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('trainings', 'information_access_logs')" 2>&1 | grep -v "⛅️\|────────────────" || true

