interface Skill {
    name: string;
    category: string;
    level?: number;
}

interface SkillGap {
    skill: string;
    importance: string;
    recommendation: string;
}

interface InterviewQuestion {
    question: string;
    category: string;
    difficulty: string;
}

// Comprehensive skill keywords database
const SKILL_KEYWORDS = {
    Frontend: [
        'HTML',
        'CSS',
        'JavaScript',
        'TypeScript',
        'React',
        'Vue',
        'Angular',
        'Svelte',
        'Next.js',
        'Nuxt',
        'Redux',
        'Webpack',
        'Vite',
        'Tailwind',
        'Bootstrap',
        'SASS',
        'LESS',
    ],
    Backend: [
        'Node.js',
        'Express',
        'NestJS',
        'Python',
        'Django',
        'Flask',
        'FastAPI',
        'Java',
        'Spring',
        'PHP',
        'Laravel',
        'Ruby',
        'Rails',
        'Go',
        'Rust',
        '.NET',
        'C#',
    ],
    Database: [
        'MongoDB',
        'PostgreSQL',
        'MySQL',
        'SQLite',
        'Redis',
        'Cassandra',
        'DynamoDB',
        'Firebase',
        'Supabase',
        'SQL',
        'NoSQL',
    ],
    Cloud: [
        'AWS',
        'Azure',
        'GCP',
        'Google Cloud',
        'Docker',
        'Kubernetes',
        'Heroku',
        'Vercel',
        'Netlify',
        'DigitalOcean',
    ],
    DevOps: [
        'CI/CD',
        'Jenkins',
        'GitLab CI',
        'GitHub Actions',
        'CircleCI',
        'Travis CI',
        'Terraform',
        'Ansible',
        'Nginx',
        'Apache',
    ],
    Mobile: [
        'React Native',
        'Flutter',
        'Swift',
        'Kotlin',
        'iOS',
        'Android',
        'Xamarin',
        'Ionic',
    ],
    'Programming Languages': [
        'JavaScript',
        'TypeScript',
        'Python',
        'Java',
        'C++',
        'C#',
        'Go',
        'Rust',
        'PHP',
        'Ruby',
        'Kotlin',
        'Swift',
    ],
    Tools: [
        'Git',
        'GitHub',
        'GitLab',
        'Bitbucket',
        'Jira',
        'Confluence',
        'Slack',
        'VS Code',
        'IntelliJ',
        'Postman',
        'Figma',
    ],
    'Soft Skills': [
        'Leadership',
        'Communication',
        'Team Player',
        'Problem Solving',
        'Critical Thinking',
        'Time Management',
        'Agile',
        'Scrum',
        'Project Management',
    ],
};

// Common skill gaps for different seniority levels
const COMMON_SKILL_GAPS = [
    {
        skill: 'System Design',
        importance: 'High',
        recommendation:
            'Study distributed systems, microservices architecture, and scalability patterns',
    },
    {
        skill: 'Testing',
        importance: 'High',
        recommendation: 'Learn unit testing, integration testing, and TDD practices',
    },
    {
        skill: 'Cloud Architecture',
        importance: 'Medium',
        recommendation: 'Get certified in AWS, Azure, or GCP fundamentals',
    },
    {
        skill: 'CI/CD',
        importance: 'Medium',
        recommendation: 'Set up automated deployment pipelines for your projects',
    },
    {
        skill: 'Security Best Practices',
        importance: 'High',
        recommendation: 'Learn OWASP top 10, authentication, and encryption techniques',
    },
];

/**
 * Extract skills from resume text using pattern matching
 */
