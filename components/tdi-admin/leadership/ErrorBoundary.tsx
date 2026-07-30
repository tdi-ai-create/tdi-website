'use client'

import { Component, type ReactNode } from 'react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallbackMessage?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Partnership detail error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-lg mx-auto text-center">
          <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#FEE2E2' }}>
            <span style={{ color: '#DC2626', fontSize: 20, fontWeight: 700 }}>!</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-4">
            {this.props.fallbackMessage || 'An error occurred loading this section. Try refreshing the page.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 text-sm font-medium rounded-lg"
              style={{ background: '#1e2749', color: 'white' }}
            >
              Try again
            </button>
            <Link
              href="/tdi-admin/leadership"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700"
            >
              Back to dashboard
            </Link>
          </div>
          {this.state.error && (
            <p className="text-xs text-gray-400 mt-4 font-mono">{this.state.error.message}</p>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
