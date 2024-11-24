import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Logger } from '@/cogutil/Logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class VisualizationErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Logger.error('Visualization error:', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-destructive/15 text-destructive rounded-lg">
          <h3 className="font-semibold mb-2">Visualization Error</h3>
          <p className="text-sm">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}