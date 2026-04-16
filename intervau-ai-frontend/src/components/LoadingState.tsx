import { ReactNode } from "react";

interface LoadingStateProps {
  isLoading: boolean;
  children: ReactNode;
  loadingComponent?: ReactNode;
}

export default function LoadingState({
  isLoading,
  children,
  loadingComponent,
}: LoadingStateProps) {
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading...
            </h2>
            <p className="text-gray-500">
              Please wait while we load your content
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
