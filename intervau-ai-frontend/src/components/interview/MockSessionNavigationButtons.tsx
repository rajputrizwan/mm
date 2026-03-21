import { ChevronRight, CheckCircle } from "lucide-react";

interface MockSessionNavigationButtonsProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  nextQuestionLabel: string;
  completeInterviewLabel: string;
  onNextQuestion: () => void;
  onEndSession: () => void;
}

export default function MockSessionNavigationButtons({
  currentQuestionIndex,
  totalQuestions,
  nextQuestionLabel,
  completeInterviewLabel,
  onNextQuestion,
  onEndSession,
}: MockSessionNavigationButtonsProps) {
  const hasNext = currentQuestionIndex < totalQuestions - 1;

  return (
    <>
      {hasNext && (
        <button
          onClick={onNextQuestion}
          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
        >
          <span>{nextQuestionLabel}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {!hasNext && (
        <button
          onClick={onEndSession}
          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
        >
          <CheckCircle className="w-5 h-5" />
          <span>{completeInterviewLabel}</span>
        </button>
      )}
    </>
  );
}
