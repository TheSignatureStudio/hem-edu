-- 부서 구조 재정의 및 권한 시스템 개선

-- 1. users 테이블에 super_admin 역할 추가 및 부서 연결
ALTER TABLE users ADD COLUMN department_id INTEGER;
ALTER TABLE users ADD COLUMN is_super_admin INTEGER DEFAULT 0;

-- users 테이블의 role CHECK 제약 조건 수정 (super_admin 추가)
-- SQLite는 CHECK 제약 조건을 직접 수정할 수 없으므로 테이블 재생성 필요
-- 하지만 기존 데이터가 있으므로 일단 컬럼만 추가하고, 
-- role은 애플리케이션 레벨에서 관리

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
  accessed_by INTEGER NOT NULL,
  accessed_member_id INTEGER NOT NULL,
  access_type TEXT NOT NULL CHECK(access_type IN ('view', 'edit', 'export')),
  accessed_fields TEXT,  -- JSON 형태로 접근한 필드 목록
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (accessed_by) REFERENCES users(id),
  FOREIGN KEY (accessed_member_id) REFERENCES members(id)
);

CREATE INDEX IF NOT EXISTS idx_access_logs_user ON information_access_logs(accessed_by);
CREATE INDEX IF NOT EXISTS idx_access_logs_member ON information_access_logs(accessed_member_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_date ON information_access_logs(created_at);

-- 7. 부서 데이터 재정의 (유초등부, 젊은이부)
-- 새로운 부서 구조 추가 (기존 부서는 유지)
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

