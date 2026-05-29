import { Component, ErrorInfo, ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('[ErrorBoundary]', error, info, info.componentStack) }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: 40, textAlign: 'center', color: '#9E9EB8', maxWidth: 500, margin: '0 auto' }}>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>页面出现异常</p>
          <p style={{ fontSize: 12, color: '#FF6B6B', background: '#FFF0F0', padding: '8px 12px', borderRadius: 8, marginBottom: 12, wordBreak: 'break-all' }}>
            {this.state.error?.message || '未知错误'}
          </p>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #E8E8EC', background: '#fff', cursor: 'pointer', fontSize: 13 }}>
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
