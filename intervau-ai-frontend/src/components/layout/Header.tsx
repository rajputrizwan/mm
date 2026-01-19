import { Bell } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import GlobalSearch from '../common/GlobalSearch';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const { notifications } = useApp();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1">
          {title && (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <GlobalSearch />
          </div>

          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
