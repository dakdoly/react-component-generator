@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

```bash
# 의존성 설치 (패키지 매니저: bun)
bun install

# 개발 서버 실행 (API 서버 + Vite 동시 실행)
bun run dev

# 타입 체크 + 빌드
bun run build

# 린트
bun run lint
```

- Frontend: `http://localhost:5173`
- API 서버: `http://localhost:3002`

## 아키텍처

**이중 서버 구조**

- `server/index.ts` — Bun HTTP 서버 (포트 3002). AI API 프록시 역할. `.env`에서 API 키 로드 후 Anthropic/Google API 직접 호출.
- Vite dev 서버 (포트 5173). `/api` 경로를 3002으로 프록시 (`vite.config.ts`).

**AI 코드 생성 흐름**

1. 사용자가 프롬프트 입력 → `useComponentGenerator` 훅이 `/api/generate` POST 요청
2. `server/index.ts`가 provider에 따라 `callAnthropic()` 또는 `callGoogle()` 호출
3. 서버가 응답 코드에서 코드 펜스 제거(`stripCodeFences`) 후 `render()` 호출 보장(`ensureRenderCall`)
4. 반환된 코드를 `react-live`로 브라우저에서 런타임 렌더링

**컴포넌트 구조**

```
App.tsx               — 레이아웃, provider/apiKey(localStorage) 상태, envKeys 조회
PromptInput           — 프롬프트 입력 폼 + 최근 프롬프트 히스토리 칩
ComponentCard         — 생성된 컴포넌트 카드 (재생성/삭제 포함)
LivePreview           — react-live로 코드 실행 및 렌더링
CodeView              — 생성된 코드 표시
useComponentGenerator — components·promptHistory 영속화, generate·clearAll·clearHistory
useLocalStorage       — localStorage 동기화 제네릭 훅 (reviver 지원)
```

## AI 생성 코드 제약사항

`server/index.ts`의 시스템 프롬프트에 명시된 규칙:
- import 문 사용 금지 (React는 전역으로 제공됨)
- 인라인 스타일만 사용 (CSS 파일/모듈 금지)
- TypeScript 문법 금지 (순수 JavaScript)
- 파일 끝에 반드시 `render(<ComponentName />)` 호출 포함

## 환경 변수

`.env.local` 파일에 설정:
```
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

키 미설정 시 UI에서 직접 입력 가능. `GET /api/config`로 서버 키 존재 여부 확인.
