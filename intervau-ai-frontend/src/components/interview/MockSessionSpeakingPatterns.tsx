import { BarChart3 } from "lucide-react";
import type { SpeakingPatterns } from "./mockSessionTypes";

interface MockSessionSpeakingPatternsProps {
  patterns: SpeakingPatterns;
  title: string;
  fillerWordsLabel: string;
  avgResponseLabel: string;
  totalWordsLabel: string;
  wordsPerMinuteLabel: string;
}

export default function MockSessionSpeakingPatterns({
  patterns,
  title,
  fillerWordsLabel,
  avgResponseLabel,
  totalWordsLabel,
  wordsPerMinuteLabel,
}: MockSessionSpeakingPatternsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-2xl font-bold text-blue-400">
            {patterns.fillerWords}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {fillerWordsLabel}
          </p>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-2xl font-bold text-green-400">
            {patterns.avgResponseTime}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {avgResponseLabel}
          </p>
        </div>
        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <p className="text-2xl font-bold text-orange-400">
            {patterns.totalWords}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {totalWordsLabel}
          </p>
        </div>
        <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
          <p className="text-2xl font-bold text-cyan-400">
            {patterns.avgWordsPerMinute}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {wordsPerMinuteLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
