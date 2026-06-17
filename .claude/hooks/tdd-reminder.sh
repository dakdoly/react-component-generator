#!/bin/sh
# .claude/hooks/tdd-reminder.sh
# src/ 소스 파일 수정 시 대응 테스트 파일 존재 여부 확인 후 TDD 권고
# 항상 exit 0 — 차단하지 않고 권고만 함

INPUT=$(cat)

# file_path 추출 (Write/Edit 공통 필드)
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"\s*:\s*"[^"]*"' | head -1 | sed 's/.*:\s*"//;s/"$//')

[ -z "$FILE_PATH" ] && exit 0

# src/ 아래 .ts/.tsx 파일만 대상
echo "$FILE_PATH" | grep -qE '^src/.+\.(ts|tsx)$' || exit 0

# 테스트·스펙 파일 본인은 제외
echo "$FILE_PATH" | grep -qE '\.(test|spec)\.(ts|tsx)$' && exit 0

# 대응 테스트 파일 경로 (예: src/hooks/foo.ts → src/hooks/foo.test.ts)
TEST_FILE=$(echo "$FILE_PATH" | sed 's/\.\(ts\)$/.test.\1/;s/\.\(tsx\)$/.test.\1/')

if [ ! -f "$TEST_FILE" ]; then
  printf "\n[TDD 권고] %s\n" "$FILE_PATH"
  printf "  대응 테스트 파일이 없습니다: %s\n" "$TEST_FILE"
  printf "  구현 전에 테스트를 먼저 작성하세요. (참고: .claude/rules/tdd.md)\n\n"
fi

exit 0
