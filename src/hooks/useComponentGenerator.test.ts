import { renderHook, act } from '@testing-library/react'
import { useComponentGenerator } from './useComponentGenerator'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const successResponse = () =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ code: 'const A = () => <div/>;\nrender(<A/>)' }),
  })

const errorResponse = () =>
  Promise.resolve({
    ok: false,
    json: () => Promise.resolve({ error: '서버 오류' }),
  })

describe('useComponentGenerator — promptHistory', () => {
  beforeEach(() => {
    localStorage.clear()
    mockFetch.mockImplementation(successResponse)
  })

  it('generate 성공 시 promptHistory 맨 앞에 프롬프트가 추가된다', async () => {
    const { result } = renderHook(() => useComponentGenerator())
    await act(async () => {
      await result.current.generate('버튼 만들어줘', undefined, 'anthropic')
    })
    expect(result.current.promptHistory[0]).toBe('버튼 만들어줘')
  })

  it('여러 프롬프트 입력 시 최신순으로 정렬된다', async () => {
    const { result } = renderHook(() => useComponentGenerator())
    await act(async () => {
      await result.current.generate('첫 번째', undefined, 'anthropic')
      await result.current.generate('두 번째', undefined, 'anthropic')
    })
    expect(result.current.promptHistory[0]).toBe('두 번째')
    expect(result.current.promptHistory[1]).toBe('첫 번째')
  })

  it('동일 prompt 재요청 시 중복 없이 맨 앞으로 이동한다', async () => {
    const { result } = renderHook(() => useComponentGenerator())
    await act(async () => {
      await result.current.generate('프롬프트 A', undefined, 'anthropic')
      await result.current.generate('프롬프트 B', undefined, 'anthropic')
      await result.current.generate('프롬프트 A', undefined, 'anthropic')
    })
    expect(result.current.promptHistory[0]).toBe('프롬프트 A')
    expect(result.current.promptHistory.filter(p => p === '프롬프트 A')).toHaveLength(1)
  })

  it('30개 초과 시 오래된 항목이 제거되어 30개를 유지한다', async () => {
    const { result } = renderHook(() => useComponentGenerator())
    for (let i = 0; i < 31; i++) {
      await act(async () => {
        await result.current.generate(`프롬프트 ${i}`, undefined, 'anthropic')
      })
    }
    expect(result.current.promptHistory).toHaveLength(30)
    expect(result.current.promptHistory[0]).toBe('프롬프트 30')
    expect(result.current.promptHistory).not.toContain('프롬프트 0')
  })

  it('generate 실패 시 promptHistory가 변경되지 않는다', async () => {
    mockFetch.mockImplementationOnce(errorResponse)
    const { result } = renderHook(() => useComponentGenerator())
    await act(async () => {
      await result.current.generate('실패 프롬프트', undefined, 'anthropic')
    })
    expect(result.current.promptHistory).toHaveLength(0)
  })

  it('clearHistory 호출 시 promptHistory가 빈 배열이 되고 components는 유지된다', async () => {
    const { result } = renderHook(() => useComponentGenerator())
    await act(async () => {
      await result.current.generate('프롬프트', undefined, 'anthropic')
    })
    act(() => {
      result.current.clearHistory()
    })
    expect(result.current.promptHistory).toHaveLength(0)
    expect(result.current.components).toHaveLength(1)
  })

  it('clearAll 호출 시 components는 초기화되지만 promptHistory는 유지된다', async () => {
    const { result } = renderHook(() => useComponentGenerator())
    await act(async () => {
      await result.current.generate('프롬프트', undefined, 'anthropic')
    })
    act(() => {
      result.current.clearAll()
    })
    expect(result.current.components).toHaveLength(0)
    expect(result.current.promptHistory).toHaveLength(1)
  })
})

describe('useComponentGenerator — createdAt 역직렬화', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('localStorage에서 복원한 컴포넌트의 createdAt은 Date 객체다', () => {
    const stored = [
      {
        id: 'test-id',
        prompt: '테스트',
        code: 'render(<div/>)',
        createdAt: new Date('2024-01-01').toISOString(),
      },
    ]
    localStorage.setItem('rcg:components', JSON.stringify(stored))
    const { result } = renderHook(() => useComponentGenerator())
    expect(result.current.components[0].createdAt).toBeInstanceOf(Date)
  })
})
