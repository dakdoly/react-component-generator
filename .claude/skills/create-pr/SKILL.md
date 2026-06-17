---
name: create-pr
description: |
  현재 브랜치의 변경사항을 분석하여 GitHub PR을 자동 생성합니다.
  
  트리거: "PR 만들어줘", "PR 생성해줘", "풀리퀘스트", "pr" 등 PR 생성 요청 시 사용하세요.
  
  수행 작업:
  1. 브랜치 상태 및 커밋 히스토리 분석
  2. references/pr-template.md 기반 PR 제목·본문 초안 작성
  3. 사용자 확인 후 push + gh pr create 실행
context: fork
allowed-tools: Read, Glob, Grep, Bash
---

## 목적

커밋 히스토리와 diff를 분석하여 일관된 형식의 PR을 빠르게 생성합니다.  
템플릿 경로: `.claude/skills/pr/references/pr-template.md`

---

## 절차

### 1단계: 상태 분석

```bash
git status                          # 미커밋 변경사항 확인
git branch --show-current           # 현재 브랜치명
git log main...HEAD --oneline       # main 이후 커밋 목록
git diff main...HEAD --stat         # 변경 파일 요약
```

확인 항목:
- 현재 브랜치가 main/master가 아닌지 확인 (맞으면 경고 후 중단)
- 미커밋 변경사항이 있으면 경고 (커밋 먼저 권유)
- 원격 브랜치 push 여부 확인

### 2단계: PR 초안 작성

`.claude/skills/pr/references/pr-template.md`를 읽어 섹션 구조를 파악한 뒤 채운다.

**제목 규칙:**
- 70자 이내
- `<type>: <한국어 요약>` 형식 (Conventional Commits 타입 사용)
- 마침표 없음

**본문 작성 기준:**
- Summary: 커밋 메시지 기반 변경사항 bullet 3개 이내
- Test plan: 실제로 검증 가능한 항목만 (추상적 문구 금지)
- 템플릿의 나머지 섹션은 관련 내용이 없으면 `N/A`로 표기

### 3단계: 사용자 제시

```
## PR 미리보기

제목: feat: 다크 모드 토글 기능 구현

본문:
---
[생성된 본문 전체 표시]
---

원격 push 후 PR을 생성합니다. 진행할까요?
```

사용자 응답 처리:
- "네", "진행", "해줘" → 4단계 실행
- "제목 수정해줘" / "본문 고쳐줘" → 해당 부분만 재작성 후 재확인
- "취소" → 중단

### 4단계: 실행

```bash
# 원격 브랜치가 없으면 push
git push -u origin <브랜치명>

# PR 생성
gh pr create --title "<제목>" --body "$(cat <<'EOF'
<본문>
EOF
)"
```

성공 시 PR URL을 출력한다.

---

## 에러 처리

| 상황 | 처리 |
|------|------|
| `main` 브랜치에서 실행 | 경고 후 중단. 새 브랜치 생성 권유 |
| 미커밋 변경사항 존재 | 경고. 사용자가 원하면 그대로 진행 |
| `gh` 미설치 | `gh` CLI 설치 안내 후 중단 |
| push 실패 | 에러 메시지 출력, 수동 push 안내 |
| PR 이미 존재 | 기존 PR URL 출력 후 중단 |
| 템플릿 파일 없음 | 기본 템플릿으로 대체, 파일 생성 제안 |

---

## 주의사항

- `.env`, `.env.local` 등 시크릿 포함 파일이 diff에 있으면 **경고** 후 제외 여부 확인
- PR 본문에 API 키, 토큰 등 민감 정보가 들어가지 않도록 diff 내용을 그대로 복사하지 마라
