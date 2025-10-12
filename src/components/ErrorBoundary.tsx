import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, ErrorBoundaryState> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Możesz logować błąd do zewnętrznego serwisu
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 30, color: 'red', background: '#fffbe6', borderRadius: 8 }}>
          <h2>Wystąpił błąd w analizie!</h2>
          <pre>{String(this.state.error)}</pre>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Spróbuj ponownie
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
