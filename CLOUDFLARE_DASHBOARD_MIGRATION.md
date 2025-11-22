# Cloudflare Dashboard에서 마이그레이션 적용하기

## 📍 현재 데이터베이스
- **이름**: `hem-edu-db`
- **위치**: Cloudflare Dashboard → D1 SQL Database → hem-edu-db

## 🚀 마이그레이션 적용 방법

### 방법 1: Cloudflare Dashboard에서 직접 실행 (권장)

1. **D1 데이터베이스 페이지로 이동**
   - Cloudflare Dashboard → D1 SQL Database → `hem-edu-db` 클릭

2. **SQL 편집기 열기**
   - 데이터베이스 상세 페이지에서 "Query" 또는 "SQL 편집기" 탭 클릭

3. **마이그레이션 SQL 실행**
   - 아래 SQL 문을 **하나씩** 복사해서 실행하세요
   - D1은 다중 문 쿼리를 지원하지 않으므로 각 문을 개별적으로 실행해야 합니다

---

## 📋 마이그레이션 SQL (순서대로 실행)

### Migration 0005: attendance 테이블 수정

```sql
-- 1. 기존 테이블 백업
CREATE TABLE IF NOT EXISTS attendance_backup AS SELECT * FROM attendance;
```

```sql
-- 2. 기존 테이블 삭제
DROP TABLE IF EXISTS attendance;
```

```sql
-- 3. CHECK 제약 조건 없이 테이블 재생성
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
```

```sql
-- 4. 데이터 복원
INSERT INTO attendance (id, member_id, attendance_date, service_type, status, note, recorded_by, created_at)
SELECT id, member_id, attendance_date, service_type, status, note, recorded_by, created_at
FROM attendance_backup;
```

```sql
-- 5. 백업 테이블 삭제
DROP TABLE IF EXISTS attendance_backup;
```

```sql
-- 6. 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);
```

```sql
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
```

---

### Migration 0006: 부서 구조 재정의

```sql
-- 1. users 테이블에 부서 연결
ALTER TABLE users ADD COLUMN department_id INTEGER;
```

```sql
ALTER TABLE users ADD COLUMN is_super_admin INTEGER DEFAULT 0;
```

```sql
-- 2. classes 테이블에 부서 연결
ALTER TABLE classes ADD COLUMN department_id INTEGER;
```

```sql
CREATE INDEX IF NOT EXISTS idx_classes_department ON classes(department_id);
```

```sql
-- 3. members 테이블에 부서 연결
ALTER TABLE members ADD COLUMN department_id INTEGER;
```

```sql
CREATE INDEX IF NOT EXISTS idx_members_department ON members(department_id);
```

```sql
-- 4. service_types 테이블에 부서 연결
ALTER TABLE service_types ADD COLUMN department_id INTEGER;
```

```sql
CREATE INDEX IF NOT EXISTS idx_service_types_department ON service_types(department_id);
```

```sql
-- 5. 훈련 테이블 추가
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
```

```sql
CREATE INDEX IF NOT EXISTS idx_trainings_department ON trainings(department_id);
```

```sql
CREATE INDEX IF NOT EXISTS idx_trainings_dates ON trainings(start_date, end_date);
```

```sql
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
```

```sql
CREATE INDEX IF NOT EXISTS idx_access_logs_user ON information_access_logs(accessed_by_user_id);
```

```sql
CREATE INDEX IF NOT EXISTS idx_access_logs_member ON information_access_logs(accessed_member_id);
```

```sql
CREATE INDEX IF NOT EXISTS idx_access_logs_date ON information_access_logs(access_timestamp);
```

```sql
-- 7. 부서 데이터 추가
INSERT OR IGNORE INTO departments (name, display_order) VALUES ('유초등부', 1);
```

```sql
INSERT OR IGNORE INTO departments (name, display_order) VALUES ('젊은이부', 2);
```

```sql
-- 8. 기본 예배 구분 추가
INSERT OR IGNORE INTO service_types (name, display_order, department_id) 
SELECT '유초등부 예배', 1, id FROM departments WHERE name = '유초등부' LIMIT 1;
```

```sql
INSERT OR IGNORE INTO service_types (name, display_order, department_id) 
SELECT '젊은이 예배', 2, id FROM departments WHERE name = '젊은이부' LIMIT 1;
```

```sql
INSERT OR IGNORE INTO service_types (name, display_order, department_id) 
VALUES ('통합예배', 3, NULL);
```

---

### Migration 0007: 부모 연락처 필드 추가

```sql
ALTER TABLE members ADD COLUMN parent_phone TEXT;
```

```sql
ALTER TABLE members ADD COLUMN parent_name TEXT;
```

---

## ✅ 완료 확인

마이그레이션 적용 후 다음 쿼리로 확인하세요:

```sql
-- trainings 테이블 확인
SELECT name FROM sqlite_master WHERE type='table' AND name='trainings';
```

```sql
-- information_access_logs 테이블 확인
SELECT name FROM sqlite_master WHERE type='table' AND name='information_access_logs';
```

```sql
-- members 테이블에 새 컬럼 확인
PRAGMA table_info(members);
```

---

## ⚠️ 주의사항

1. **순서대로 실행**: 마이그레이션은 순서대로 실행해야 합니다
2. **하나씩 실행**: 각 SQL 문을 개별적으로 실행하세요
3. **백업 권장**: 중요한 데이터가 있다면 먼저 백업하세요
4. **에러 확인**: 각 SQL 실행 후 에러가 없는지 확인하세요

