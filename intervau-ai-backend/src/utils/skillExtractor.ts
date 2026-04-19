// ============================================================
//  skillExtractor.ts  —  Comprehensive resume skill extraction
//  and job-match scoring (v2)
// ============================================================

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

interface RoleContext {
  targetJobPosition?: string;
  targetJobDescription?: string;
}

interface RoleSignals {
  requiredSkills: Set<string>;         // from JD required/must-have section
  preferredSkills: Set<string>;        // from JD preferred/nice-to-have section
  relevantCategories: Set<string>;
  normalizedRoleText: string;
  jdKeywords: Set<string>;             // all meaningful tokens from JD
}

// ============================================================
//  SPECIAL PATTERNS for ambiguous / symbol-containing skills
// ============================================================
const SPECIAL_SKILL_PATTERNS: Record<string, RegExp> = {
  'C':    /(?<![A-Za-z>+#])C(?![+#A-Za-z+])/g,
  'C++':  /C\+\+/g,
  'C#':   /C#/g,
  'R':    /(?<![A-Za-z])R(?![A-Za-z0-9])/g,
  '.NET': /\.NET\b/gi,
  'F#':   /F#/g,
};

// ============================================================
//  SYNONYM / ABBREVIATION MAP  (alias → canonical skill name)
// ============================================================
const SKILL_ALIASES: Record<string, string> = {
  // Languages
  'js':           'JavaScript',
  'ts':           'TypeScript',
  'py':           'Python',
  'rb':           'Ruby',
  'c plus plus':  'C++',
  'cplusplus':    'C++',
  'csharp':       'C#',
  'c sharp':      'C#',
  'golang':       'Go',
  'bash scripting':'Bash',
  'shell scripting':'Bash',
  // Frontend
  'reactjs':      'React',
  'react.js':     'React',
  'vuejs':        'Vue',
  'vue.js':       'Vue',
  'angular.js':   'Angular',
  'angularjs':    'Angular',
  'nextjs':       'Next.js',
  'tailwindcss':  'Tailwind CSS',
  'mui':          'Material UI',
  // Backend
  'nodejs':       'Node.js',
  'node':         'Node.js',
  'expressjs':    'Express',
  'express.js':   'Express',
  'nestjs':       'NestJS',
  'fastapi':      'FastAPI',
  'springboot':   'Spring Boot',
  'spring boot':  'Spring Boot',
  'asp.net':      '.NET',
  'dotnet':       '.NET',
  // Database
  'postgres':     'PostgreSQL',
  'psql':         'PostgreSQL',
  'mongo':        'MongoDB',
  'mssql':        'MS SQL Server',
  'mysql server': 'MySQL',
  'elastic':      'Elasticsearch',
  // Cloud / DevOps
  'k8s':          'Kubernetes',
  'tf':           'Terraform',
  'gha':          'GitHub Actions',
  'gcp':          'Google Cloud',
  'google cloud platform': 'Google Cloud',
  'amazon web services':   'AWS',
  'microsoft azure':       'Azure',
  // AI / ML
  'ml':           'Machine Learning',
  'dl':           'Deep Learning',
  'ai':           'Artificial Intelligence',
  'nlp':          'NLP',
  'cv':           'Computer Vision',
  'sklearn':      'scikit-learn',
  'sci-kit learn':'scikit-learn',
  'scikit learn': 'scikit-learn',
  'pytorch':      'PyTorch',
  'tensorflow':   'TensorFlow',
  'keras':        'Keras',
  'pandas':       'Pandas',
  'numpy':        'NumPy',
  'matplotlib':   'Matplotlib',
  'seaborn':      'Seaborn',
  // EE
  'verilog hdl':  'Verilog',
  'verilog/vhdl': 'VHDL',
  'embedded c':   'Embedded Systems',
  'uc':           'Microcontrollers',
  'mcu':          'Microcontrollers',
  'pcb':          'PCB Design',
  'plcs':         'PLC',
  // Data
  'powerbi':      'Power BI',
  'power-bi':     'Power BI',
  'tableau':      'Tableau',
  // Tools
  'github':       'Git',
  'gitlab':       'Git',
  'jira':         'Jira',
  'vs code':      'VS Code',
  'vscode':       'VS Code',
};

// ============================================================
//  COMPREHENSIVE SKILL DATABASE (~350 entries, 14 categories)
// ============================================================
const SKILL_KEYWORDS: Record<string, string[]> = {
  'Programming Languages': [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#',
    'Go', 'Rust', 'PHP', 'Ruby', 'Kotlin', 'Swift', 'Scala', 'R',
    'MATLAB', 'Perl', 'Bash', 'Shell', 'Dart', 'F#', 'Elixir',
    'Haskell', 'Lua', 'Assembly', 'COBOL', 'Fortran', 'Julia',
    'Groovy', 'PowerShell', 'Objective-C',
  ],
  'Frontend': [
    'HTML', 'CSS', 'React', 'Vue', 'Angular', 'Svelte', 'Next.js',
    'Nuxt', 'Redux', 'Webpack', 'Vite', 'Tailwind CSS', 'Bootstrap',
    'SASS', 'LESS', 'Material UI', 'Ant Design', 'Storybook',
    'GraphQL', 'Apollo', 'Gatsby', 'Remix', 'Ember', 'Backbone',
    'jQuery', 'D3.js', 'Three.js', 'WebSocket', 'PWA',
    'Responsive Design', 'Cross-browser Compatibility',
  ],
  'Backend': [
    'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI',
    'Spring', 'Spring Boot', 'Laravel', 'Rails', 'ASP.NET', '.NET',
    'gRPC', 'REST', 'RESTful API', 'GraphQL', 'Microservices',
    'WebSockets', 'OAuth', 'JWT', 'Kafka', 'RabbitMQ',
    'Message Queue', 'API Gateway', 'Serverless', 'Lambda',
    'Celery', 'Gunicorn', 'Nginx', 'Apache', 'HTTP', 'HTTPS',
  ],
  'Database': [
    'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Cassandra',
    'DynamoDB', 'Firebase', 'Supabase', 'SQL', 'NoSQL',
    'Oracle', 'MS SQL Server', 'Elasticsearch', 'InfluxDB',
    'Neo4j', 'CockroachDB', 'MariaDB', 'Prisma', 'Sequelize',
    'Mongoose', 'TypeORM', 'Hibernate', 'Database Design',
    'Query Optimization', 'Indexing', 'Stored Procedures',
  ],
  'Cloud': [
    'AWS', 'Azure', 'Google Cloud', 'IBM Cloud', 'Cloudflare',
    'Docker', 'Kubernetes', 'Heroku', 'Vercel', 'Netlify',
    'DigitalOcean', 'EC2', 'S3', 'Lambda', 'CloudFront',
    'EKS', 'ECS', 'GKE', 'AKS', 'Cloud Run', 'Fargate',
    'Load Balancing', 'Auto Scaling', 'CDN', 'VPC',
  ],
  'DevOps': [
    'CI/CD', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'CircleCI',
    'Travis CI', 'Terraform', 'Ansible', 'Prometheus', 'Grafana',
    'Helm', 'ArgoCD', 'Chef', 'Puppet', 'Vagrant',
    'Linux', 'Unix', 'Bash', 'Shell Scripting',
    'Monitoring', 'Logging', 'ELK Stack', 'Datadog',
    'Infrastructure as Code', 'Site Reliability Engineering',
  ],
  'AI / Machine Learning': [
    'Machine Learning', 'Deep Learning', 'Artificial Intelligence',
    'NLP', 'Natural Language Processing', 'Computer Vision',
    'TensorFlow', 'PyTorch', 'Keras', 'scikit-learn',
    'OpenCV', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn',
    'Hugging Face', 'LangChain', 'OpenAI', 'GPT',
    'BERT', 'Transformers', 'Neural Networks', 'CNN', 'RNN', 'LSTM',
    'Reinforcement Learning', 'Transfer Learning',
    'Feature Engineering', 'Model Deployment', 'MLOps',
    'Data Preprocessing', 'Anomaly Detection', 'Recommendation Systems',
  ],
  'Data Science': [
    'Data Analysis', 'Data Visualization', 'Statistics', 'Tableau',
    'Power BI', 'Apache Spark', 'Hadoop', 'Hive', 'Airflow',
    'dbt', 'ETL', 'Data Pipeline', 'Data Warehousing',
    'Big Data', 'Apache Kafka', 'Databricks', 'Snowflake',
    'Looker', 'Excel', 'R', 'SPSS', 'SAS', 'A/B Testing',
    'Regression', 'Classification', 'Clustering',
  ],
  'Mobile': [
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android',
    'Xamarin', 'Ionic', 'Expo', 'SwiftUI', 'Jetpack Compose',
    'Mobile Development', 'App Store', 'Play Store',
  ],
  'Electrical Engineering': [
    'MATLAB', 'Simulink', 'VHDL', 'Verilog', 'FPGA',
    'PLC', 'SCADA', 'AutoCAD Electrical', 'LTspice', 'Proteus',
    'Arduino', 'Raspberry Pi', 'Embedded Systems', 'Microcontrollers',
    'PCB Design', 'Altium Designer', 'Eagle', 'KiCad',
    'Signal Processing', 'Digital Signal Processing', 'DSP',
    'Power Systems', 'Power Electronics', 'Control Systems',
    'PID Controller', 'Sensor Integration', 'IoT',
    'Circuit Design', 'Analog Electronics', 'Digital Electronics',
    'Microprocessors', 'ARM', 'STM32', 'AVR', 'PIC',
    'Communication Systems', 'Wireless Networks', 'UART', 'SPI', 'I2C',
    'LabVIEW', 'Oscilloscope', 'Multimeter', 'Electrical Design',
    'Motor Control', 'Inverters', 'Transformers', 'HVAC',
    'Instrumentation', 'Automation', 'Robotics',
  ],
  'Mechanical Engineering': [
    'SolidWorks', 'AutoCAD', 'CATIA', 'ANSYS', 'Fusion 360',
    'CAD', 'CAM', 'FEA', 'CFD', 'Finite Element Analysis',
    '3D Printing', 'CNC Machining', 'GD&T', 'Tolerance Analysis',
    'Thermodynamics', 'Fluid Mechanics', 'Heat Transfer',
    'Product Design', 'Manufacturing Processes', 'Lean Manufacturing',
    'Six Sigma', 'Quality Control', 'FMEA', 'DFM',
    'SolidWorks Simulation', 'MATLAB', 'Pro/Engineer',
    'Mechanical Design', 'Material Science', 'Stress Analysis',
  ],
  'Security': [
    'Cybersecurity', 'Penetration Testing', 'OWASP', 'Burp Suite',
    'Nmap', 'Metasploit', 'Wireshark', 'Ethical Hacking',
    'Network Security', 'Cryptography', 'SSL/TLS', 'SSH',
    'Firewall', 'IDS/IPS', 'SIEM', 'SOC',
    'Vulnerability Assessment', 'Risk Assessment', 'ISO 27001',
    'Identity Management', 'Zero Trust',
  ],
  'Tools': [
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence',
    'Slack', 'VS Code', 'IntelliJ', 'Postman', 'Figma',
    'Notion', 'Trello', 'Asana', 'Linear',
    'npm', 'yarn', 'pnpm', 'pip', 'Maven', 'Gradle',
    'Make', 'webpack', 'Babel', 'ESLint', 'Prettier',
    'Swagger', 'OpenAPI', 'Draw.io',
  ],
  'Soft Skills': [
    'Leadership', 'Communication', 'Team Player', 'Problem Solving',
    'Critical Thinking', 'Time Management', 'Agile', 'Scrum',
    'Project Management', 'Collaboration', 'Adaptability',
    'Mentoring', 'Cross-functional', 'Stakeholder Management',
    'Presentation', 'Negotiation', 'Decision Making',
    'Analytical Thinking', 'Creativity', 'Attention to Detail',
  ],
};

// ============================================================
//  Section hints for context-aware scoring
// ============================================================
const SECTION_HINTS = [
  'skills', 'technical skills', 'technologies', 'tools',
  'experience', 'projects', 'work experience', 'professional experience',
  'competencies', 'expertise', 'qualifications', 'core skills',
];

// Fallback general skill gaps
const FOUNDATIONAL_GAPS = [
  {
    skill: 'Testing & QA',
    importance: 'High',
    recommendation: 'Learn unit testing, integration testing, and TDD practices.',
  },
  {
    skill: 'System Design',
    importance: 'High',
    recommendation:
      'Study distributed systems, microservices architecture, and scalability patterns.',
  },
  {
    skill: 'Cloud Fundamentals',
    importance: 'Medium',
    recommendation: 'Get hands-on with AWS, Azure, or GCP fundamentals.',
  },
  {
    skill: 'CI/CD Pipelines',
    importance: 'Medium',
    recommendation: 'Set up an automated deployment pipeline for a personal project.',
  },
  {
    skill: 'Security Best Practices',
    importance: 'High',
    recommendation: 'Study OWASP Top 10, authentication, and encryption techniques.',
  },
];

// ============================================================
//  Helpers
// ============================================================
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeResumeText(text: string): string {
  return text
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\t ]+/g, ' ')
    .trim();
}

