# Cloudflare Pages 배포 가이드

## 🚀 배포 방법

### 방법 1: Cloudflare Dashboard에서 배포 (권장)

#### 1단계: Cloudflare Pages 프로젝트 생성

1. https://dash.cloudflare.com 로그인
2. **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. GitHub 저장소 연결: **TheSignatureStudio/hem-edu**
4. 빌드 설정:
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. **Save and Deploy** 클릭

#### 2단계: D1 데이터베이스 연결

1. 프로젝트 생성 후 **Settings** → **Functions** 탭
2. **D1 database bindings** 섹션에서 **Add binding**
3. Variable name: `DB`
4. D1 database: `webapp-production` 선택
5. **Save** 클릭

#### 3단계: 프로덕션 DB 마이그레이션

터미널에서 실행 (Cloudflare 로그인 필요):

```bash
cd /Users/tim/Desktop/Workspace/hem_edu

# Cloudflare 로그인
npx wrangler login

# 프로덕션 DB에 마이그레이션 적용
npx wrangler d1 migrations apply webapp-production --remote

# 초기 데이터 삽입
npx wrangler d1 execute webapp-production --remote --file=./seed.sql
```

#### 4단계: 배포 완료

자동으로 배포되며, URL은 다음과 같은 형식:
- https://[프로젝트명].pages.dev

---

### 방법 2: 명령어로 직접 배포

#### 사전 준비

```bash
# Cloudflare 로그인
npx wrangler login
```

#### 배포 명령어

```bash
cd /Users/tim/Desktop/Workspace/hem_edu

# 전체 배포 (DB + 코드)
npm run deploy:full

# 또는 개별 실행
npm run build              # 빌드
npm run db:migrate:prod    # DB 마이그레이션
npm run db:seed:prod       # 초기 데이터
npx wrangler pages deploy dist --project-name hem-edu
```

---

## 📋 배포 체크리스트

### 배포 전 확인사항

- [x] Git에 모든 변경사항 커밋
- [x] GitHub에 푸시 완료
- [x] 로컬에서 정상 작동 확인
- [ ] Cloudflare 계정 로그인
- [ ] D1 데이터베이스 생성 확인
- [ ] wrangler.jsonc의 database_id 확인

### 배포 후 확인사항

- [ ] 프로덕션 URL 접속 확인
- [ ] 로그인 테스트 (admin / admin123)
- [ ] 학생 관리 기능 테스트
- [ ] 출석 관리 기능 테스트

---

## 🔧 환경 변수 (필요시)

Cloudflare Pages 설정에서 환경 변수 추가:

- `JWT_SECRET`: JWT 시크릿 키 (선택사항)

---

## 📊 데이터베이스 관리

### 프로덕션 DB 조회

```bash
# 교인 수 확인
npx wrangler d1 execute webapp-production --remote --command "SELECT COUNT(*) FROM members"

# 반 목록 확인
npx wrangler d1 execute webapp-production --remote --command "SELECT * FROM classes"

# 예배 구분 확인
npx wrangler d1 execute webapp-production --remote --command "SELECT * FROM service_types"
```

### 프로덕션 데이터 백업

```bash
# SQL 덤프 (현재 지원 안됨)
# 수동으로 데이터 내보내기
npx wrangler d1 execute webapp-production --remote --command "SELECT * FROM members" > backup.json
```

---

## 🔄 업데이트 배포

코드 수정 후 재배포:

```bash
# 1. 로컬에서 테스트
npm run dev

# 2. Git 커밋 & 푸시
git add .
git commit -m "업데이트 내용"
git push origin main

# 3. Cloudflare Pages가 자동으로 재배포
# 또는 수동 배포:
npm run build
npx wrangler pages deploy dist --project-name hem-edu
```

DB 스키마 변경 시:

```bash
# 1. migrations/ 폴더에 새 SQL 파일 생성
# 예: 0005_add_new_feature.sql

# 2. 로컬 테스트
npm run db:reset

# 3. 프로덕션 적용
npx wrangler d1 migrations apply webapp-production --remote

# 4. 코드 배포
npm run deploy
```

---

## ⚠️ 주의사항

1. **초기 배포 시**: `npm run db:seed:prod`는 한 번만 실행
2. **재배포 시**: seed.sql 재실행하면 데이터 중복 가능
3. **마이그레이션**: 한 번 배포된 마이그레이션 파일은 수정 금지
4. **프로덕션 DB**: 삭제 시 복구 불가능하니 주의

---

## 🆘 문제 해결

### 빌드 오류 시
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 배포 오류 시
```bash
npx wrangler login
npx wrangler pages deploy dist --project-name hem-edu
```

### DB 연결 오류 시
- Cloudflare Dashboard에서 D1 binding 확인
- database_id가 wrangler.jsonc와 일치하는지 확인

---

**마지막 빌드**: 2025-11-22  
**프로젝트 이름**: hem-edu

