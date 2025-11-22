-- attendance 테이블의 service_type CHECK 제약 조건 완전 제거
-- 이 SQL을 Cloudflare Dashboard의 D1 Execute SQL에서 직접 실행하세요

BEGIN TRANSACTION;

-- 1. 기존 데이터 백업
CREATE TABLE attendance_backup AS 
SELECT * FROM attendance;

-- 2. 기존 테이블 완전 삭제
DROP TABLE IF EXISTS attendance;

-- 3. CHECK 제약 조건 없이 새 테이블 생성 (service_type에 제약 없음)
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

-- 4. 데이터 복원
INSERT INTO attendance (
  id, 
  member_id, 
  attendance_date, 
  service_type, 
  status, 
  note, 
  recorded_by, 
  created_at
)
SELECT 
  id, 
  member_id, 
  attendance_date, 
  service_type, 
  status, 
  note, 
  recorded_by, 
  created_at
FROM attendance_backup;

-- 5. 백업 테이블 삭제
DROP TABLE attendance_backup;

-- 6. 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);

COMMIT;

