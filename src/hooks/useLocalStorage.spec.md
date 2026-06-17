# useLocalStorage — Spec

## 인터페이스

```ts
function useLocalStorage<T>(
  key: string,
  initialValue: T,
  reviver?: (raw: unknown) => T
): [T, Setter<T>]

type Setter<T> = (value: T | ((prev: T) => T)) => void
```

## 동작 명세

### 초기화
1. localStorage에 key가 없으면 `initialValue` 반환
2. localStorage에 유효한 JSON이 있으면 파싱된 값 반환
3. `reviver` 함수가 있으면 파싱 후 reviver를 거쳐 반환
4. JSON 파싱 실패 시 `initialValue` 반환 (에러 throw 금지)

### setter
5. `setter(value)` 호출: state를 value로 업데이트 + `localStorage.setItem` 호출
6. `setter(prev => next)` 호출: 이전 state 기반으로 업데이트 + localStorage 반영
7. `localStorage.setItem` 실패(QuotaExceededError 등) 시 state 업데이트는 유지, 에러 throw 금지
