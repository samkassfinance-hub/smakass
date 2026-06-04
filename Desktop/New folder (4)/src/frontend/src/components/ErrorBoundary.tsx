import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "20px",
            backgroundColor: "#f7f4ef",
            color: "#1a1614",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: "400px",
              padding: "24px",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "800",
                marginBottom: "12px",
                color: "#1a1614",
              }}
            >
              <span style={{ color: "#1a1614" }}>Kaas</span>
              <span style={{ color: "#f59e0b" }}>Flow</span>
            </h1>
            <p style={{ fontSize: "16px", marginBottom: "16px", color: "#6b6560" }}>
              Something went wrong loading the app
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 24px",
                backgroundColor: "#f59e0b",
                color: "#0a0e1a",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Reload Page
            </button>
            {this.state.error && (
              <details style={{ marginTop: "16px", textAlign: "left" }}>
                <summary
                  style={{
                    cursor: "pointer",
                    fontSize: "12px",
                    color: "#6b6560",
                  }}
                >
                  Technical Details
                </summary>
                <pre
                  style={{
                    fontSize: "11px",
                    color: "#6b6560",
                    overflow: "auto",
                    marginTop: "8px",
                    padding: "8px",
                    backgroundColor: "#f7f4ef",
                    borderRadius: "8px",
                  }}
                >
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
