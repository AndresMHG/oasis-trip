let timer: ReturnType<typeof setTimeout> | undefined

export const useToast = () => {
  const state = useState('toast', () => ({ id: 0, msg: '', kind: 'ok' as 'ok' | 'error' }))
  const show = (msg: string, kind: 'ok' | 'error' = 'ok') => {
    state.value = { id: state.value.id + 1, msg, kind }
    clearTimeout(timer)
    timer = setTimeout(() => (state.value.msg = ''), 2600)
  }
  return { state, show }
}
