import { Clock } from "lucide-react";

interface MockSessionHeaderProps {
  elapsedTime: number;
  maxDuration: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  isSpeaking: boolean;
  recordingLabel: string;
  speakingLabel: string;
  questionOfLabel: string;
  formatTime: (seconds: number) => string;
}

export default function MockSessionHeader({
  elapsedTime,
  maxDuration,
  currentQuestionIndex,
  totalQuestions,
  isSpeaking,
  recordingLabel,
  speakingLabel,
  questionOfLabel,
  formatTime,
}: MockSessionHeaderProps) {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-4 py-2 rounded-lg font-medium">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span>{recordingLabel}</span>
          </div>
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
            <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              {formatTime(elapsedTime)}
            </span>
            <span className="text-gray-400 dark:text-gray-500">/</span>
            <span className="text-gray-500 dark:text-gray-400">
              {formatTime(maxDuration)}
            </span>
          </div>
          {isSpeaking && (
            <div className="flex items-center space-x-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 px-4 py-2 rounded-lg font-medium">
              <div className="flex space-x-1">
                <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" />
                <div
                  className="w-1 h-4 bg-green-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-1 h-4 bg-green-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
              <span>{speakingLabel}</span>
            </div>
          )}
        </div>
        <div className="text-gray-500 dark:text-gray-400 font-medium">
          {questionOfLabel}
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 shadow-inner">
        <div
          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 shadow-lg"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
