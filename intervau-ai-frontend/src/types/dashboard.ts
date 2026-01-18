export interface DashboardStats {
    totalInterviews: number;
    weekInterviews: number;
    avgScore: number;
    lastPeriodAvgScore: number;
    hoursPracticed: number;
    weekHoursPracticed: number;
    improvementRate: number;
}

export interface RecentInterview {
    _id: string;
    jobPositionId: {
        _id: string;
        title: string;
    };
    score: number;
    createdAt: string;
    duration: number;
}

export interface TopSkill {
    name: string;
    level: number;
    category?: string;
}
