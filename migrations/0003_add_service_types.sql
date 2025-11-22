-- 예배 구분 설정 테이블
CREATE TABLE IF NOT EXISTS service_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 기본 예배 구분 추가
INSERT OR IGNORE INTO service_types (name, display_order) VALUES 
  ('주일학교 예배', 1),
  ('젊은이 예배', 2),
  ('통합예배', 3);

-- 기존 settings 테이블에 church_name이 없으면 추가
INSERT OR IGNORE INTO settings (key, value, description) VALUES 
  ('church_name', '은혜교회', '교회 이름'),
  ('church_address', '서울시 강남구', '교회 주소'),
  ('church_phone', '02-1234-5678', '교회 연락처');

-- 선생님 테이블 (teachers)
CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  position TEXT,
  is_active INTEGER DEFAULT 1,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 샘플 선생님 데이터
INSERT OR IGNORE INTO teachers (id, name, phone, position) VALUES 
  (1, '김교사', '010-1111-1111', '부장'),
  (2, '이교사', '010-2222-2222', '교사'),
  (3, '박교사', '010-3333-3333', '교사'),
  (4, '최교사', '010-4444-4444', '교사'),
  (5, '정교사', '010-5555-5555', '교사'),
  (6, '강교사', '010-6666-6666', '교사'),
  (7, '조교사', '010-7777-7777', '교사'),
  (8, '윤교사', '010-8888-8888', '교사');

