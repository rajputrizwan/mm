import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    variant?: 'flat' | 'elevated' | 'floating';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function AntiGravityCard({
    children,
    variant = 'elevated',
    hover = false,
    padding = 'md',
    className,
    ...props
}: CardProps) {
    const baseClasses = cn(
        'bg-white dark:bg-dark-100',
        'border border-neutral-200 dark:border-dark-200',
        'rounded-xl',
        'transition-all duration-200 ease-out',
    );

    const variantClasses = {
        flat: 'shadow-none',
        elevated: 'shadow-md dark:shadow-lg',
        floating: 'shadow-lg dark:shadow-xl',
    };

    const paddingClasses = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const hoverClasses = hover
        ? 'hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer'
        : '';

    return (
        <div
            className={cn(
                baseClasses,
                variantClasses[variant],
                paddingClasses[padding],
                hoverClasses,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
