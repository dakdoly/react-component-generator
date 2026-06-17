import { useState, useCallback } from 'react';
import type { GeneratedComponent, Provider, UseComponentGeneratorReturn } from '../types';
import { useLocalStorage } from './useLocalStorage';

const MAX_HISTORY = 30;

type RawComponent = Omit<GeneratedComponent, 'createdAt'> & { createdAt: string };

function reviveComponents(raw: unknown): GeneratedComponent[] {
  return (raw as RawComponent[]).map((c) => ({ ...c, createdAt: new Date(c.createdAt) }));
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = useLocalStorage<GeneratedComponent[]>(
    'rcg:components',
    [],
    reviveComponents,
  );
  const [promptHistory, setPromptHistory] = useLocalStorage<string[]>('rcg:promptHistory', []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (prompt: string, apiKey: string | undefined, provider: Provider) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to generate component');
        }

        const newComponent: GeneratedComponent = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          prompt,
          code: data.code,
          createdAt: new Date(),
        };

        setComponents((prev) => [newComponent, ...prev].slice(0, MAX_HISTORY));
        setPromptHistory((prev) => {
          const deduped = prev.filter((p) => p !== prompt);
          return [prompt, ...deduped].slice(0, MAX_HISTORY);
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [setComponents, setPromptHistory],
  );

  const removeComponent = useCallback(
    (id: string) => {
      setComponents((prev) => prev.filter((c) => c.id !== id));
    },
    [setComponents],
  );

  const clearAll = useCallback(() => {
    setComponents([]);
  }, [setComponents]);

  const clearHistory = useCallback(() => {
    setPromptHistory([]);
  }, [setPromptHistory]);

  return {
    components,
    isLoading,
    error,
    generate,
    removeComponent,
    clearAll,
    promptHistory,
    clearHistory,
  };
}