/**
 * Pre-scan text and replace known aliases with canonical names so the
 * main regex pass picks them up correctly.
 */
function applyAliases(text: string): string {
  let result = text;
  for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
    const escapedAlias = escapeRegex(alias);
    const aliasRegex = new RegExp(`\\b${escapedAlias}\\b`, 'gi');
    result = result.replace(aliasRegex, canonical);
  }
  return result;
}

/**
 * Build a safe word-boundary regex for a given skill.
 * Skills with special characters use dedicated patterns or escaped versions.
 */
function buildSkillRegex(skill: string): RegExp {
  // Use pre-defined special patterns if available
  if (SPECIAL_SKILL_PATTERNS[skill]) {
    return SPECIAL_SKILL_PATTERNS[skill];
  }
  // Alphanumeric-only tokens → strict word boundary
  if (/^[A-Za-z0-9]+$/.test(skill)) {
    return new RegExp(`\\b${escapeRegex(skill)}\\b`, 'gi');
  }
  // Skills with spaces → phrase match (no word boundary needed)
  if (skill.includes(' ')) {
    return new RegExp(escapeRegex(skill), 'gi');
  }
  // Fall back to general escaped match
  return new RegExp(escapeRegex(skill), 'gi');
}

function toDisplaySkillName(skill: string): string {
  for (const skills of Object.values(SKILL_KEYWORDS)) {
    const match = skills.find(item => item.toLowerCase() === skill.toLowerCase());
    if (match) return match;
  }
  // Capitalise first letter of each word as a fallback
  return skill.replace(/\b\w/g, c => c.toUpperCase());
}

