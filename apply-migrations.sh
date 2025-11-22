#!/bin/bash
# 마이그레이션 적용 스크립트

set -e

echo "🔍 데이터베이스 확인 중..."
DB_NAME="hem-edu-db"

# 데이터베이스 목록 확인
echo "📋 D1 데이터베이스 목록:"
npx wrangler d1 list || echo "⚠️  데이터베이스 목록을 가져올 수 없습니다."

echo ""
echo "🚀 마이그레이션 적용 시도: $DB_NAME"
echo ""

# 마이그레이션 적용
if npx wrangler d1 migrations apply "$DB_NAME" --remote; then
    echo "✅ 마이그레이션이 성공적으로 적용되었습니다!"
else
    echo "❌ 마이그레이션 적용 실패"
    echo ""
    echo "💡 해결 방법:"
    echo "1. Cloudflare Dashboard (https://dash.cloudflare.com)에서 D1 데이터베이스를 확인하세요"
    echo "2. 데이터베이스 이름이 '$DB_NAME'과 일치하는지 확인하세요"
    echo "3. 데이터베이스가 없다면 생성하세요:"
    echo "   npx wrangler d1 create $DB_NAME"
    echo ""
    echo "4. 또는 다른 데이터베이스 이름을 사용하려면:"
    echo "   npx wrangler d1 migrations apply <실제-데이터베이스-이름> --remote"
    exit 1
fi

