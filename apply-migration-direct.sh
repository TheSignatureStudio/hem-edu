#!/bin/bash
DB_NAME="hem-edu-db"

echo "🚀 마이그레이션 직접 적용 중..."

# 각 SQL을 파일로 만들어서 실행
echo "CREATE TABLE IF NOT EXISTS trainings (id INTEGER PRIMARY KEY AUTOINCREMENT, department_id INTEGER NOT NULL, name TEXT NOT NULL, description TEXT, start_date DATE, end_date DATE, location TEXT, instructor TEXT, is_active INTEGER DEFAULT 1, created_by INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (department_id) REFERENCES departments(id), FOREIGN KEY (created_by) REFERENCES users(id));" > /tmp/trainings.sql

npx wrangler d1 execute "$DB_NAME" --remote --file=/tmp/trainings.sql 2>&1

echo "CREATE TABLE IF NOT EXISTS information_access_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, accessed_by_user_id INTEGER NOT NULL, accessed_member_id INTEGER NOT NULL, accessed_field TEXT NOT NULL, access_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, accessor_ip TEXT, FOREIGN KEY (accessed_by_user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (accessed_member_id) REFERENCES members(id) ON DELETE CASCADE);" > /tmp/logs.sql

npx wrangler d1 execute "$DB_NAME" --remote --file=/tmp/logs.sql 2>&1

echo "ALTER TABLE users ADD COLUMN department_id INTEGER;" > /tmp/users1.sql
npx wrangler d1 execute "$DB_NAME" --remote --file=/tmp/users1.sql 2>&1

echo "ALTER TABLE users ADD COLUMN is_super_admin INTEGER DEFAULT 0;" > /tmp/users2.sql
npx wrangler d1 execute "$DB_NAME" --remote --file=/tmp/users2.sql 2>&1

echo "ALTER TABLE classes ADD COLUMN department_id INTEGER;" > /tmp/classes.sql
npx wrangler d1 execute "$DB_NAME" --remote --file=/tmp/classes.sql 2>&1

echo "ALTER TABLE members ADD COLUMN department_id INTEGER;" > /tmp/members1.sql
npx wrangler d1 execute "$DB_NAME" --remote --file=/tmp/members1.sql 2>&1

echo "ALTER TABLE members ADD COLUMN parent_name TEXT;" > /tmp/members2.sql
npx wrangler d1 execute "$DB_NAME" --remote --file=/tmp/members2.sql 2>&1

echo "ALTER TABLE members ADD COLUMN parent_phone TEXT;" > /tmp/members3.sql
npx wrangler d1 execute "$DB_NAME" --remote --file=/tmp/members3.sql 2>&1

echo "ALTER TABLE service_types ADD COLUMN department_id INTEGER;" > /tmp/service_types.sql
npx wrangler d1 execute "$DB_NAME" --remote --file=/tmp/service_types.sql 2>&1

echo "✅ 완료"