function dedupeGaps(gaps: SkillGap[]): SkillGap[] {
  const seen = new Set<string>();
  return gaps.filter(gap => {
    const key = gap.skill.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ============================================================
//  Years-of-experience bonus
// ============================================================
function extractYearsOfExperienceScore(textLower: string, skillLower: string): number {
  const escapedSkill = escapeRegex(skillLower);
  const patterns = [
    new RegExp(`(\\d{1,2})\\+?\\s*years?[^\\n\\r]{0,60}${escapedSkill}`, 'gi'),
    new RegExp(`${escapedSkill}[^\\n\\r]{0,60}(\\d{1,2})\\+?\\s*years?`, 'gi'),
  ];
  let maxYears = 0;
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    // eslint-disable-next-line no-cond-assign
    while ((match = pattern.exec(textLower)) !== null) {
      const years = Number(match[1]);
      if (Number.isFinite(years)) maxYears = Math.max(maxYears, years);
    }
  }
  return Math.min(maxYears * 3, 24);
}

// ============================================================
//  Skill level calculation
// ============================================================
function calculateSkillLevel(
  text: string,
  lines: string[],
  skill: string,
  mentionCount: number
): number {
  const textLower = text.toLowerCase();
  const skillLower = skill.toLowerCase();
  let score = 25;

  // Mention density
  score += Math.min(mentionCount * 9, 36);

  // Section bonus — skill mentioned in or near a resume section header
  const sectionBonus = lines.some(
    line =>
      line.toLowerCase().includes(skillLower) &&
      SECTION_HINTS.some(hint => line.toLowerCase().includes(hint))
  )
    ? 8
    : 0;
  score += sectionBonus;

  // Proficiency cues on same line
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
      lineLower.includes('hands-on') ||
      lineLower.includes('extensive')
    ) {
      proficiencyScore = Math.max(proficiencyScore, 14);
    } else if (
      lineLower.includes('familiar') ||
      lineLower.includes('basic') ||
      lineLower.includes('beginner') ||
      lineLower.includes('exposure')
    ) {
      proficiencyScore = Math.max(proficiencyScore, 6);
    }
  }
  score += proficiencyScore;

  // Years-of-experience bonus
  score += extractYearsOfExperienceScore(textLower, skillLower);

  // Penalise pure keyword dumps
  if (mentionCount === 1 && proficiencyScore === 0) score -= 6;

  return clamp(Math.round(score), 30, 95);
}

