import { Mail, Phone, Briefcase, Award, TrendingUp, MessageSquare, Download, Eye, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function CandidateReview() {
  const candidateData = {
    name: 'Alex Martinez',
    position: 'Senior Full Stack Developer',
    email: 'alex.martinez@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    appliedDate: 'March 10, 2024',
    avatar: 'AM',
    status: 'qualified',
    overallScore: 92,
    yearsExperience: 6,
    summary: 'Highly skilled full stack engineer with extensive experience in building scalable web applications. Strong technical foundation combined with excellent communication skills and leadership potential.',
  };

  const scores = [
    { label: 'Technical Knowledge', score: 88, category: 'Technical' },
    { label: 'Problem Solving', score: 92, category: 'Technical' },
    { label: 'Communication', score: 89, category: 'Soft Skills' },
    { label: 'Leadership', score: 85, category: 'Soft Skills' },
    { label: 'Cultural Fit', score: 94, category: 'Cultural' },
    { label: 'Confidence', score: 87, category: 'Behavioral' },
  ];

  const interviews = [
    {
      id: 1,
      type: 'mock',
      date: 'March 15, 2024',
      duration: '45 min',
      score: 89,
      feedback: 'Strong technical knowledge. Could improve on behavioral questions.',
      interviewer: 'AI Interviewer',
    },
    {
      id: 2,
      type: 'live',
      date: 'March 18, 2024',
      duration: '60 min',
      score: 94,
      feedback: 'Excellent communication and problem-solving skills. Great fit for the team.',
      interviewer: 'Jennifer Smith (Hiring Manager)',
    },
  ];

  const strengths = [
    'Exceptional technical depth in React and Node.js',
    'Clear articulation of complex concepts',
    'Proactive problem-solver with systematic approach',
    'Great team collaboration abilities',
    'Leadership experience with proven mentoring track record',
  ];

  const improvements = [
    'Could provide more concrete examples in behavioral scenarios',
    'System design concepts could be explored deeper',
    'Limited experience with certain cloud platforms',
  ];

  const skillsMatch = [
    { skill: 'React', required: true, proficiency: 'Expert', match: 95 },
    { skill: 'Node.js', required: true, proficiency: 'Expert', match: 93 },
    { skill: 'TypeScript', required: true, proficiency: 'Advanced', match: 88 },
    { skill: 'AWS', required: false, proficiency: 'Intermediate', match: 72 },
    { skill: 'Docker', required: false, proficiency: 'Advanced', match: 85 },
    { skill: 'MongoDB', required: false, proficiency: 'Intermediate', match: 80 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button className="text-blue-600 hover:text-blue-700 font-medium mb-4">← Back to Candidates</button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{candidateData.name}</h1>
              <p className="text-gray-600">{candidateData.position}</p>
            </div>
            <div className="text-right">
              <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-3">
                Highly Qualified
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ml-auto">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Candidate Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-600">{candidateData.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-600">{candidateData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-600">{candidateData.yearsExperience} years experience</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">Location</p>
                  <p className="text-gray-900 mb-4">{candidateData.location}</p>
                  <p className="text-sm text-gray-600 mb-2 font-medium">Applied Date</p>
                  <p className="text-gray-900">{candidateData.appliedDate}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Summary</h2>
              <p className="text-gray-700 leading-relaxed">{candidateData.summary}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Scores</h2>
              <div className="space-y-4">
                {scores.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{item.label}</span>
                        <span className="text-xs text-gray-500 ml-2">{item.category}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{item.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Skills Match</h2>
              <div className="space-y-4">
                {skillsMatch.map((skill) => (
                  <div key={skill.skill} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-gray-900">{skill.skill}</span>
                        {skill.required && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">Required</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">{skill.proficiency}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-blue-600">{skill.match}%</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${skill.match}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Interview Transcripts</h2>
              <div className="space-y-6">
                {interviews.map((interview) => (
                  <div key={interview.id} className="border-l-4 border-blue-500 pl-6 pb-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {interview.type === 'live' ? 'Live Interview' : 'Mock Interview'}
                          </h3>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            interview.type === 'live'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {interview.type === 'live' ? 'Live' : 'Mock'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{interview.interviewer}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{interview.score}%</p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span>{interview.date}</span>
                      <span>•</span>
                      <span>{interview.duration}</span>
                    </div>
                    <p className="text-gray-700 mb-3">{interview.feedback}</p>
                    <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                      <Eye className="w-4 h-4" />
                      <span>View Full Transcript</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold mb-2">{candidateData.overallScore}%</div>
                <p className="text-blue-100">Overall AI Score</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-100 mb-2">Interview Average: 91%</p>
                <p className="text-sm text-blue-100">Technical Average: 90%</p>
              </div>
              <button className="w-full py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Schedule Interview
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Strengths</span>
              </h3>
              <ul className="space-y-3">
                {strengths.map((strength, idx) => (
                  <li key={idx} className="flex space-x-3 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span>Areas to Improve</span>
              </h3>
              <ul className="space-y-3">
                {improvements.map((improvement, idx) => (
                  <li key={idx} className="flex space-x-3 text-sm text-gray-700">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Recommendation</h3>
              <p className="text-sm text-gray-700 mb-4">
                Strong candidate with excellent technical foundation and soft skills. Recommended for Senior Full Stack Developer role.
              </p>
              <div className="space-y-2">
                <button className="w-full py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">
                  Approve & Proceed
                </button>
                <button className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Add to Pool
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
