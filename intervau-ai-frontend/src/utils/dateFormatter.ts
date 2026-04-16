/**
 * Format a date string to a human-readable format (e.g., "2 weeks ago")
 */
export function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Less than a minute
    if (seconds < 60) {
        return 'just now';
    }

    // Minutes
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    // Hours
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Days
    const days = Math.floor(hours / 24);
    if (days < 7) {
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }

    // Weeks
    const weeks = Math.floor(days / 7);
    if (weeks < 4) {
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }

    // Months
    const months = Math.floor(days / 30);
    if (months < 12) {
        return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }

    // Years
    const years = Math.floor(days / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

/**
 * Format a date string to "Month Day, Year" format
 * Example: "2024-03-10T12:00:00.000Z" => "March 10, 2024"
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return 'Invalid date';
    }

    const options: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    };

    return date.toLocaleDateString('en-US', options);
}
