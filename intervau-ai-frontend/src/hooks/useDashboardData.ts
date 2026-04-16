import { useState, useEffect } from 'react';
import api from '../services/api';
import { DashboardStats, RecentInterview, TopSkill } from '../types/dashboard';

interface UseDashboardDataReturn {
    stats: DashboardStats | null;
    recentInterviews: RecentInterview[];
    topSkills: TopSkill[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useDashboardData(): UseDashboardDataReturn {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentInterviews, setRecentInterviews] = useState<RecentInterview[]>([]);
    const [topSkills, setTopSkills] = useState<TopSkill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [statsRes, interviewsRes, skillsRes] = await Promise.all([
                api.getDashboardStats(),
                api.getRecentInterviews(),
                api.getTopSkills(),
            ]);

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
        fetchDashboardData();
    }, []);

    return {
        stats,
        recentInterviews,
        topSkills,
        loading,
        error,
        refetch: fetchDashboardData,
    };
}
