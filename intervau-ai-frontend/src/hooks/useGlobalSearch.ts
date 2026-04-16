import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { SearchResult } from '../types/search.types';

interface UseGlobalSearchReturn {
    query: string;
    setQuery: (query: string) => void;
    results: SearchResult[];
    loading: boolean;
    error: string | null;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    selectedIndex: number;
    setSelectedIndex: (index: number) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    handleResultClick: (route: string) => void;
    clearSearch: () => void;
}

export function useGlobalSearch(): UseGlobalSearchReturn {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const navigate = useNavigate();

    // Debounced search function
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await api.globalSearch(searchQuery);

            if (response.success && response.data) {
                setResults(response.data.results || []);
            } else {
                setError(response.error || 'Failed to search');
                setResults([]);
            }
        } catch (err: any) {
            console.error('Search error:', err);
            setError(err.message || 'An error occurred');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce search
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (query.trim()) {
            setIsOpen(true);
            debounceTimerRef.current = setTimeout(() => {
                performSearch(query);
            }, 300);
        } else {
            setResults([]);
            setLoading(false);
            setIsOpen(false);
        }

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [query, performSearch]);

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!isOpen || results.length === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev < results.length - 1 ? prev + 1 : prev
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedIndex >= 0 && results[selectedIndex]) {
                        handleResultClick(results[selectedIndex].route);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    setIsOpen(false);
                    setQuery('');
                    setSelectedIndex(-1);
                    break;
            }
        },
        [isOpen, results, selectedIndex]
    );

    // Navigate to selected result
    const handleResultClick = useCallback(
        (route: string) => {
            navigate(route);
            setIsOpen(false);
            setQuery('');
            setSelectedIndex(-1);
            setResults([]);
        },
        [navigate]
    );

    // Clear search
    const clearSearch = useCallback(() => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        setSelectedIndex(-1);
        setError(null);
    }, []);

    return {
        query,
        setQuery,
        results,
        loading,
        error,
        isOpen,
        setIsOpen,
        selectedIndex,
        setSelectedIndex,
        handleKeyDown,
        handleResultClick,
        clearSearch,
    };
}
