import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PromptInput } from './PromptInput'

describe('PromptInput', () => {
  it('빈 프롬프트로는 생성 버튼이 비활성화된다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} promptHistory={[]} />)
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled()
  })

  it('텍스트 입력 시 생성 버튼이 활성화된다', async () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} promptHistory={[]} />)
    await userEvent.type(screen.getByRole('textbox'), '버튼 컴포넌트')
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeEnabled()
  })

  it('폼 제출 시 trim된 프롬프트로 onGenerate를 호출한다', async () => {
    const onGenerate = vi.fn()
    render(<PromptInput onGenerate={onGenerate} isLoading={false} promptHistory={[]} />)
    await userEvent.type(screen.getByRole('textbox'), '  버튼 컴포넌트  ')
    await userEvent.click(screen.getByRole('button', { name: '컴포넌트 생성' }))
    expect(onGenerate).toHaveBeenCalledWith('버튼 컴포넌트')
  })

  it('로딩 중에는 생성 버튼이 비활성화된다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={true} promptHistory={[]} />)
    expect(screen.getByRole('button', { name: '생성 중...' })).toBeDisabled()
  })

  it('예시 프롬프트 클릭 시 textarea에 해당 텍스트가 입력된다', async () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} promptHistory={[]} />)
    const chips = screen.getAllByRole('button', { name: /SaaS/ })
    await userEvent.click(chips[0])
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toContain('SaaS')
  })
})
