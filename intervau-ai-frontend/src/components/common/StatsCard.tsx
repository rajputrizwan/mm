import { LucideIcon } from 'lucide-react';
import Card from './Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function StatsCard({ title, value, change, icon: Icon, color = 'from-blue-500 to-cyan-500', trend }: StatsCardProps) {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <Card hover>
      <div className="flex items-start justify-between mb-4">
        <div className={`bg-gradient-to-br ${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
      {change && (
        <p className={`text-xs font-medium ${trend ? trendColors[trend] : 'text-gray-500 dark:text-gray-500'}`}>
          {change}
        </p>
      )}
    </Card>
  );
}
