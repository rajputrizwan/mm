import { MessageSquare, Mic, MicOff, Send, Loader2 } from "lucide-react";
import type { Question } from "./mockSessionTypes";

interface MockSessionQuestionCardProps {
  question: Question;
  userResponse: string;
  interimTranscript: string;
  isListening: boolean;
  isAIProcessing: boolean;
  micEnabled: boolean;
  listeningPlaceholder: string;
  typeResponsePlaceholder: string;
  onUserResponseChange: (value: string) => void;
  onToggleVoiceRecognition: () => void;
  onSubmitResponse: () => void;
}

export default function MockSessionQuestionCard({
  question,
  userResponse,
  interimTranscript,
  isListening,
  isAIProcessing,
  micEnabled,
  listeningPlaceholder,
  typeResponsePlaceholder,
  onUserResponseChange,
  onToggleVoiceRecognition,
  onSubmitResponse,
}: MockSessionQuestionCardProps) {
  const canSubmit =
    (userResponse.trim() || interimTranscript) && !isAIProcessing;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">
            {question.category}
          </span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ~{question.duration} min
        </span>
      </div>
      <p className="text-lg text-gray-900 dark:text-white font-medium mb-6">
        {question.text}
      </p>

      <div className="space-y-3">
        {interimTranscript && (
          <div className="px-4 py-2 bg-gray-100/80 dark:bg-gray-700/50 rounded-lg border border-gray-300/50 dark:border-gray-600/50">
            <p className="text-gray-500 dark:text-gray-400 text-sm italic">
              {interimTranscript}...
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onToggleVoiceRecognition}
            disabled={!micEnabled}
            className={`px-4 py-3 rounded-xl transition-all ${
              isListening
                ? "bg-red-600 text-white animate-pulse"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            } ${!micEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <input
            type="text"
            value={userResponse}
            onChange={(e) => onUserResponseChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onSubmitResponse()}
            placeholder={isListening ? listeningPlaceholder : typeResponsePlaceholder}
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAIProcessing}
          />
          <button
            onClick={onSubmitResponse}
            disabled={!canSubmit}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isAIProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {isListening && (
          <div className="flex items-center justify-center space-x-2 text-red-400 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>Recording your response...</span>
          </div>
        )}
      </div>
    </div>
  );
}
