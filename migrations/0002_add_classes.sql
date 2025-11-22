-- 주일학교 반 테이블
CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  grade_level TEXT NOT NULL CHECK(grade_level IN ('영아부', '유치부', '유년부', '초등부', '중등부', '고등부', '청년부')),
  teacher_name TEXT,
  teacher_phone TEXT,
  room_number TEXT,
  meeting_time TEXT,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- members 테이블에 학년 관련 필드 추가
ALTER TABLE members ADD COLUMN school_grade TEXT;  -- 실제 학년 (초1, 초2, 중1 등)
ALTER TABLE members ADD COLUMN grade_override INTEGER DEFAULT 0;  -- 학년 수동 설정 여부
ALTER TABLE members ADD COLUMN class_id INTEGER;  -- 반 배정

-- 외래키 인덱스
CREATE INDEX IF NOT EXISTS idx_members_class ON members(class_id);
CREATE INDEX IF NOT EXISTS idx_classes_grade ON classes(grade_level);

-- 샘플 반 데이터
INSERT OR IGNORE INTO classes (id, name, grade_level, teacher_name, room_number, meeting_time) VALUES 
  (1, '영아부', '영아부', '김교사', '1층 영아실', '주일 오전 10시'),
  (2, '유치부', '유치부', '이교사', '1층 유치실', '주일 오전 10시'),
  (3, '유년부', '유년부', '박교사', '2층 유년실', '주일 오전 10시'),
  (4, '초등부 1반', '초등부', '최교사', '2층 초등1실', '주일 오전 11시'),
  (5, '초등부 2반', '초등부', '정교사', '2층 초등2실', '주일 오전 11시'),
  (6, '중등부', '중등부', '강교사', '3층 중등실', '주일 오전 11시'),
  (7, '고등부', '고등부', '조교사', '3층 고등실', '주일 오전 11시'),
  (8, '청년부', '청년부', '윤교사', '본당 소예배실', '주일 오후 2시');

