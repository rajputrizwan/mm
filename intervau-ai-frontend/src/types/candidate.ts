export interface CandidateApplication {
    _id: string;
    candidateId: {
        _id: string;
        userId: {
            _id: string;
            name: string;
            email: string;
        };
    };
    jobPositionId: {
        _id: string;
        title: string;
        department?: string;
    };
    ai_score: number;
    status: 'Qualified' | 'In Interview' | 'Under Review' | 'Rejected' | 'Accepted';
    appliedAt: string;
    interviewCount: number;
    notes?: string;
    resumeUrl?: string;
}

export interface CandidateStats {
    totalCount: number;
    qualifiedCount: number;
    interviewingCount: number;
    averageScore: number;
}

export interface CandidateFilters {
    search?: string;
    status?: string;
    sortBy?: 'score' | 'recent';
}

export interface CandidateApplicationsResponse {
    applications: CandidateApplication[];
    stats: CandidateStats;
}
