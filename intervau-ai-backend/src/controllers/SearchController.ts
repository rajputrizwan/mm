import { Request, Response } from 'express';

interface SearchResult {
    id: string;
    title: string;
    description?: string;
    category: 'Pages' | 'Recent' | 'Actions';
    icon: string;
    route: string;
}

export class SearchController {
    // Global search endpoint
    async globalSearch(req: Request, res: Response) {
        try {
            const { q: query } = req.query;
            const user = (req as any).user;

            if (!query || typeof query !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required',
                });
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            const searchTerm = query.toLowerCase().trim();
            const userRole = user.role;

            // Define searchable items based on role
            const candidateItems: SearchResult[] = [
                {
                    id: 'dashboard',
                    title: 'Dashboard',
                    description: 'View your dashboard and overview',
                    category: 'Pages',
                    icon: 'LayoutDashboard',
                    route: '/candidate/dashboard',
                },
                {
                    id: 'resume',
                    title: 'Resume',
                    description: 'Manage and analyze your resume',
                    category: 'Pages',
                    icon: 'FileText',
                    route: '/candidate/resume',
                },
                {
                    id: 'mock-interview',
                    title: 'Mock Interview',
                    description: 'Practice with AI-powered mock interviews',
                    category: 'Pages',
                    icon: 'Video',
                    route: '/candidate/mock-interview',
                },
                {
                    id: 'interview-history',
                    title: 'Interview History',
                    description: 'View your past interviews and performance',
                    category: 'Pages',
                    icon: 'History',
                    route: '/candidate/interview-history',
                },
                {
                    id: 'profile-settings',
                    title: 'Profile Settings',
                    description: 'Manage your account settings',
                    category: 'Pages',
                    icon: 'Settings',
                    route: '/candidate/profile-settings',
                },
                {
                    id: 'start-mock',
                    title: 'Start Mock Interview',
                    description: 'Begin a new mock interview session',
                    category: 'Actions',
                    icon: 'PlayCircle',
                    route: '/candidate/mock-interview',
                },
            ];

            const hrItems: SearchResult[] = [
                {
                    id: 'hr-dashboard',
                    title: 'Dashboard',
                    description: 'View your HR dashboard',
                    category: 'Pages',
                    icon: 'LayoutDashboard',
                    route: '/hr/dashboard',
                },
                {
                    id: 'job-positions',
                    title: 'Job Positions',
                    description: 'Manage job openings and positions',
                    category: 'Pages',
                    icon: 'Briefcase',
                    route: '/hr/jobs',
                },
                {
                    id: 'candidates',
                    title: 'Candidates',
                    description: 'Browse and review all candidates',
                    category: 'Pages',
                    icon: 'Users',
                    route: '/hr/candidates',
                },
                {
                    id: 'hr-profile-settings',
                    title: 'Profile Settings',
                    description: 'Manage your account settings',
                    category: 'Pages',
                    icon: 'Settings',
                    route: '/hr/profile-settings',
                },
                {
                    id: 'create-job',
                    title: 'Create New Job',
                    description: 'Post a new job position',
                    category: 'Actions',
                    icon: 'Plus',
                    route: '/hr/jobs',
                },
            ];

            // Select items based on user role
            const searchableItems = userRole === 'candidate' ? candidateItems : hrItems;

            // Filter items based on search query
            const results = searchableItems.filter((item) => {
                const searchableText = `${item.title} ${item.description}`.toLowerCase();
                return searchableText.includes(searchTerm);
            });

            // Sort results by relevance (title matches first)
            results.sort((a, b) => {
                const aTitle = a.title.toLowerCase();
                const bTitle = b.title.toLowerCase();
                const aStartsWith = aTitle.startsWith(searchTerm);
                const bStartsWith = bTitle.startsWith(searchTerm);

                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;
                return aTitle.localeCompare(bTitle);
            });

            // Limit results to top 8
            const limitedResults = results.slice(0, 8);

            return res.status(200).json({
                success: true,
                data: {
                    results: limitedResults,
                    total: results.length,
                    query: query,
                },
            });
        } catch (error: any) {
            console.error('Search error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to perform search',
                error: error.message,
            });
        }
    }
}

export default new SearchController();
