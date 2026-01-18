// TypeScript interfaces for Job Positions

export interface JobPosition {
    _id: string;
    title: string;
    description: string;
    location: string;
    posted_at: string;
    salary_range?: string;
    salary?: string;
    status: 'active' | 'paused' | 'open' | 'closed' | 'filled';
    department: string;
    total_applicants: number;
    qualified_count: number;
    hrId: string;
    requiredSkills?: string[];
    experience?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePositionData {
    title: string;
    description: string;
    department: string;
    location: string;
    salary_range: string;
    requiredSkills?: string[];
    experience?: string;
}

export interface PositionFilters {
    search?: string;
    department?: string;
}
