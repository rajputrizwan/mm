import { Clock, MessageSquare } from 'lucide-react';

interface QuestionCardProps {
  question: string;
  category: string;
  duration?: string;
  number?: number;
  total?: number;
  variant?: 'default' | 'compact';
}

export default function QuestionCard({
  question,
  category,
  duration,
  number,
  total,
  variant = 'default'
}: QuestionCardProps) {
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors">
        <div className="flex items-start justify-between mb-2">
          {number && total && (
            <span className="text-xs font-semibold text-gray-500">Q{number}/{total}</span>
          )}
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
            {category}
          </span>
        </div>
        <p className="text-sm text-gray-700 line-clamp-2">{question}</p>
        {duration && (
          <div className="flex items-center space-x-1 text-gray-500 text-xs mt-2">
            <Clock className="w-3 h-3" />
            <span>{duration}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-start space-x-3">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg flex-shrink-0">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">
              {number && total ? `Question ${number} of ${total}` : 'Current Question'}
            </h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
              {category}
            </span>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            {question}
          </p>
          {duration && (
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <Clock className="w-4 h-4" />
              <span>Recommended time: {duration}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
