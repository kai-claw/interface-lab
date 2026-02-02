import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center"
        >
          <span className="text-4xl">⚠️</span>
          <h3 className="text-lg font-bold text-[var(--color-text)]">
            Experiment Crashed
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md">
            {this.state.error?.message || 'Something went wrong rendering this experiment.'}
          </p>
          <button
            className="px-6 py-2 rounded-lg font-medium text-sm cursor-pointer border-0 transition-colors"
            style={{ background: 'var(--color-accent)', color: 'white' }}
            onClick={this.handleRetry}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
