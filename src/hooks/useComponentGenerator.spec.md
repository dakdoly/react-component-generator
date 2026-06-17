# useComponentGenerator — Spec (영속화 및 promptHistory)

## 추가 반환값

```ts
promptHistory: string[]   // 성공한 generate 요청의 프롬프트 목록 (최신순)
clearHistory: () => void  // promptHistory 초기화
```

## 동작 명세

### promptHistory
1. `generate` 성공 시: 해당 prompt를 promptHistory 맨 앞에 추가
2. 동일 prompt 재요청 시: 기존 항목 제거 후 맨 앞으로 이동 (중복 항목 없음)
3. promptHistory가 30개 초과 시: 30개로 잘라 오래된 항목 제거
4. `generate` 실패 시: promptHistory 변경 없음

### clearHistory
5. `clearHistory()` 호출 시: promptHistory 빈 배열로 초기화, components에는 영향 없음

### 영속화
6. localStorage 'rcg:components'에서 복원한 컴포넌트의 `createdAt`은 `Date` 객체여야 함
7. `clearAll()` 호출 시: components만 초기화, promptHistory는 유지
