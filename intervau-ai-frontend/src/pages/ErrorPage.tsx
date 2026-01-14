import { XCircle, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorPage({ message, onRetry }: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mb-6">
          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Something Went Wrong</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {message || "We're experiencing technical difficulties. Please try again later."}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
}
