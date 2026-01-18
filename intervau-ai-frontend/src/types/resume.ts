export interface Skill {
    name: string;
    category: string;
    level?: number;
}

export interface SkillGap {
    skill: string;
    importance: string;
    recommendation: string;
}

export interface InterviewQuestion {
    question: string;
    category: string;
    difficulty: string;
}

export interface ResumeAnalysisResult {
    extractedSkills: Skill[];
    skillGaps: SkillGap[];
    suggestedQuestions: InterviewQuestion[];
    matchScore: number;
    analyzedAt: string;
    fileName: string;
}
