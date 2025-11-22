#!/bin/bash
# 마이그레이션 적용 확인 스크립트

DB_NAME="hem-edu-db"
echo "🔍 마이그레이션 적용 확인 중..."
echo ""

echo "1. trainings 테이블 확인:"
npx wrangler d1 execute "$DB_NAME" --remote --command "SELECT name FROM sqlite_master WHERE type='table' AND name='trainings'" 2>&1 | grep -A 10 "results" || echo "❌ trainings 테이블 없음"

echo ""
echo "2. information_access_logs 테이블 확인:"
npx wrangler d1 execute "$DB_NAME" --remote --command "SELECT name FROM sqlite_master WHERE type='table' AND name='information_access_logs'" 2>&1 | grep -A 10 "results" || echo "❌ information_access_logs 테이블 없음"

echo ""
echo "3. members 테이블에 새 컬럼 확인:"
npx wrangler d1 execute "$DB_NAME" --remote --command "PRAGMA table_info(members)" 2>&1 | grep -E "department_id|parent_name|parent_phone" || echo "❌ 새 컬럼 없음"

echo ""
echo "4. 부서 데이터 확인:"
npx wrangler d1 execute "$DB_NAME" --remote --command "SELECT name FROM departments WHERE name IN ('유초등부', '젊은이부')" 2>&1 | grep -A 10 "results" || echo "❌ 부서 데이터 없음"

echo ""
echo "5. 예배 구분 확인:"
npx wrangler d1 execute "$DB_NAME" --remote --command "SELECT name, department_id FROM service_types WHERE name IN ('유초등부 예배', '젊은이 예배', '통합예배')" 2>&1 | grep -A 10 "results" || echo "❌ 예배 구분 없음"

