import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricIndicatorProps {
  label: string;
  value: number;
  maxValue?: number;
  trend?: 'up' | 'down' | 'stable';
  color?: 'blue' | 'green' | 'orange' | 'red' | 'cyan';
  showTrend?: boolean;
  variant?: 'bar' | 'circular' | 'badge';
}

export default function MetricIndicator({
  label,
  value,
  maxValue = 100,
  trend,
  color = 'blue',
  showTrend = false,
  variant = 'bar'
}: MetricIndicatorProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  const colorClasses = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-100' },
    green: { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-100' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-100' },
    red: { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-100' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', light: 'bg-cyan-100' }
  };

  const getTrendIcon = () => {
    if (!trend || !showTrend) return null;
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3.5 h-3.5 text-green-300" />;
      case 'down':
        return <TrendingDown className="w-3.5 h-3.5 text-red-300" />;
      case 'stable':
        return <Minus className="w-3.5 h-3.5 text-white/60" />;
    }
  };

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center space-x-2 ${colorClasses[color].light} ${colorClasses[color].text} px-3 py-1.5 rounded-full`}>
        <span className="text-xs font-semibold">{label}</span>
        <span className="text-xs font-bold">{value}%</span>
        {getTrendIcon()}
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-2">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 32}`}
              strokeDashoffset={`${2 * Math.PI * 32 * (1 - percentage / 100)}`}
              className={colorClasses[color].text}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${colorClasses[color].text}`}>
              {value}%
            </span>
          </div>
        </div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {showTrend && getTrendIcon()}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white/95">{label}</span>
          {getTrendIcon()}
        </div>
        <span className="text-base font-bold text-white">
          {value}%
        </span>
      </div>
      <div className="w-full bg-white/20 rounded-full h-2.5 backdrop-blur-sm">
        <div
          className="bg-white h-2.5 rounded-full transition-all duration-500 shadow-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
