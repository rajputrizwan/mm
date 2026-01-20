/**
 * Interview Constants
 * Constants for interview types, durations, and categories
 * Adapted from the reference implementation
 */

import {
    Code2,
    User,
    Briefcase,
    Puzzle,
    Crown,
    type LucideIcon,
} from 'lucide-react';

// Interview type options with icons
export interface InterviewTypeOption {
    title: string;
    icon: LucideIcon;
    description?: string;
}

export const INTERVIEW_TYPES: InterviewTypeOption[] = [
    {
        title: 'Technical',
        icon: Code2,
        description: 'Coding, algorithms, system design',
    },
    {
        title: 'Behavioral',
        icon: User,
        description: 'Soft skills, teamwork, communication',
    },
    {
        title: 'Experience',
        icon: Briefcase,
        description: 'Past projects, achievements',
    },
    {
        title: 'Problem Solving',
        icon: Puzzle,
        description: 'Logical thinking, analytical skills',
    },
    {
        title: 'Leadership',
        icon: Crown,
        description: 'Management, decision making',
    },
];

// Duration options for interviews
export const DURATION_OPTIONS = [
    { value: '5 Min', label: '5 Minutes', questionCount: 2 },
    { value: '15 Min', label: '15 Minutes', questionCount: 4 },
    { value: '30 Min', label: '30 Minutes', questionCount: 6 },
    { value: '45 Min', label: '45 Minutes', questionCount: 8 },
    { value: '60 Min', label: '60 Minutes', questionCount: 10 },
];

// Question type badges with colors
export const QUESTION_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    Technical: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    Behavioral: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    Experience: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    'Problem Solving': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    Leadership: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
    General: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
};

// Get color for a question type
export function getQuestionTypeColor(type: string): { bg: string; text: string; border: string } {
    return QUESTION_TYPE_COLORS[type] || QUESTION_TYPE_COLORS.General;
}

// Difficulty levels
export const DIFFICULTY_LEVELS = [
    { value: 'junior', label: 'Junior', description: 'Entry-level questions' },
    { value: 'mid', label: 'Mid-Level', description: 'Intermediate questions' },
    { value: 'senior', label: 'Senior', description: 'Advanced questions' },
];

// Interview visibility options
export const VISIBILITY_OPTIONS = [
    { value: 'public', label: 'Public', description: 'Anyone with the link can access' },
    { value: 'private', label: 'Private', description: 'Only invited candidates can access' },
];

export default {
    INTERVIEW_TYPES,
    DURATION_OPTIONS,
    QUESTION_TYPE_COLORS,
    DIFFICULTY_LEVELS,
    VISIBILITY_OPTIONS,
    getQuestionTypeColor,
};
