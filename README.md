# 교회 교적 관리 시스템

교회 교인 정보를 관리하는 간단한 웹 애플리케이션입니다.

## 🌟 주요 기능

- **교인 관리**: 교인 정보 등록, 조회, 수정
- **구역/소그룹 관리**: 구역 및 소그룹 조직 관리
- **출석 관리**: 예배 출석 기록 및 통계
- **상담 기록**: 교인 상담 내역 관리
- **계정 관리**: 관리자 및 간사 계정 관리 (관리자 전용)

## 💻 기술 스택

- **프레임워크**: Hono + TypeScript
- **배포**: Cloudflare Pages
- **데이터베이스**: Cloudflare D1 (SQLite)
- **스타일**: TailwindCSS v3

## 🚀 로컬 개발 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 로컬 DB 초기화

```bash
# 기존 DB 삭제 (선택사항)
rm -rf .wrangler/state/v3/d1

# 마이그레이션 실행
npx wrangler d1 migrations apply webapp-production --local

# 초기 데이터 삽입
npx wrangler d1 execute webapp-production --local --file=./seed.sql
```

### 3. CSS 빌드

```bash
npm run build:css
```

### 4. 개발 서버 실행

```bash
npm run dev
```

서버가 실행되면 http://localhost:5173 에서 접속할 수 있습니다.

## 🔑 테스트 계정

| 역할 | 아이디 | 비밀번호 |
|------|--------|----------|
| 관리자 (담임목사) | admin | admin123 |
| 간사 (청년부장) | teacher1 | teacher123 |
| 간사 (교육간사) | teacher2 | teacher123 |

## 📊 데이터베이스 구조

### 주요 테이블

- `users` - 관리자/간사 계정
- `members` - 교인 정보
- `families` - 가족 그룹
- `groups` - 구역/소그룹
- `group_members` - 구역/소그룹 회원
- `attendance` - 출석 기록
- `counseling` - 상담 기록
- `services` - 봉사 기록
- `donations` - 헌금 기록 (선택)
- `settings` - 시스템 설정

## 📁 프로젝트 구조

```
hem_edu/
├── migrations/              # DB 스키마
│   └── 0001_church_schema.sql
├── seed.sql                 # 초기 테스트 데이터
├── src/
│   ├── index.tsx           # 메인 진입점
│   ├── routes/             # API 라우트
│   │   ├── auth.ts         # 인증
│   │   ├── users.ts        # 계정 관리
│   │   ├── members.ts      # 교인 관리
│   │   ├── groups.ts       # 구역/소그룹
│   │   ├── attendance.ts   # 출석
│   │   ├── counseling.ts   # 상담
│   │   └── settings.ts     # 설정
│   ├── middleware/         # 인증 미들웨어
│   └── types/              # TypeScript 타입
├── public/static/          # 프론트엔드 파일
│   ├── styles.css         # 컴파일된 CSS
│   └── app.js             # 메인 JavaScript
└── wrangler.jsonc         # Cloudflare 설정
```

## 🔄 일반 워크플로우

### DB 초기화 (리셋)

```bash
# 로컬 DB 완전 초기화
rm -rf .wrangler/state/v3/d1
npx wrangler d1 migrations apply webapp-production --local
npx wrangler d1 execute webapp-production --local --file=./seed.sql
```

### CSS 수정 시

```bash
npm run build:css
```

### 프로덕션 배포 (Cloudflare Pages)

```bash
# 빌드
npm run build

# 배포
npm run deploy

# DB 마이그레이션 + 배포
npm run deploy:full
```

## ⚙️ 환경 설정

### wrangler.jsonc

Cloudflare D1 데이터베이스 설정이 포함되어 있습니다.

```jsonc
{
  "name": "church-system",
  "pages_build_output_dir": "dist",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "webapp-production",
      "database_id": "..."
    }
  ]
}
```

## 📝 개발 시 주의사항

1. **로컬 환경**: `.wrangler/state/v3/d1/` 폴더에 SQLite DB가 생성됩니다
2. **마이그레이션**: migrations 폴더의 파일은 순서대로 실행되며, 한 번 적용 후 수정 금지
3. **CSS 변경**: `src/styles.css` 수정 후 반드시 `npm run build:css` 실행
4. **포트 충돌**: 5173 포트가 사용 중이면 다른 포트로 자동 할당됩니다

## 🛠️ 유용한 명령어

```bash
# 로컬 DB 조회
npx wrangler d1 execute webapp-production --local --command "SELECT * FROM members"

# 특정 SQL 실행
npx wrangler d1 execute webapp-production --local --command "SELECT * FROM users"

# 프로덕션 DB 조회 (원격)
npx wrangler d1 execute webapp-production --remote --command "SELECT COUNT(*) FROM members"
```

## 📞 문의

교회 교적 관리 시스템 개발: AI Assistant

---

**마지막 업데이트**: 2025-11-22  
**버전**: v1.0.0
