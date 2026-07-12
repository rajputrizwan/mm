import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { DashboardStats, RecentInterview, TopSkill } from '../types/dashboard';
import { useAuth } from '../contexts/AuthContext';

interface UseDashboardDataReturn {
    stats: DashboardStats | null;
    recentInterviews: RecentInterview[];
    topSkills: TopSkill[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useDashboardData(): UseDashboardDataReturn {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentInterviews, setRecentInterviews] = useState<RecentInterview[]>([]);
    const [topSkills, setTopSkills] = useState<TopSkill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasFetchedRef = useRef(false);

    const fetchDashboardData = async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const [statsRes, interviewsRes, skillsRes] = await Promise.all([
                api.getDashboardStats(),
                api.getRecentInterviews(),
                api.getTopSkills(),
            ]);

            const failedResponse = [statsRes, interviewsRes, skillsRes].find(
                (response) => !response.success,
            );

            if (failedResponse) {
                setError(
                    failedResponse.error ||
                    failedResponse.message ||
                    'Failed to fetch dashboard data',
                );
                return;
            }

            if (statsRes.success && statsRes.data) {
                setStats(statsRes.data);
            }

            if (interviewsRes.success && interviewsRes.data) {
                setRecentInterviews(interviewsRes.data.interviews || []);
            }

            if (skillsRes.success && skillsRes.data) {
                setTopSkills(skillsRes.data.skills || []);
            }
        } catch (err: any) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading || !isAuthenticated || hasFetchedRef.current) {
            if (!authLoading && !isAuthenticated) {
                setLoading(false);
            }
            return;
        }

        hasFetchedRef.current = true;
        fetchDashboardData();
    }, [authLoading, isAuthenticated]);

    return {
        stats,
        recentInterviews,
        topSkills,
        loading,
        error,
        refetch: fetchDashboardData,
    };
}
