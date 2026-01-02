import React from 'react';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function QueryErrorResetBoundary({ children }) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="p-6 max-w-2xl mx-auto">
          <Alert className="border-red-300 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-900">
              <div className="font-semibold mb-2">Query Error</div>
              <div className="text-sm mb-4">{error.message}</div>
              <Button
                onClick={resetErrorBoundary}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Query error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallbackRender({
        error: this.state.error,
        resetErrorBoundary: () => {
          this.setState({ hasError: false, error: null });
          this.props.onReset?.();
        }
      });
    }

    return this.props.children;
  }
}