// Error boundary component: catches JavaScript errors anywhere in the child
// component tree, logs them, and displays a fallback UI instead of crashing.

import React from "react";
import { TEXTS } from "../constants/text";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="errorBoundary">
          <h2>Something went wrong</h2>
          <p>{TEXTS.ERROR_MESSAGE}</p>
          <button onClick={() => window.location.reload()}>
            {TEXTS.ERROR_RETRY}
          </button>
          {import.meta.env.DEV && this.state.error && (
            <details style={{ marginTop: "1rem" }}>
              <summary>Error details</summary>
              <pre style={{ fontSize: "0.8rem", color: "red" }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}