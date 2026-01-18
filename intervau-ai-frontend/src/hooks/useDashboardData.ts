import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    HRDashboardMetrics,
    Application,
    InterviewScheduleItem,
    DepartmentAnalytics,
} from '../types/models';

interface DashboardData {
    metrics: HRDashboardMetrics | null;
    recentApplications: Application[];
    weeklyInterviews: InterviewScheduleItem[];
    departmentAnalytics: DepartmentAnalytics[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useDashboardData = (): DashboardData => {
    const [metrics, setMetrics] = useState<HRDashboardMetrics | null>(null);
    const [recentApplications, setRecentApplications] = useState<Application[]>([]);
    const [weeklyInterviews, setWeeklyInterviews] = useState<InterviewScheduleItem[]>([]);
    const [departmentAnalytics, setDepartmentAnalytics] = useState<DepartmentAnalytics[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all dashboard data in parallel
            const [metricsRes, applicationsRes, interviewsRes, analyticsRes] = await Promise.all([
                api.getHRDashboardMetrics(),
                api.getRecentApplications(),
                api.getWeeklyInterviews(),
                api.getDepartmentAnalytics(),
            ]);

            // Check for errors in responses
            if (!metricsRes.success) {
                throw new Error(metricsRes.error || 'Failed to fetch metrics');
            }
            if (!applicationsRes.success) {
                throw new Error(applicationsRes.error || 'Failed to fetch applications');
            }
            if (!interviewsRes.success) {
                throw new Error(interviewsRes.error || 'Failed to fetch interviews');
            }
            if (!analyticsRes.success) {
                throw new Error(analyticsRes.error || 'Failed to fetch analytics');
            }

            // Set data from successful responses
            setMetrics(metricsRes.data || null);
            setRecentApplications(applicationsRes.data || []);
            setWeeklyInterviews(interviewsRes.data || []);
            setDepartmentAnalytics(analyticsRes.data || []);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while fetching dashboard data');
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
};
