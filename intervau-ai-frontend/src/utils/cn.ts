import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * 
 * Combines clsx for conditional classes and tailwind-merge for conflict resolution
 * 
 * @example
 * cn('px-4 py-2', 'bg-blue-500', { 'text-white': true })
 * // Returns: 'px-4 py-2 bg-blue-500 text-white'
 * 
 * cn('px-4', 'px-6') // tailwind-merge resolves conflict
 * // Returns: 'px-6' (not 'px-4 px-6')
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
