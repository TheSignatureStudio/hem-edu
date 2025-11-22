-- 모든 마이그레이션을 순서대로 적용하는 통합 스크립트
-- Cloudflare D1 Dashboard에서 각 SQL 문을 개별적으로 실행하세요
-- (D1은 다중 문 쿼리를 지원하지 않으므로 각 문을 하나씩 실행해야 합니다)

-- ============================================
-- Migration 0005: Remove attendance service_type CHECK constraint
-- ============================================
-- 기존 테이블 백업
CREATE TABLE IF NOT EXISTS attendance_backup AS SELECT * FROM attendance;

-- 기존 테이블 삭제
DROP TABLE IF EXISTS attendance;

-- CHECK 제약 조건 없이 테이블 재생성
CREATE TABLE attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  attendance_date DATE NOT NULL,
  service_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('출석', '결석', '기타')),
  note TEXT,
  recorded_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id),
  UNIQUE(member_id, attendance_date, service_type)
);

-- 데이터 복원 (컬럼 순서 명시)
INSERT INTO attendance (id, member_id, attendance_date, service_type, status, note, recorded_by, created_at)
SELECT id, member_id, attendance_date, service_type, status, note, recorded_by, created_at
FROM attendance_backup;

-- 백업 테이블 삭제
DROP TABLE IF EXISTS attendance_backup;

-- 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);

-- ============================================
-- Migration 0006: Restructure departments and permissions
-- ============================================
-- 1. users 테이블에 super_admin 역할 추가 및 부서 연결
ALTER TABLE users ADD COLUMN department_id INTEGER;
ALTER TABLE users ADD COLUMN is_super_admin INTEGER DEFAULT 0;

-- 2. classes 테이블에 부서 연결
ALTER TABLE classes ADD COLUMN department_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_classes_department ON classes(department_id);

-- 3. members 테이블에 부서 연결 (학생은 부서에 속함)
ALTER TABLE members ADD COLUMN department_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_members_department ON members(department_id);

-- 4. service_types 테이블에 부서 연결 (예배 구분을 부서별로 관리)
ALTER TABLE service_types ADD COLUMN department_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_service_types_department ON service_types(department_id);

-- 5. 훈련(training) 테이블 추가
CREATE TABLE IF NOT EXISTS trainings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  department_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  location TEXT,
  instructor TEXT,
  is_active INTEGER DEFAULT 1,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_trainings_department ON trainings(department_id);
CREATE INDEX IF NOT EXISTS idx_trainings_dates ON trainings(start_date, end_date);

-- 6. 정보 열람 기록 테이블 추가
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

CREATE INDEX IF NOT EXISTS idx_access_logs_user ON information_access_logs(accessed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_member ON information_access_logs(accessed_member_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_date ON information_access_logs(access_timestamp);

-- 7. 부서 데이터 재정의 (유초등부, 젊은이부)
INSERT OR IGNORE INTO departments (name, display_order) VALUES 
  ('유초등부', 1),
  ('젊은이부', 2);

-- 8. 기본 예배 구분을 부서별로 설정
-- 유초등부 예배
INSERT OR IGNORE INTO service_types (name, display_order, department_id) 
SELECT '유초등부 예배', 1, id FROM departments WHERE name = '유초등부' LIMIT 1;

-- 젊은이 예배
INSERT OR IGNORE INTO service_types (name, display_order, department_id) 
SELECT '젊은이 예배', 2, id FROM departments WHERE name = '젊은이부' LIMIT 1;

-- 통합예배 (부서 없음 - 모든 부서가 함께)
INSERT OR IGNORE INTO service_types (name, display_order, department_id) 
VALUES ('통합예배', 3, NULL);

-- ============================================
-- Migration 0007: Add parent contact fields
-- ============================================
ALTER TABLE members ADD COLUMN parent_phone TEXT;
ALTER TABLE members ADD COLUMN parent_name TEXT;

