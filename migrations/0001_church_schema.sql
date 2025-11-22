-- 교회 교적 관리 시스템 - 기본 스키마

-- 사용자 계정 테이블 (관리자, 교사만)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('teacher', 'admin')),
  phone TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 교인 정보 테이블
CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_english TEXT,
  birth_date DATE,
  gender TEXT CHECK(gender IN ('남', '여')),
  phone TEXT,
  email TEXT,
  address TEXT,
  zip_code TEXT,
  
  -- 신앙 정보
  baptism_date DATE,
  baptism_place TEXT,
  baptism_type TEXT CHECK(baptism_type IN ('유아세례', '입교', '세례', '미정')),
  confession_date DATE,
  
  -- 등록 정보
  registration_date DATE,
  member_status TEXT DEFAULT 'active' CHECK(member_status IN ('active', 'inactive', 'transferred', 'deceased')),
  previous_church TEXT,
  transfer_date DATE,
  
  -- 가족 정보
  family_id INTEGER,
  family_role TEXT CHECK(family_role IN ('부', '모', '자녀', '기타')),
  
  -- 교회 봉사
  current_service TEXT,
  service_history TEXT,
  
  -- 기타
  photo_url TEXT,
  note TEXT,
  emergency_contact TEXT,
  emergency_contact_name TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 가족 테이블
CREATE TABLE IF NOT EXISTS families (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_name TEXT NOT NULL,
  head_member_id INTEGER,
  address TEXT,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (head_member_id) REFERENCES members(id)
);

-- 출석 기록
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  attendance_date DATE NOT NULL,
  service_type TEXT NOT NULL CHECK(service_type IN ('주일예배', '수요예배', '새벽예배', '금요예배', '특별집회', '기타')),
  status TEXT NOT NULL CHECK(status IN ('출석', '결석', '기타')),
  note TEXT,
  recorded_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id),
  UNIQUE(member_id, attendance_date, service_type)
);

-- 소그룹/구역 테이블
CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  group_type TEXT CHECK(group_type IN ('구역', '소그룹', '선교회', '기타')),
  leader_member_id INTEGER,
  description TEXT,
  meeting_day TEXT,
  meeting_time TEXT,
  meeting_place TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_member_id) REFERENCES members(id)
);

-- 소그룹 회원
CREATE TABLE IF NOT EXISTS group_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  role TEXT DEFAULT 'member' CHECK(role IN ('리더', '부리더', '회원')),
  joined_date DATE DEFAULT (date('now')),
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  UNIQUE(group_id, member_id)
);

-- 상담 기록
CREATE TABLE IF NOT EXISTS counseling (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  counseling_date DATE NOT NULL,
  counseling_type TEXT CHECK(counseling_type IN ('개인상담', '가정상담', '신앙상담', '기타')),
  counselor TEXT NOT NULL,
  content TEXT NOT NULL,
  follow_up TEXT,
  is_private INTEGER DEFAULT 1,
  recorded_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- 봉사 기록
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  service_name TEXT NOT NULL,
  service_type TEXT CHECK(service_type IN ('예배', '교육', '행정', '시설', '기타')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_current INTEGER DEFAULT 1,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- 헌금 기록 (선택적)
CREATE TABLE IF NOT EXISTS donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  donation_date DATE NOT NULL,
  donation_type TEXT NOT NULL CHECK(donation_type IN ('십일조', '감사', '선교', '건축', '기타')),
  amount INTEGER NOT NULL CHECK(amount >= 0),
  note TEXT,
  recorded_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- 시스템 설정
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(member_status);
CREATE INDEX IF NOT EXISTS idx_members_family ON members(family_id);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_member ON group_members(member_id);
CREATE INDEX IF NOT EXISTS idx_counseling_member ON counseling(member_id);
CREATE INDEX IF NOT EXISTS idx_services_member ON services(member_id);
CREATE INDEX IF NOT EXISTS idx_donations_member ON donations(member_id);
CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(donation_date);


