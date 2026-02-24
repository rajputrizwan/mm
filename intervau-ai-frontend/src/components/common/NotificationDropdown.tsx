import { useEffect, useRef } from 'react';
import {
    Bell,
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    Info,
    X,
    Check,
    Trash2,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
    const {
        notifications,
        removeNotification,
        clearNotifications,
        markAsRead,
        markAllAsRead,
        unreadCount,
    } = useApp();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Bell panel only shows persistent (non-transient) notifications
    const panelNotifications = notifications.filter((n) => n.persistent);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Format relative time
    const formatRelativeTime = (date: Date): string => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        warning: AlertTriangle,
        info: Info,
    };

    const iconColors = {
        success: 'text-green-500',
        error: 'text-red-500',
        warning: 'text-yellow-500',
        info: 'text-blue-500',
    };

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
                            {unreadCount} new
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-1">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            title="Mark all as read"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    )}
                    {panelNotifications.length > 0 && (
                        <button
                            onClick={clearNotifications}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            title="Clear all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
                {panelNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            You're all caught up!
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {panelNotifications.map((notification) => {
                            const Icon = icons[notification.type];
                            return (
                                <div
                                    key={notification.id}
                                    className={`flex items-start space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                        }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className={`flex-shrink-0 mt-0.5 ${iconColors[notification.type]}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {notification.title && (
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {notification.title}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {formatRelativeTime(notification.timestamp)}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        {!notification.read && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeNotification(notification.id);
                                            }}
                                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            {panelNotifications.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                        {panelNotifications.length} notification{panelNotifications.length !== 1 ? 's' : ''}
                    </p>
                </div>
            )}
        </div>
    );
}
