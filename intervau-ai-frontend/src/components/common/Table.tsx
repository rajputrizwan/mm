import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${className}`}>{children}</table>
    </div>
  );
}

export function TableHeader({ children, className = '' }: TableProps) {
  return <thead className={`bg-gray-50 dark:bg-gray-800 ${className}`}>{children}</thead>;
}

export function TableBody({ children, className = '' }: TableProps) {
  return <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = '' }: TableProps) {
  return <tr className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${className}`}>{children}</tr>;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  header?: boolean;
}

export function TableCell({ children, className = '', header = false }: TableCellProps) {
  const Tag = header ? 'th' : 'td';
  const baseClasses = header
    ? 'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'
    : 'px-6 py-4 text-sm text-gray-900 dark:text-gray-100';

  return <Tag className={`${baseClasses} ${className}`}>{children}</Tag>;
}
