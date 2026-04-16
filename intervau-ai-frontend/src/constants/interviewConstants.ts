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
    FileText,
    Users,
    Presentation,
    MessageSquare,
    Target,
    Book,
    Megaphone,
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
    {
        title: 'Case Study',
        icon: FileText,
        description: 'Business scenarios, strategic thinking',
    },
    {
        title: 'Cultural Fit',
        icon: Users,
        description: 'Values alignment, team compatibility',
    },
    {
        title: 'Presentation',
        icon: Presentation,
        description: 'Public speaking, presentation skills',
    },
    {
        title: 'Group Discussion',
        icon: MessageSquare,
        description: 'Team collaboration, debate skills',
    },
    {
        title: 'Aptitude',
        icon: Target,
        description: 'Numerical, verbal, reasoning tests',
    },
    {
        title: 'Domain Specific',
        icon: Book,
        description: 'Industry knowledge, specialized skills',
    },
    {
        title: 'Communication',
        icon: Megaphone,
        description: 'Verbal and written communication',
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
    'Case Study': { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
    'Cultural Fit': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
    Presentation: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
    'Group Discussion': { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
    Aptitude: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
    'Domain Specific': { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
    Communication: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
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
