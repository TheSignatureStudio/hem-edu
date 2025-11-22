# 출석 테이블 service_type 제약 조건 제거 가이드

## 문제
`attendance` 테이블의 `service_type` 컬럼에 CHECK 제약 조건이 있어서, 시스템 설정에서 추가한 예배 구분('주일학교 예배', '젊은이 예배' 등)을 사용할 수 없습니다.

## 해결 방법

### 방법 1: Cloudflare Dashboard에서 직접 실행 (권장)

1. https://dash.cloudflare.com 접속
2. **Workers & Pages** → **D1** → **hem-edu-db** 선택
3. **Execute SQL** 탭 클릭
4. 아래 SQL 전체를 복사해서 붙여넣고 **Run** 클릭:

```sql
BEGIN TRANSACTION;

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

-- 데이터 복원
INSERT INTO attendance (id, member_id, attendance_date, service_type, status, note, recorded_by, created_at)
SELECT id, member_id, attendance_date, service_type, status, note, recorded_by, created_at
FROM attendance_backup;

-- 백업 테이블 삭제
DROP TABLE attendance_backup;

-- 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);

COMMIT;
```

### 방법 2: 터미널에서 실행

```bash
cd /Users/tim/Desktop/Workspace/hem_edu
npx wrangler d1 execute hem-edu-db --remote --file=./fix_attendance_direct.sql
```

### 방법 3: 마이그레이션 재적용

```bash
cd /Users/tim/Desktop/Workspace/hem_edu
npx wrangler d1 migrations apply hem-edu-db --remote
```

## 확인 방법

SQL 실행 후 다음 명령어로 테이블 구조 확인:

```sql
SELECT sql FROM sqlite_master WHERE type='table' AND name='attendance';
```

`service_type`에 CHECK 제약 조건이 없어야 정상입니다.

## 주의사항

- 이 작업은 기존 출석 데이터를 백업하고 복원하므로 데이터 손실 없이 안전합니다.
- 트랜잭션으로 감싸져 있어 오류 발생 시 자동 롤백됩니다.

