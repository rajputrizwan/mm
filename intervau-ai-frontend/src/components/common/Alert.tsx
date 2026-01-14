import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

export default function Alert({ variant = 'info', title, children, onClose }: AlertProps) {
  const config = {
    info: {
      icon: Info,
      classes: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
      iconClasses: 'text-blue-500 dark:text-blue-400',
    },
    success: {
      icon: CheckCircle,
      classes: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
      iconClasses: 'text-green-500 dark:text-green-400',
    },
    warning: {
      icon: AlertTriangle,
      classes: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
      iconClasses: 'text-yellow-500 dark:text-yellow-400',
    },
    error: {
      icon: AlertCircle,
      classes: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
      iconClasses: 'text-red-500 dark:text-red-400',
    },
  };

  const { icon: Icon, classes, iconClasses } = config[variant];

  return (
    <div className={`rounded-lg border p-4 ${classes}`}>
      <div className="flex items-start">
        <Icon className={`w-5 h-5 flex-shrink-0 ${iconClasses} mt-0.5`} />
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-semibold mb-1">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
