-- 부서(학년) 설정 테이블
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 기본 부서 추가
INSERT OR IGNORE INTO departments (name, display_order) VALUES 
  ('영아부', 1),
  ('유치부', 2),
  ('유년부', 3),
  ('초등부', 4),
  ('중등부', 5),
  ('고등부', 6),
  ('청년부', 7);