export function extractSkills(text: string): Skill[] {
    const foundSkills: Skill[] = [];
    const textLower = text.toLowerCase();
    const seenSkills = new Set<string>();

    for (const [category, skills] of Object.entries(SKILL_KEYWORDS)) {
        for (const skill of skills) {
            const skillLower = skill.toLowerCase();

            // Check if skill exists in text and hasn't been added yet
            if (textLower.includes(skillLower) && !seenSkills.has(skillLower)) {
                seenSkills.add(skillLower);

                // Calculate basic proficiency level based on context
                const level = calculateSkillLevel(text, skill);

                foundSkills.push({
                    name: skill,
                    category,
                    level,
                });
            }
        }
    }

    return foundSkills;
}

/**
 * Calculate skill level based on context clues in the text
 */
function calculateSkillLevel(text: string, skill: string): number {
    const textLower = text.toLowerCase();
    const skillLower = skill.toLowerCase();

    let level = 60; // Base level

    // Increase level based on experience indicators
    if (textLower.includes(`expert in ${skillLower}`)) level += 30;
    else if (textLower.includes(`senior ${skillLower}`)) level += 25;
    else if (textLower.includes(`proficient in ${skillLower}`)) level += 20;
    else if (textLower.includes(`experienced with ${skillLower}`)) level += 15;
    else if (textLower.includes(`familiar with ${skillLower}`)) level += 10;

    // Check for years of experience
    const yearsMatch = text.match(new RegExp(`(\\d+)\\+?\\s*years?.*${skillLower}`, 'i'));
    if (yearsMatch) {
        const years = parseInt(yearsMatch[1]);
        level += Math.min(years * 5, 20);
    }

    return Math.min(level, 95); // Cap at 95
}

/**
 * Identify skill gaps by comparing extracted skills with common requirements
 */
export function identifySkillGaps(extractedSkills: Skill[]): SkillGap[] {
    const extractedSkillNames = new Set(
        extractedSkills.map((s) => s.name.toLowerCase())
    );

    const gaps: SkillGap[] = [];

    // Check for common missing skills
    for (const gap of COMMON_SKILL_GAPS) {
        if (!extractedSkillNames.has(gap.skill.toLowerCase())) {
            gaps.push(gap);
        }
    }

    // Limit to top 5 gaps
    return gaps.slice(0, 5);
}

/**
 * Generate personalized interview questions based on extracted skills
 */
export function generateInterviewQuestions(
    skills: Skill[]
): InterviewQuestion[] {
    const questions: InterviewQuestion[] = [];

    // Technical questions based on skills
    const technicalSkills = skills.filter(
        (s) => s.category !== 'Soft Skills'
    );

    for (const skill of technicalSkills.slice(0, 5)) {
        questions.push({
            question: `Can you explain a challenging problem you solved using ${skill.name}?`,
            category: skill.category,
            difficulty: skill.level && skill.level > 80 ? 'Advanced' : 'Intermediate',
        });
    }

    // Add system design question if senior
    const hasExpertSkills = skills.some((s) => s.level && s.level > 80);
    if (hasExpertSkills) {
        questions.push({
            question:
                'Design a scalable system for handling millions of concurrent users. How would you approach it?',
            category: 'System Design',
            difficulty: 'Advanced',
        });
    }

    // Add behavioral questions
    questions.push(
        {
            question:
                'Tell me about a time when you had to learn a new technology quickly. How did you approach it?',
            category: 'Behavioral',
            difficulty: 'Intermediate',
        },
        {
            question:
                'Describe a situation where you had to debug a critical production issue. What was your process?',
            category: 'Behavioral',
            difficulty: 'Intermediate',
        }
    );

    return questions.slice(0, 10); // Limit to 10 questions
}

/**
 * Calculate overall match score based on skills
 */
export function calculateMatchScore(skills: Skill[]): number {
    if (skills.length === 0) return 0;

    const avgLevel =
        skills.reduce((sum, skill) => sum + (skill.level || 60), 0) / skills.length;

    // Bonus for diverse skill set
    const uniqueCategories = new Set(skills.map((s) => s.category)).size;
    const diversityBonus = Math.min(uniqueCategories * 2, 10);

    return Math.min(Math.round(avgLevel + diversityBonus), 99);
}
