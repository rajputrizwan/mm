import { Request, Response } from 'express';
import { Application } from '../models/Application';
import { JobPosition } from '../models/JobPosition';
import { Interview } from '../models/Interview';
import { Candidate } from '../models/Candidate';
import { User } from '../models/User';

export class DashboardController {
    /**
     * GET /api/dashboard/hr/metrics
     * Calculate KPI metrics with week-over-week comparisons
     */
    static async getHRMetrics(req: Request, res: Response) {
        try {
            const now = new Date();
            const currentWeekStart = new Date(now);
            currentWeekStart.setDate(now.getDate() - now.getDay());
            currentWeekStart.setHours(0, 0, 0, 0);

            const currentWeekEnd = new Date(currentWeekStart);
            currentWeekEnd.setDate(currentWeekStart.getDate() + 7);

            const previousWeekStart = new Date(currentWeekStart);
            previousWeekStart.setDate(currentWeekStart.getDate() - 7);

            const previousWeekEnd = new Date(currentWeekStart);

            // 1. Open Positions
            const currentOpenPositions = await JobPosition.countDocuments({ status: 'open' });
            const previousOpenPositions = await JobPosition.countDocuments({
                status: 'open',
                createdAt: { $lt: previousWeekEnd },
            });

            const openPositionsChange = previousOpenPositions > 0
                ? Math.round(((currentOpenPositions - previousOpenPositions) / previousOpenPositions) * 100)
                : 0;

            // 2. Active Candidates
            const currentActiveCandidates = await Application.countDocuments({
                status: { $in: ['Qualified', 'In Interview', 'Under Review'] },
            });

            const previousActiveCandidates = await Application.countDocuments({
                status: { $in: ['Qualified', 'In Interview', 'Under Review'] },
                createdAt: { $lt: previousWeekEnd },
            });

            const activeCandidatesChange = previousActiveCandidates > 0
                ? Math.round(((currentActiveCandidates - previousActiveCandidates) / previousActiveCandidates) * 100)
                : 0;

            // 3. Interviews Scheduled (this week)
            const currentWeekInterviews = await Interview.countDocuments({
                scheduledAt: { $gte: currentWeekStart, $lt: currentWeekEnd },
                status: { $ne: 'cancelled' },
            });

            const previousWeekInterviews = await Interview.countDocuments({
                scheduledAt: { $gte: previousWeekStart, $lt: previousWeekEnd },
                status: { $ne: 'cancelled' },
            });

            const interviewsChange = previousWeekInterviews > 0
                ? Math.round(((currentWeekInterviews - previousWeekInterviews) / previousWeekInterviews) * 100)
                : 0;

            // 4. Offers Extended
            const currentOffers = await Application.countDocuments({ status: 'Accepted' });

            const previousOffers = await Application.countDocuments({
                status: 'Accepted',
                updatedAt: { $lt: previousWeekEnd },
            });

            const offersChange = previousOffers > 0
                ? Math.round(((currentOffers - previousOffers) / previousOffers) * 100)
                : 0;

            res.status(200).json({
                success: true,
                data: {
                    openPositions: {
                        count: currentOpenPositions,
                        weekOverWeekChange: openPositionsChange,
                        changeLabel: `${openPositionsChange >= 0 ? '+' : ''}${Math.abs(currentOpenPositions - previousOpenPositions)} this week`,
                    },
                    activeCandidates: {
                        count: currentActiveCandidates,
                        weekOverWeekChange: activeCandidatesChange,
                        changeLabel: `${activeCandidatesChange >= 0 ? '+' : ''}${Math.abs(currentActiveCandidates - previousActiveCandidates)} this week`,
                    },
                    interviewsScheduled: {
                        count: currentWeekInterviews,
                        weekOverWeekChange: interviewsChange,
                        changeLabel: `${currentWeekInterviews} this week`,
                    },
                    offersExtended: {
                        count: currentOffers,
                        weekOverWeekChange: offersChange,
                        changeLabel: `${offersChange >= 0 ? '+' : ''}${Math.abs(currentOffers - previousOffers)} this week`,
                    },
                },
            });
        } catch (error) {
            console.error('Error fetching HR metrics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch HR dashboard metrics',
            });
        }
    }

    /**
     * GET /api/dashboard/hr/recent-applications
     * Get the most recent 5 applications
     */
    static async getRecentApplications(req: Request, res: Response) {
        try {
            const applications = await Application.find()
                .sort({ appliedAt: -1 })
                .limit(5)
                .populate('candidateId', 'userId')
                .populate('jobPositionId', 'title');

            // Populate user details for candidate
            const enrichedApplications = await Promise.all(
                applications.map(async (app: any) => {
                    const user = await User.findById(app.candidateId?.userId);

                    const now = new Date();
                    const appliedDate = new Date(app.appliedAt);
                    const diffMs = now.getTime() - appliedDate.getTime();
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffDays = Math.floor(diffHours / 24);

                    let appliedDateLabel = '';
                    if (diffDays > 0) {
                        appliedDateLabel = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                    } else if (diffHours > 0) {
                        appliedDateLabel = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                    } else {
                        appliedDateLabel = 'Just now';
                    }

                    return {
                        id: app._id,
                        candidateId: app.candidateId?._id,
                        candidateName: user?.name || 'Unknown',
                        jobPositionId: app.jobPositionId?._id,
                        positionTitle: app.jobPositionId?.title || 'Unknown Position',
                        ai_score: app.ai_score,
                        status: app.status,
                        appliedAt: app.appliedAt,
                        appliedDate: appliedDateLabel,
                    };
                })
            );

            res.status(200).json({
                success: true,
                data: enrichedApplications,
            });
        } catch (error) {
            console.error('Error fetching recent applications:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch recent applications',
            });
        }
    }

    /**
     * GET /api/dashboard/hr/weekly-interviews
     * Get interviews scheduled for the current week
     */
    static async getWeeklyInterviews(req: Request, res: Response) {
        try {
            const now = new Date();
            const currentWeekStart = new Date(now);
            currentWeekStart.setDate(now.getDate() - now.getDay());
            currentWeekStart.setHours(0, 0, 0, 0);

            const currentWeekEnd = new Date(currentWeekStart);
            currentWeekEnd.setDate(currentWeekStart.getDate() + 7);

            const interviews = await Interview.find({
                scheduledAt: { $gte: currentWeekStart, $lt: currentWeekEnd },
                status: { $ne: 'cancelled' },
            })
                .sort({ scheduledAt: 1 })
                .populate('candidateId', 'name')
                .populate('jobPositionId', 'title');

            const formattedInterviews = interviews.map((interview: any) => {
                const scheduledDate = new Date(interview.scheduledAt);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);

                let dateLabel = '';
                if (scheduledDate >= today && scheduledDate < tomorrow) {
                    dateLabel = `Today at ${scheduledDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
                } else if (scheduledDate >= tomorrow && scheduledDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) {
                    dateLabel = `Tomorrow at ${scheduledDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
                } else {
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    dateLabel = `${dayNames[scheduledDate.getDay()]} at ${scheduledDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
                }

                return {
                    id: interview._id,
                    candidateName: interview.candidateId?.name || 'Unknown',
                    positionTitle: interview.jobPositionId?.title || 'Unknown Position',
                    scheduledDate: dateLabel,
                    type: interview.type,
                };
            });

            res.status(200).json({
                success: true,
                data: formattedInterviews,
            });
        } catch (error) {
            console.error('Error fetching weekly interviews:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch weekly interviews',
            });
        }
    }

    /**
     * GET /api/dashboard/hr/department-analytics
     * Get analytics grouped by department
     */
    static async getDepartmentAnalytics(req: Request, res: Response) {
        try {
            // Get all departments with open positions
            const departments = await JobPosition.aggregate([
                {
                    $group: {
                        _id: '$department',
                        openPositions: {
                            $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] },
                        },
                    },
                },
            ]);

            // For each department, get application stats
            const departmentAnalytics = await Promise.all(
                departments.map(async (dept) => {
                    const departmentPositions = await JobPosition.find({
                        department: dept._id,
                        status: 'open',
                    }).select('_id');

                    const positionIds = departmentPositions.map((p) => p._id);

                    const totalApplicants = await Application.countDocuments({
                        jobPositionId: { $in: positionIds },
                    });

                    const qualifiedCandidates = await Application.countDocuments({
                        jobPositionId: { $in: positionIds },
                        status: 'Qualified',
                    });

                    const fillPercentage = totalApplicants > 0
                        ? Math.round((qualifiedCandidates / totalApplicants) * 100)
                        : 0;

                    return {
                        department: dept._id || 'Unknown',
                        openPositions: dept.openPositions,
                        qualifiedCandidates,
                        totalApplicants,
                        fillPercentage,
                    };
                })
            );

            res.status(200).json({
                success: true,
                data: departmentAnalytics,
            });
        } catch (error) {
            console.error('Error fetching department analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch department analytics',
            });
        }
    }
}
