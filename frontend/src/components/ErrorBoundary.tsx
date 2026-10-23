'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: (error: Error, resetError: () => void) => ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Structured error logging with component stack
    if (typeof window !== 'undefined' && 'console' in window) {
      console.groupCollapsed('%c[ErrorBoundary]', 'color: red; font-weight: bold;', error.message)
      console.error('Error:', error)
      console.error('Component Stack:', errorInfo.componentStack)
      console.error('Error Info:', errorInfo)
      console.groupEnd()
    }
    
    this.setState({
      error,
      errorInfo,
    })

    // TODO: Send error to logging service (Sentry, LogRocket, etc)
    // Example: logErrorToService(error, errorInfo)
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError)
      }

      // Default error UI
      return (
        <div style={{
          padding: '2rem',
          maxWidth: '800px',
          margin: '0 auto',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            backgroundColor: '#fee',
            border: '2px solid #c00',
            borderRadius: '8px',
            padding: '1.5rem'
          }}>
            <h1 style={{ 
              color: '#c00', 
              marginTop: 0,
              fontSize: '1.5rem'
            }}>
              Something went wrong
            </h1>
            
            <p style={{ color: '#333', marginBottom: '1rem' }}>
              The application encountered an unexpected error. Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <>
                <details style={{ marginTop: '1rem' }}>
                  <summary style={{ 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: '#666',
                    marginBottom: '0.5rem'
                  }}>
                    Error Details (Development Only)
                  </summary>
                  
                  <pre style={{
                    backgroundColor: '#f5f5f5',
                    padding: '1rem',
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '0.875rem',
                    lineHeight: '1.5'
                  }}>
                    <strong>Error:</strong> {this.state.error.toString()}
                    {'\n\n'}
                    <strong>Stack:</strong>
                    {'\n'}
                    {this.state.error.stack}
                    {this.state.errorInfo && (
                      <>
                        {'\n\n'}
                        <strong>Component Stack:</strong>
                        {'\n'}
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </details>
              </>
            )}

            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#c00',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  marginRight: '0.5rem'
                }}
              >
                Refresh Page
              </button>
              
              <button
                onClick={this.resetError}
                style={{
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
