# AGENTS.md

## Operational Commands

Package manager: **bun only** — npm, yarn, pnpm 사용 금지.

```bash
bun install                # 의존성 설치
bun run dev                # API 서버(3002) + Vite(5173) 동시 실행
bun run server             # API 서버만 실행 (--watch 포함)
bun run build              # tsc + vite build
bun run lint               # eslint
bun run test               # vitest watch 모드
bun run test:run           # vitest 단발 실행 (CI용)
bun run test:ui            # vitest UI 대시보드
```

## Project Context

프롬프트 입력 시 AI가 React 컴포넌트를 생성하고 실시간 미리보기와 코드를 제공하는 웹 앱.

Tech stack: React 19, TypeScript, Vite, Bun (server), react-live, Anthropic Claude API, Google Gemini API.

## Golden Rules

**Immutable:**
- API 키는 `.env.local`에만 저장한다. 코드, 로그, 응답에 절대 노출하지 않는다.
- 클라이언트가 AI API를 직접 호출하지 않는다 — 반드시 `server/index.ts` 프록시를 경유한다.

**Do:**
- `server/` 수정 시 `./server/AGENTS.md` 먼저 읽어라.
- API 키 존재 여부는 `/api/config` 엔드포인트로만 확인한다.
- Vite dev proxy(`/api` → `localhost:3002`)를 통해 API를 호출한다.
- 타입 정의는 `src/types/index.ts`에 중앙화한다.

**Don't:**
- `src/` 컴포넌트에 CSS 파일이나 CSS 모듈을 추가하지 마라 — 인라인 스타일 사용.
- `bun.lock`을 수동으로 편집하지 마라.
- `any` 타입을 사용하지 마라 — TypeScript strict mode 활성화 상태.

## Standards

**Commit format (Conventional Commits):**
```
<type>: <subject in Korean>
```
Types: `feat`, `fix`, `refactor`, `style`, `chore`, `docs`

**Maintenance Policy:** 코드와 이 규칙 사이에 괴리가 발생하면 즉시 업데이트를 제안하라.

## Context Map

- **[API 서버 수정 (Bun)](./server/AGENTS.md)** — AI provider 호출 로직, 엔드포인트 추가, 코드 후처리 수정 시.
