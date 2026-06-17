import { useState, useCallback } from 'react';

type Setter<T> = (value: T | ((prev: T) => T)) => void;

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  reviver?: (raw: unknown) => T,
): [T, Setter<T>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return initialValue;
      const parsed: unknown = JSON.parse(item);
      // reviver가 throw해도 catch에서 initialValue로 폴백
      return reviver ? reviver(parsed) : (parsed as T);
    } catch {
      return initialValue;
    }
  });

  const setValue: Setter<T> = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // QuotaExceededError 등 조용히 무시
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}