// ============================================================
//  Role signals builder — parses JD into required / preferred sets
// ============================================================
function buildRoleSignals(roleContext?: RoleContext): RoleSignals | null {
  if (!roleContext) return null;

  const rawText = `${roleContext.targetJobPosition || ''}\n${roleContext.targetJobDescription || ''}`;
  const normalizedRoleText = normalizeResumeText(rawText).toLowerCase();

  if (!normalizedRoleText || normalizedRoleText.length < 3) return null;

  const requiredSkills = new Set<string>();
  const preferredSkills = new Set<string>();
  const relevantCategories = new Set<string>();
  const jdKeywords = new Set<string>();

  // Split JD into "required" and "preferred" sections heuristically
  const lines = normalizedRoleText.split('\n');
  let inRequired = false;
  let inPreferred = false;

  const requiredMarkers = [
    'required', 'must have', 'must-have', 'requirements',
    'qualifications', 'mandatory', 'essential', 'you will',
    'responsibilities', 'you need',
  ];
  const preferredMarkers = [
    'preferred', 'nice to have', 'nice-to-have', 'bonus',
    'desirable', 'advantageous', 'optional', 'plus',
  ];

  for (const line of lines) {
    const l = line.trim();
    if (requiredMarkers.some(m => l.includes(m))) {
      inRequired = true;
      inPreferred = false;
    } else if (preferredMarkers.some(m => l.includes(m))) {
      inPreferred = true;
      inRequired = false;
    }

    // Tokenise line into meaningful keywords (length ≥ 2, not stop-words)
    const stopWords = new Set([
      'the','a','an','is','are','in','on','at','to','for','of',
      'and','or','but','with','we','you','our','your','be','have',
      'has','will','should','must','can','may', 'that', 'this',
      'from','about','using','use','any','all','as','by','up',
    ]);
    const tokens = l
      .split(/[\s,;•\-–→]+/)
      .map(t => t.replace(/[^a-z0-9.#+]/gi, '').toLowerCase())
      .filter(t => t.length >= 2 && !stopWords.has(t));

    tokens.forEach(t => jdKeywords.add(t));
  }

  // Walk all skills and bucket them into required / preferred
  for (const [category, skills] of Object.entries(SKILL_KEYWORDS)) {
    for (const skill of skills) {
      const regex = buildSkillRegex(skill);
      regex.lastIndex = 0;
      if (!regex.test(normalizedRoleText)) continue;

      const skillKey = skill.toLowerCase();

      // Determine which portion of the JD this skill appeared in
      let seenInRequired = false;
      let seenInPreferred = false;
      let modeRequired = false;
      let modePreferred = false;

      for (const line of lines) {
        const l = line.trim();
        if (requiredMarkers.some(m => l.includes(m))) {
          modeRequired = true; modePreferred = false;
        } else if (preferredMarkers.some(m => l.includes(m))) {
          modePreferred = true; modeRequired = false;
        }
        const lineRegex = buildSkillRegex(skill);
        lineRegex.lastIndex = 0;
        if (lineRegex.test(l)) {
          if (modeRequired) seenInRequired = true;
          else if (modePreferred) seenInPreferred = true;
          else seenInRequired = true; // default: treat as required
        }
      }

      if (seenInRequired) requiredSkills.add(skillKey);
      else if (seenInPreferred) preferredSkills.add(skillKey);
      relevantCategories.add(category);
    }
  }

  // If no structured sections found, fall back to full-text scan
  if (requiredSkills.size === 0) {
    for (const [category, skills] of Object.entries(SKILL_KEYWORDS)) {
      for (const skill of skills) {
        const regex = buildSkillRegex(skill);
        regex.lastIndex = 0;
        if (regex.test(normalizedRoleText)) {
          requiredSkills.add(skill.toLowerCase());
          relevantCategories.add(category);
        }
      }
    }
  }

  return { requiredSkills, preferredSkills, relevantCategories, normalizedRoleText, jdKeywords };
}

// ============================================================
//  Role-aware level adjustment
// ============================================================
function applyRoleAdjustment(
  baseLevel: number,
  skill: string,
  category: string,
  roleSignals: RoleSignals | null
): number {
  if (!roleSignals) return baseLevel;

  const skillKey = skill.toLowerCase();
  let adjusted = baseLevel;

  if (roleSignals.requiredSkills.has(skillKey)) {
    adjusted += 14;                              // required — strong boost
  } else if (roleSignals.preferredSkills.has(skillKey)) {
    adjusted += 8;                               // preferred — moderate boost
  } else if (roleSignals.relevantCategories.has(category)) {
    adjusted += 4;                               // relevant domain — small boost
  } else if (roleSignals.requiredSkills.size > 0) {
    adjusted -= 5;                               // irrelevant to this role
  }

  return clamp(adjusted, 25, 98);
}

// ============================================================
//  PUBLIC API
// ============================================================

/**
 * Extract skills from resume text using enhanced pattern matching.
 * Returns top 40 skills sorted by level descending.
 */
export function extractSkills(text: string, roleContext?: RoleContext): Skill[] {
  const normalized = normalizeResumeText(text);
  // Pre-apply alias substitutions so synonyms resolve to canonical names
  const aliasExpanded = applyAliases(normalized);
  const lines = aliasExpanded.split('\n').map(l => l.trim());
  const roleSignals = buildRoleSignals(roleContext);
  const foundSkills: Skill[] = [];
  const seenSkills = new Set<string>();

  for (const [category, skills] of Object.entries(SKILL_KEYWORDS)) {
    for (const skill of skills) {
      const regex = buildSkillRegex(skill);
      // Reset stateful regex
      regex.lastIndex = 0;

      const matches = [...aliasExpanded.matchAll(regex)];
      const skillKey = skill.toLowerCase();

      if (matches.length > 0 && !seenSkills.has(skillKey)) {
        seenSkills.add(skillKey);
        let level = calculateSkillLevel(aliasExpanded, lines, skill, matches.length);
        level = applyRoleAdjustment(level, skill, category, roleSignals);

        foundSkills.push({ name: skill, category, level });
      }
    }
  }

  // Sort: role-required skills first, then by level descending
  return foundSkills
    .sort((a, b) => {
      const aRequired = roleSignals?.requiredSkills.has(a.name.toLowerCase()) ? 1 : 0;
      const bRequired = roleSignals?.requiredSkills.has(b.name.toLowerCase()) ? 1 : 0;
      if (bRequired !== aRequired) return bRequired - aRequired;
      return (b.level || 0) - (a.level || 0) || a.name.localeCompare(b.name);
    })
    .slice(0, 40);  // top 40 skills
}

/**
 * Identify skill gaps by comparing extracted skills with role requirements.
 * Returns up to 8 gaps with Critical / High / Medium priority labels.
 */
export function identifySkillGaps(extractedSkills: Skill[], roleContext?: RoleContext): SkillGap[] {
  const extractedSkillNames = new Set(extractedSkills.map(s => s.name.toLowerCase()));
  const roleSignals = buildRoleSignals(roleContext);
  const gaps: SkillGap[] = [];

  // 1) Critical: required skills that are completely missing
  if (roleSignals?.requiredSkills && roleSignals.requiredSkills.size > 0) {
    for (const skill of roleSignals.requiredSkills) {
      if (!extractedSkillNames.has(skill)) {
        const display = toDisplaySkillName(skill);
        gaps.push({
          skill: display,
          importance: 'Critical',
          recommendation: `This skill appears in your target role requirements. Build at least one project showcasing ${display}.`,
        });
      }
    }
  }

  // 2) High: preferred skills that are missing
  if (roleSignals?.preferredSkills && roleSignals.preferredSkills.size > 0) {
    for (const skill of roleSignals.preferredSkills) {
      if (!extractedSkillNames.has(skill)) {
        const display = toDisplaySkillName(skill);
        gaps.push({
          skill: display,
          importance: 'High',
          recommendation: `This is a preferred skill for the target role. Adding it to your portfolio projects would strengthen your application for ${display}.`,
        });
      }
    }
  }

  // 3) Medium: skills present but at low confidence level
  const lowConfidenceSkills = extractedSkills
    .filter(s => (s.level || 0) < 50)
    .sort((a, b) => (a.level || 0) - (b.level || 0))
    .slice(0, 3);

  for (const skill of lowConfidenceSkills) {
    gaps.push({
      skill: `${skill.name} (Depth)`,
      importance: 'Medium',
      recommendation: `Your profile shows basic exposure to ${skill.name}. Build 1-2 practical projects and document key technical decisions to strengthen this area.`,
    });
  }

  // 4) Category-level gaps aligned to the role
  const categoryCoverage = new Set(extractedSkills.map(s => s.category));
  const targetCategories = roleSignals?.relevantCategories?.size
    ? Array.from(roleSignals.relevantCategories)
    : ['Backend', 'Database', 'Cloud', 'DevOps'];

  for (const category of targetCategories) {
    if (!categoryCoverage.has(category)) {
      gaps.push({
        skill: `${category} Skills`,
        importance: roleSignals?.relevantCategories?.has(category) ? 'High' : 'Medium',
        recommendation: `Strengthen ${category} capability with hands-on tasks aligned to production scenarios.`,
      });
    }
  }

  // 5) Foundational gaps as backfill
  for (const gap of FOUNDATIONAL_GAPS) {
    if (!extractedSkillNames.has(gap.skill.toLowerCase())) {
      gaps.push(gap);
    }
  }

  return dedupeGaps(gaps).slice(0, 8);
}

/**
 * Generate personalised interview questions based on extracted skills and role.
 */
export function generateInterviewQuestions(
  skills: Skill[],
  roleContext?: RoleContext
): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];
  const roleTitle = roleContext?.targetJobPosition?.trim();
  const roleSignals = buildRoleSignals(roleContext);

  const technicalSkills = skills
    .filter(s => s.category !== 'Soft Skills')
    .sort((a, b) => (b.level || 0) - (a.level || 0));

  const templates = [
    (skill: string) =>
      `Can you walk through a real production scenario where you used ${skill} and explain your key trade-offs?`,
    (skill: string) =>
      `What is a complex bug or failure you handled with ${skill}, and how did you isolate the root cause?`,
    (skill: string) =>
      `How would you design and validate a scalable implementation that heavily relies on ${skill}?`,
    (skill: string) =>
      `Describe a performance or reliability improvement you delivered using ${skill}. What metrics improved?`,
    (skill: string) =>
      `How do you stay current with the ${skill} ecosystem, and how have you applied recent advances in production?`,
  ];

  for (const [index, skill] of technicalSkills.slice(0, 5).entries()) {
    const template = templates[index % templates.length](skill.name);
    questions.push({
      question: roleTitle ? `For a ${roleTitle} role: ${template}` : template,
      category: skill.category,
      difficulty: skill.level && skill.level > 80 ? 'Advanced' : 'Intermediate',
    });
  }

  // One targeted question for each missing required skill (up to 2)
  if (roleSignals?.requiredSkills?.size) {
    const missingRequired = Array.from(roleSignals.requiredSkills)
      .filter(skill => !skills.some(s => s.name.toLowerCase() === skill))
      .slice(0, 2);

    for (const missingSkill of missingRequired) {
      const display = toDisplaySkillName(missingSkill);
      questions.push({
        question: `This role requires ${display}. Explain how you would approach learning and delivering a first production feature using it within two weeks.`,
        category: 'Role Readiness',
        difficulty: 'Intermediate',
      });
    }
  }

  // System design question if senior-level skills detected
  if (skills.some(s => s.level && s.level > 80)) {
    questions.push({
      question:
        'Design a scalable system for handling millions of concurrent users. Walk through your architecture, data flow, and failure handling.',
      category: 'System Design',
      difficulty: 'Advanced',
    });
  }

  // Behavioural
  questions.push(
    {
      question:
        'Tell me about a time you had to learn a new technology quickly under pressure. How did you approach it and what was the outcome?',
      category: 'Behavioral',
      difficulty: 'Intermediate',
    },
    {
      question:
        'Describe a situation where you had to debug a critical production issue with minimal information. What was your systematic process?',
      category: 'Behavioral',
      difficulty: 'Intermediate',
    }
  );

  return questions.slice(0, 10);
}

/**
 * Calculate overall match score with a transparent 4-component weighted formula.
 *
 * When a job description is provided:
 *   50% — Skill Match ratio (matched required skills / total required)
 *   20% — Skill Depth     (avg level of matched required skills, 0-100)
 *   15% — Coverage Breadth (unique categories covered vs required categories)
 *   15% — Keyword Density  (JD keywords found in extracted skill names)
 *
 * When NO job description is provided → general competency score:
 *   55% — Average skill level
 *   30% — Top-8 skills average level
 *   15% — Category breadth
 */
export function calculateMatchScore(skills: Skill[], roleContext?: RoleContext): number {
  if (skills.length === 0) return 0;

  const roleSignals = buildRoleSignals(roleContext);

  // --- General competency score (no JD) ---
  if (!roleSignals || roleSignals.requiredSkills.size === 0) {
    const avgLevel = skills.reduce((s, skill) => s + (skill.level || 45), 0) / skills.length;
    const topSkillsAvg =
      [...skills]
        .sort((a, b) => (b.level || 0) - (a.level || 0))
        .slice(0, 8)
        .reduce((s, sk) => s + (sk.level || 45), 0) / Math.min(8, skills.length);
    const uniqueCategories = new Set(skills.map(s => s.category)).size;
    const categoryCoverage = uniqueCategories / Object.keys(SKILL_KEYWORDS).length;

    const general = avgLevel * 0.55 + topSkillsAvg * 0.3 + categoryCoverage * 100 * 0.15;
    return clamp(Math.round(general), 0, 99);
  }

  // --- JD-aware score ---
  const totalRequired = roleSignals.requiredSkills.size;
  const matchedSkills = skills.filter(s => roleSignals.requiredSkills.has(s.name.toLowerCase()));
  const matchedCount = matchedSkills.length;

  // Component 1: Skill Match ratio (0-100)
  const skillMatchPct = (matchedCount / totalRequired) * 100;

  // Component 2: Skill Depth — avg level of matched required skills
  const depthPct =
    matchedCount > 0
      ? matchedSkills.reduce((s, sk) => s + (sk.level || 45), 0) / matchedCount
      : 0;

  // Component 3: Coverage Breadth — required categories covered
  const requiredCategories = new Set(
    skills
      .filter(s => roleSignals.requiredSkills.has(s.name.toLowerCase()))
      .map(s => s.category)
  );
  const totalRequiredCategories = roleSignals.relevantCategories.size || 1;
  const breadthPct = (requiredCategories.size / totalRequiredCategories) * 100;

  // Component 4: Keyword Density — JD tokens found in extracted skill names
  const skillTokens = new Set(
    skills.flatMap(s =>
      s.name.toLowerCase().split(/[\s./+#-]+/)
    )
  );
  const jdKeywords = roleSignals.jdKeywords;
  const keywordHits = [...jdKeywords].filter(k => skillTokens.has(k)).length;
  const keywordDensityPct = jdKeywords.size > 0
    ? Math.min((keywordHits / jdKeywords.size) * 200, 100)  // ×2 since JD has many stop words
    : 50;

  const blended =
    skillMatchPct   * 0.50 +
    depthPct        * 0.20 +
    breadthPct      * 0.15 +
    keywordDensityPct * 0.15;

  return clamp(Math.round(blended), 0, 99);
}
