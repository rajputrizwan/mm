import { useState, useEffect } from 'react';

interface DashboardMetrics {
    openPositions: {
        count: number;
        changeLabel: string;
    };
    activeCandidates: {
        count: number;
        changeLabel: string;
    };
    interviewsScheduled: {
        count: number;
        changeLabel: string;
    };
    offersExtended: {
        count: number;
        changeLabel: string;
    };
}

interface RecentApplication {
    id: string;
    candidateId: string;
    candidateName: string;
    positionTitle: string;
    status: string;
    ai_score: number;
    appliedDate: string;
}

interface WeeklyInterview {
    id: string;
    candidateName: string;
    positionTitle: string;
    type: 'live' | 'mock';
    scheduledDate: string;
}

interface DepartmentAnalytic {
    department: string;
    openPositions: number;
    qualifiedCandidates: number;
    fillPercentage: number;
}

interface UseHRDashboardDataReturn {
    metrics: DashboardMetrics | null;
    recentApplications: RecentApplication[];
    weeklyInterviews: WeeklyInterview[];
    departmentAnalytics: DepartmentAnalytic[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useHRDashboardData(): UseHRDashboardDataReturn {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
    const [weeklyInterviews, setWeeklyInterviews] = useState<WeeklyInterview[]>([]);
    const [departmentAnalytics, setDepartmentAnalytics] = useState<DepartmentAnalytic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // For now, using mock data until backend endpoints are ready
            // TODO: Replace with actual API calls when backend is implemented
            // const [metricsRes, applicationsRes, interviewsRes, analyticsRes] = await Promise.all([
            //     api.getHRMetrics(),
            //     api.getRecentApplications(),
            //     api.getWeeklyInterviews(),
            //     api.getDepartmentAnalytics(),
            // ]);

            // Mock data
            setMetrics({
                openPositions: {
                    count: 12,
                    changeLabel: '+3 from last month',
                },
                activeCandidates: {
                    count: 48,
                    changeLabel: '+12% this week',
                },
                interviewsScheduled: {
                    count: 24,
                    changeLabel: '8 this week',
                },
                offersExtended: {
                    count: 6,
                    changeLabel: '+2 this month',
                },
            });

            setRecentApplications([
                {
                    id: '1',
                    candidateId: 'c1',
                    candidateName: 'Sarah Johnson',
                    positionTitle: 'Senior Frontend Developer',
                    status: 'Under Review',
                    ai_score: 92,
                    appliedDate: 'Jan 18, 2026',
                },
                {
                    id: '2',
                    candidateId: 'c2',
                    candidateName: 'Michael Chen',
                    positionTitle: 'Backend Engineer',
                    status: 'In Interview',
                    ai_score: 88,
                    appliedDate: 'Jan 17, 2026',
                },
                {
                    id: '3',
                    candidateId: 'c3',
                    candidateName: 'Emily Rodriguez',
                    positionTitle: 'UX Designer',
                    status: 'Qualified',
                    ai_score: 95,
                    appliedDate: 'Jan 16, 2026',
                },
            ]);

            setWeeklyInterviews([
                {
                    id: '1',
                    candidateName: 'Alex Thompson',
                    positionTitle: 'Full Stack Developer',
                    type: 'live',
                    scheduledDate: 'Jan 20, 2026 - 10:00 AM',
                },
                {
                    id: '2',
                    candidateName: 'Jessica Williams',
                    positionTitle: 'DevOps Engineer',
                    type: 'live',
                    scheduledDate: 'Jan 21, 2026 - 2:00 PM',
                },
                {
                    id: '3',
                    candidateName: 'David Martinez',
                    positionTitle: 'Product Manager',
                    type: 'mock',
                    scheduledDate: 'Jan 22, 2026 - 11:00 AM',
                },
            ]);

            setDepartmentAnalytics([
                {
                    department: 'Engineering',
                    openPositions: 5,
                    qualifiedCandidates: 18,
                    fillPercentage: 72,
                },
                {
                    department: 'Design',
                    openPositions: 2,
                    qualifiedCandidates: 8,
                    fillPercentage: 80,
                },
                {
                    department: 'Product',
                    openPositions: 3,
                    qualifiedCandidates: 12,
                    fillPercentage: 60,
                },
                {
                    department: 'Marketing',
                    openPositions: 2,
                    qualifiedCandidates: 10,
                    fillPercentage: 83,
                },
            ]);
        } catch (err: any) {
            console.error('Error fetching HR dashboard data:', err);
            setError(err.message || 'Failed to fetch HR dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return {
        metrics,
        recentApplications,
        weeklyInterviews,
        departmentAnalytics,
        loading,
        error,
        refetch: fetchDashboardData,
    };
}
