-- attendance 테이블의 service_type CHECK 제약 조건 제거
-- 이 파일을 직접 실행하여 수정할 수 있습니다:
-- npx wrangler d1 execute hem-edu-db --remote --file=./fix_attendance_service_type.sql

-- 기존 테이블 백업
CREATE TABLE attendance_backup AS SELECT * FROM attendance;

-- 기존 테이블 삭제
DROP TABLE attendance;

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
DROP TABLE attendance_backup;

-- 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);

