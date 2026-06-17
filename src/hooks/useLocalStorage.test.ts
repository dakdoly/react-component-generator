import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('localStorage에 key가 없으면 initialValue를 반환한다', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('localStorage에 기존 값이 있으면 파싱된 값을 반환한다', () => {
    localStorage.setItem('k', JSON.stringify('stored'))
    const { result } = renderHook(() => useLocalStorage('k', 'default'))
    expect(result.current[0]).toBe('stored')
  })

  it('reviver 함수가 있으면 파싱 후 reviver를 거쳐 반환한다', () => {
    localStorage.setItem('k', JSON.stringify({ date: '2024-01-01T00:00:00.000Z' }))
    const reviver = (raw: unknown) => {
      const r = raw as { date: string }
      return { date: new Date(r.date) }
    }
    const { result } = renderHook(() =>
      useLocalStorage('k', { date: new Date(0) }, reviver)
    )
    expect(result.current[0].date).toBeInstanceOf(Date)
  })

  it('setter 호출 시 state와 localStorage가 동시에 업데이트된다', () => {
    const { result } = renderHook(() => useLocalStorage('k', ''))
    act(() => {
      result.current[1]('new-value')
    })
    expect(result.current[0]).toBe('new-value')
    expect(JSON.parse(localStorage.getItem('k')!)).toBe('new-value')
  })

  it('setter에 함수를 전달하면 이전 값 기반으로 업데이트된다', () => {
    const { result } = renderHook(() => useLocalStorage('k', 1))
    act(() => {
      result.current[1](prev => prev + 1)
    })
    expect(result.current[0]).toBe(2)
    expect(JSON.parse(localStorage.getItem('k')!)).toBe(2)
  })

  it('JSON 파싱 실패 시 initialValue를 반환한다', () => {
    localStorage.setItem('k', 'invalid{json')
    const { result } = renderHook(() => useLocalStorage('k', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })

  it('localStorage.setItem 실패 시 state 업데이트는 유지된다', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    const { result } = renderHook(() => useLocalStorage('k', ''))
    act(() => {
      result.current[1]('value')
    })
    expect(result.current[0]).toBe('value')
    spy.mockRestore()
  })
})
