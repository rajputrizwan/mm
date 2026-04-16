import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../common/Card';

interface MetricData {
  name: string;
  value: number;
  change?: number;
}

interface LiveAIAnalysisProps {
  metrics: MetricData[];
}

export default function LiveAIAnalysis({ metrics }: LiveAIAnalysisProps) {
  const getMetricColor = (name: string, value: number) => {
    const metricColors: Record<string, { bg: string; bar: string; text: string; badge: string }> = {
      confidence: {
        bg: 'bg-blue-50 dark:bg-blue-900/10',
        bar: 'bg-gradient-to-r from-blue-500 to-blue-600',
        text: 'text-blue-700 dark:text-blue-400',
        badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
      },
      clarity: {
        bg: 'bg-teal-50 dark:bg-teal-900/10',
        bar: 'bg-gradient-to-r from-teal-500 to-teal-600',
        text: 'text-teal-700 dark:text-teal-400',
        badge: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
      },
      pace: {
        bg: 'bg-cyan-50 dark:bg-cyan-900/10',
        bar: 'bg-gradient-to-r from-cyan-500 to-cyan-600',
        text: 'text-cyan-700 dark:text-cyan-400',
        badge: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800',
      },
      'eye contact': {
        bg: 'bg-green-50 dark:bg-green-900/10',
        bar: 'bg-gradient-to-r from-green-500 to-green-600',
        text: 'text-green-700 dark:text-green-400',
        badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800',
      },
      'technical accuracy': {
        bg: 'bg-blue-50 dark:bg-blue-900/10',
        bar: 'bg-gradient-to-r from-blue-600 to-cyan-600',
        text: 'text-blue-700 dark:text-blue-400',
        badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
      },
      articulation: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/10',
        bar: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
        text: 'text-emerald-700 dark:text-emerald-400',
        badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
      },
    };

    const key = name.toLowerCase();
    return metricColors[key] || metricColors.confidence;
  };

  const getPerformanceLevel = (value: number): { label: string; color: string } => {
    if (value >= 80) return { label: 'Excellent', color: 'text-green-600 dark:text-green-400' };
    if (value >= 60) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400' };
    if (value >= 40) return { label: 'Fair', color: 'text-yellow-600 dark:text-yellow-400' };
    return { label: 'Needs Improvement', color: 'text-red-600 dark:text-red-400' };
  };

  const getTrendIcon = (change?: number) => {
    if (!change) return <Minus className="w-3.5 h-3.5" />;
    if (change > 0) return <TrendingUp className="w-3.5 h-3.5" />;
    return <TrendingDown className="w-3.5 h-3.5" />;
  };

  const getTrendColor = (change?: number) => {
    if (!change) return 'text-gray-500 dark:text-gray-400';
    if (change > 0) return 'text-green-600 dark:text-green-400';
    return 'text-red-600 dark:text-red-400';
  };

  const overallScore = Math.round(metrics.reduce((acc, m) => acc + m.value, 0) / metrics.length);
  const performanceLevel = getPerformanceLevel(overallScore);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Live AI Analysis</CardTitle>
          <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${performanceLevel.color} bg-gray-100 dark:bg-gray-800`}>
            {performanceLevel.label}
          </div>
        </div>
      </CardHeader>

      <div className="space-y-5 mt-6">
        {metrics.map((metric) => {
          const colors = getMetricColor(metric.name, metric.value);
          return (
            <div key={metric.name} className={`p-4 rounded-lg ${colors.bg} transition-all duration-200`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {metric.name}
                  </span>
                  {metric.change !== undefined && (
                    <span className={`flex items-center space-x-1 text-xs font-medium px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 ${getTrendColor(metric.change)}`}>
                      {getTrendIcon(metric.change)}
                      <span>{Math.abs(metric.change)}%</span>
                    </span>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${colors.badge}`}>
                  {metric.value}%
                </div>
              </div>

              <div className="relative">
                <div className="w-full h-2.5 bg-white dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors.bar} rounded-full transition-all duration-700 ease-out relative`}
                    style={{ width: `${metric.value}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Score</span>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Average performance</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {overallScore}%
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
