# AGENTS.md — server/

## Module Context

Bun HTTP 서버. AI API(Anthropic, Google Gemini) 프록시 역할. 포트 3002.
프론트엔드에서 오는 `/api/generate`(POST)와 `/api/config`(GET) 요청만 처리한다.

## Tech Stack & Constraints

- Runtime: **Bun** — `Bun.serve` 사용. Node.js `require`, `http` 모듈 사용 금지.
- HTTP 클라이언트: 전역 `fetch` (Bun 내장) — axios 등 외부 HTTP 라이브러리 설치 금지.
- 현재 AI 모델: Anthropic `claude-haiku-4-5-20251001`, Google `gemini-2.5-flash`.

## Implementation Patterns

**새 Provider 추가 순서:**
1. `src/types/index.ts`의 `Provider` 타입에 추가.
2. `ENV_KEYS` 레코드에 환경변수 키 추가.
3. `call<ProviderName>(prompt, apiKey)` 함수 작성 — 후처리(`stripCodeFences`, `ensureRenderCall`)는 호출부 책임.
4. `/api/generate` 핸들러의 provider 분기에 추가.

**코드 후처리 파이프라인 (순서 변경 금지):**
```
AI 응답 raw text
  → stripCodeFences()    // 마크다운 코드 펜스 제거
  → ensureRenderCall()   // render(<Component />) 미존재 시 자동 추가
  → 클라이언트 반환
```

**CORS:** 모든 응답에 `CORS_HEADERS` 포함. 새 엔드포인트 추가 시 동일하게 적용.

## AI Generated Component Constraints

시스템 프롬프트(`SYSTEM_PROMPT`)가 강제하는 생성 코드 규칙:
- import 문 없음 (React는 전역 스코프에서 제공)
- 인라인 스타일만 사용 (CSS 파일/모듈 금지)
- TypeScript 문법 없음 (순수 JavaScript)
- 파일 끝 `render(<ComponentName />)` 필수

시스템 프롬프트를 수정할 경우 위 제약이 유지되는지 반드시 검증하라.

## Local Golden Rules

**Do:**
- 에러 응답 HTTP 상태 코드를 실제 오류에 맞게 반영한다 (400, 429, 503, 500).
- `resolveApiKey(provider, clientKey)`를 통해 키를 병합한다 — 핸들러에서 `process.env`를 직접 참조하지 마라.

**Don't:**
- express, hono 등 프레임워크를 도입하지 마라 — 단일 파일(`index.ts`) 서버 구조 유지.
- AI API 응답을 후처리 없이 그대로 반환하지 마라 — 반드시 파이프라인을 거쳐야 한다.
- `MAX_TOKENS` finishReason을 조용히 무시하지 마라 — Google Gemini 응답에서 명시적으로 처리한다.
