import { useState, useEffect } from 'react';
import api from '../services/api';
import { CandidateApplication, CandidateStats, CandidateFilters } from '../types/candidate';

interface UseCandidateApplicationsReturn {
    applications: CandidateApplication[];
    stats: CandidateStats;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useCandidateApplications(
    filters: CandidateFilters
): UseCandidateApplicationsReturn {
    const [applications, setApplications] = useState<CandidateApplication[]>([]);
    const [stats, setStats] = useState<CandidateStats>({
        totalCount: 0,
        qualifiedCount: 0,
        interviewingCount: 0,
        averageScore: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.getCandidateApplications(filters);

            if (response.success && response.data) {
                setApplications(response.data.applications || []);
                setStats(response.data.stats || {
                    totalCount: 0,
                    qualifiedCount: 0,
                    interviewingCount: 0,
                    averageScore: 0,
                });
            } else {
                setError(response.message || 'Failed to fetch applications');
            }
        } catch (err: any) {
            console.error('Error fetching applications:', err);
            setError(err.message || 'An error occurred');
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounced fetch for search
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchApplications();
        }, 300); // 300ms debounce

        return () => clearTimeout(debounceTimer);
    }, [filters.search, filters.status, filters.sortBy]);

    return {
        applications,
        stats,
        loading,
        error,
        refetch: fetchApplications,
    };
}
