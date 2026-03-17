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
  Mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android', 'Xamarin', 'Ionic'],
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

const PROFICIENCY_TERMS = [
  'expert',
  'advanced',
  'senior',
  'proficient',
  'strong',
  'solid',
  'hands-on',
  'familiar',
  'basic',
  'beginner',
];

const SECTION_HINTS = [
  'skills',
  'technical skills',
  'technologies',
  'tools',
  'experience',
  'projects',
  'work experience',
  'professional experience',
];

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
  const normalizedText = normalizeResumeText(text);
  const textLower = normalizedText.toLowerCase();
  const seenSkills = new Set<string>();
  const lines = normalizedText.split('\n').map(line => line.trim());

  for (const [category, skills] of Object.entries(SKILL_KEYWORDS)) {
    for (const skill of skills) {
      const skillLower = skill.toLowerCase();
      const regex = buildSkillRegex(skill);
      const matches = [...textLower.matchAll(regex)];

      // Check if skill exists in text and hasn't been added yet
      if (matches.length > 0 && !seenSkills.has(skillLower)) {
        seenSkills.add(skillLower);

        const level = calculateSkillLevel(normalizedText, lines, skill, matches.length);

        foundSkills.push({
          name: skill,
          category,
          level,
        });
      }
    }
  }

  // Return top 30 skills so UI remains readable and focused.
  return foundSkills
    .sort((a, b) => (b.level || 0) - (a.level || 0) || a.name.localeCompare(b.name))
    .slice(0, 30);
}

/**
 * Calculate skill level based on context clues in the text
 */
function calculateSkillLevel(
  text: string,
  lines: string[],
  skill: string,
  mentionCount: number
): number {
  const textLower = text.toLowerCase();
  const skillLower = skill.toLowerCase();
  let score = 25;

  // Mention density: multiple mentions usually indicate stronger ownership.
  score += Math.min(mentionCount * 9, 36);

  // Give a small bonus if skill appears in key resume sections.
  const sectionBonus = lines.some(
    line =>
      line.toLowerCase().includes(skillLower) &&
      SECTION_HINTS.some(hint => line.toLowerCase().includes(hint))
  )
    ? 8
    : 0;
  score += sectionBonus;

  // Check same-line context for proficiency cues around the skill mention.
  let proficiencyScore = 0;
  for (const line of lines) {
    const lineLower = line.toLowerCase();
    if (!lineLower.includes(skillLower)) continue;

    if (
      lineLower.includes('expert') ||
      lineLower.includes('advanced') ||
      lineLower.includes('senior')
    ) {
      proficiencyScore = Math.max(proficiencyScore, 20);
    } else if (
      lineLower.includes('proficient') ||
      lineLower.includes('strong') ||
      lineLower.includes('solid') ||
      lineLower.includes('hands-on')
    ) {
      proficiencyScore = Math.max(proficiencyScore, 14);
    } else if (
      lineLower.includes('familiar') ||
      lineLower.includes('basic') ||
      lineLower.includes('beginner')
    ) {
      proficiencyScore = Math.max(proficiencyScore, 6);
    }
  }
  score += proficiencyScore;

  // Nearby years-of-experience pattern in the full text.
  const yearsScore = extractYearsOfExperienceScore(textLower, skillLower);
  score += yearsScore;

  // Penalize pure keyword dumps with no context.
  if (mentionCount === 1 && proficiencyScore === 0 && yearsScore === 0) {
    score -= 8;
  }

  // Keep in realistic UI range.
  return clamp(Math.round(score), 30, 95);
}

function extractYearsOfExperienceScore(textLower: string, skillLower: string): number {
  const escapedSkill = escapeRegex(skillLower);

  const patterns = [
    new RegExp(`(\\d{1,2})\\+?\\s*years?[^\\n\\r]{0,50}${escapedSkill}`, 'gi'),
    new RegExp(`${escapedSkill}[^\\n\\r]{0,50}(\\d{1,2})\\+?\\s*years?`, 'gi'),
  ];

  let maxYears = 0;
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    // eslint-disable-next-line no-cond-assign
    while ((match = pattern.exec(textLower)) !== null) {
      const years = Number(match[1]);
      if (Number.isFinite(years)) {
        maxYears = Math.max(maxYears, years);
      }
    }
  }

  return Math.min(maxYears * 3, 24);
}

function normalizeResumeText(text: string): string {
  return text
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\t ]+/g, ' ')
    .trim();
}

function buildSkillRegex(skill: string): RegExp {
  // For short tokens (e.g., SQL, AWS), use strict word boundaries.
  if (/^[A-Za-z0-9+#.]+$/.test(skill)) {
    return new RegExp(`\\b${escapeRegex(skill.toLowerCase())}\\b`, 'g');
  }

  return new RegExp(escapeRegex(skill.toLowerCase()), 'g');
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Identify skill gaps by comparing extracted skills with common requirements
 */
export function identifySkillGaps(extractedSkills: Skill[]): SkillGap[] {
  const extractedSkillNames = new Set(extractedSkills.map(s => s.name.toLowerCase()));

  const gaps: SkillGap[] = [];
  const categoryCoverage = new Set(extractedSkills.map(s => s.category));

  // Check for common missing skills
  for (const gap of COMMON_SKILL_GAPS) {
    if (!extractedSkillNames.has(gap.skill.toLowerCase())) {
      gaps.push(gap);
    }
  }

  // Category-aware gaps.
  if (!categoryCoverage.has('DevOps')) {
    gaps.push({
      skill: 'DevOps Fundamentals',
      importance: 'Medium',
      recommendation: 'Practice CI/CD workflows, containerization, and deployment monitoring.',
    });
  }

  if (!categoryCoverage.has('Cloud')) {
    gaps.push({
      skill: 'Cloud Platforms',
      importance: 'Medium',
      recommendation: 'Build and deploy a small project on AWS, Azure, or GCP.',
    });
  }

  // Limit to top 5 gaps
  return gaps.slice(0, 5);
}

/**
 * Generate personalized interview questions based on extracted skills
 */
export function generateInterviewQuestions(skills: Skill[]): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];

  // Technical questions based on skills
  const technicalSkills = skills
    .filter(s => s.category !== 'Soft Skills')
    .sort((a, b) => (b.level || 0) - (a.level || 0));

  for (const skill of technicalSkills.slice(0, 5)) {
    questions.push({
      question: `Can you explain a challenging problem you solved using ${skill.name}?`,
      category: skill.category,
      difficulty: skill.level && skill.level > 80 ? 'Advanced' : 'Intermediate',
    });
  }

  // Add system design question if senior
  const hasExpertSkills = skills.some(s => s.level && s.level > 80);
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

  const avgLevel = skills.reduce((sum, skill) => sum + (skill.level || 45), 0) / skills.length;

  const uniqueCategories = new Set(skills.map(s => s.category)).size;
  const totalCategories = Object.keys(SKILL_KEYWORDS).length;
  const categoryCoverage = uniqueCategories / totalCategories;

  const topSkillsAvg =
    skills
      .slice()
      .sort((a, b) => (b.level || 0) - (a.level || 0))
      .slice(0, 8)
      .reduce((sum, s) => sum + (s.level || 45), 0) / Math.min(8, skills.length);

  const score = avgLevel * 0.55 + topSkillsAvg * 0.3 + categoryCoverage * 100 * 0.15;
  return clamp(Math.round(score), 0, 99);
}
