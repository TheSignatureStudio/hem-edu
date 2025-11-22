-- attendance 테이블의 service_type CHECK 제약 조건 완전 제거
-- 이 SQL을 Cloudflare Dashboard의 D1 Execute SQL에서 실행하세요

-- 먼저 현재 테이블 구조 확인
SELECT sql FROM sqlite_master WHERE type='table' AND name='attendance';

-- 위 쿼리로 확인 후, 아래 SQL 실행:

BEGIN TRANSACTION;

-- 기존 데이터 백업
CREATE TABLE IF NOT EXISTS attendance_backup AS SELECT * FROM attendance;

-- 기존 테이블 완전 삭제
DROP TABLE IF EXISTS attendance;

-- CHECK 제약 조건 없이 새 테이블 생성 (service_type에 제약 없음)
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

-- 데이터 복원
INSERT INTO attendance (id, member_id, attendance_date, service_type, status, note, recorded_by, created_at)
SELECT id, member_id, attendance_date, service_type, status, note, recorded_by, created_at
FROM attendance_backup;

-- 백업 테이블 삭제
DROP TABLE IF EXISTS attendance_backup;

-- 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);

COMMIT;

-- 확인: 테이블 구조 다시 확인 (service_type에 CHECK가 없어야 함)
SELECT sql FROM sqlite_master WHERE type='table' AND name='attendance';

