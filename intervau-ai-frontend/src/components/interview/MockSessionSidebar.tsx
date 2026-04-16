import { Sparkles, AlertCircle, FileText, MessageSquare } from "lucide-react";
import type {
  Question,
  TranscriptEntry,
  LiveMetrics,
  RealTimeTip,
} from "./mockSessionTypes";

interface MetricItem {
  key: string;
  label: string;
  value: number;
}

interface MockSessionSidebarProps {
  liveMetrics: LiveMetrics;
  metricLabels: Record<keyof LiveMetrics, string>;
  realTimeTips: RealTimeTip[];
  questions: Question[];
  currentQuestionIndex: number;
  transcript: TranscriptEntry[];
  liveAIAnalysisTitle: string;
  realTimeTipsTitle: string;
  questionListTitle: string;
  liveTranscriptTitle: string;
  transcriptPlaceholder: string;
}

export default function MockSessionSidebar({
  liveMetrics,
  metricLabels,
  realTimeTips,
  questions,
  currentQuestionIndex,
  transcript,
  liveAIAnalysisTitle,
  realTimeTipsTitle,
  questionListTitle,
  liveTranscriptTitle,
  transcriptPlaceholder,
}: MockSessionSidebarProps) {
  const metricEntries: MetricItem[] = (Object.keys(liveMetrics) as (keyof LiveMetrics)[]).map(
    (key) => ({
      key,
      label: metricLabels[key],
      value: liveMetrics[key],
    }),
  );

  return (
    <div className="space-y-6">
      {/* Live AI Analysis */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">{liveAIAnalysisTitle}</h3>
        </div>
        <div className="space-y-4">
          {metricEntries.map(({ key, label, value }) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize">{label}</span>
                <span>{Math.round(value)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Tips */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <AlertCircle className="w-4 h-4 text-orange-400" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {realTimeTipsTitle}
          </h4>
        </div>
        <div className="space-y-2">
          {realTimeTips.map((tip, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border transition-all ${
                tip.type === "success"
                  ? "bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-800"
                  : tip.type === "warning"
                    ? "bg-orange-100 border-orange-300 dark:bg-orange-900/20 dark:border-orange-800"
                    : "bg-blue-100 border-blue-300 dark:bg-blue-900/20 dark:border-blue-800"
              }`}
            >
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {tip.message}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Question List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {questionListTitle}
          </h4>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className={`p-3 rounded-lg border transition-all ${
                idx === currentQuestionIndex
                  ? "bg-blue-50 border-blue-300 ring-2 ring-blue-400 dark:bg-blue-900/30 dark:border-blue-700 dark:ring-blue-800"
                  : idx < currentQuestionIndex
                    ? "bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-800"
                    : "bg-gray-100 border-gray-200 dark:bg-gray-700 dark:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  Q{idx + 1}
                </span>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400">
                  {q.category}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                {q.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Transcript */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {liveTranscriptTitle}
          </h4>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {transcript.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
              {transcriptPlaceholder}
            </p>
          ) : (
            transcript.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 rounded-lg ${
                  entry.isCandidate
                    ? "bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-700"
                    : "bg-gray-100 border border-gray-200 dark:bg-gray-700/60 dark:border-gray-600"
                }`}
              >
                <div className="flex justify-between text-xs mb-1">
                  <span
                    className={`font-semibold ${entry.isCandidate ? "text-blue-500 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"}`}
                  >
                    {entry.speaker}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">
                    {entry.time}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {entry.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
