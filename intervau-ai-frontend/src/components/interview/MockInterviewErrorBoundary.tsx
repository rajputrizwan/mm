import { Component, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { ROUTES } from "../../router";

interface Props {
  children: ReactNode;
  sessionId?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class MockInterviewErrorBoundary extends Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("MockInterviewSession Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoBack = () => {
    window.history.back();
  };

  handleGoHome = () => {
    window.location.href = ROUTES.MOCK_INTERVIEW;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
          <div className="max-w-lg w-full bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-white mb-3 text-center">
              Interview Session Error
            </h1>
            <p className="text-gray-400 mb-6 text-center">
              Something went wrong during your mock interview session. Don't
              worry, your progress may have been saved.
            </p>

            {/* Error Details (collapsible in dev) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <summary className="text-gray-300 cursor-pointer text-sm font-medium">
                  Technical Details
                </summary>
                <pre className="mt-3 text-xs text-red-400 overflow-auto max-h-32">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={this.handleGoBack}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors font-medium border border-gray-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Go Back</span>
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors font-medium border border-gray-700"
                >
                  <Home className="w-5 h-5" />
                  <span>Mock Interviews</span>
                </button>
              </div>
            </div>

            {/* Help Text */}
            <p className="text-gray-500 text-sm text-center mt-6">
              If this problem persists, please try refreshing the page or
              starting a new session.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
