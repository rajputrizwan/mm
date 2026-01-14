import { useState } from 'react';
import { Upload, FileText, CheckCircle, Sparkles, Code, Briefcase, Award, TrendingUp } from 'lucide-react';

export default function Resume() {
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      setTimeout(() => {
        setUploading(false);
        setUploaded(true);
      }, 2000);
    }
  };

  const extractedData = {
    name: 'Sarah Johnson',
    title: 'Senior Full Stack Developer',
    summary: 'Experienced software engineer with 6+ years of expertise in building scalable web applications. Proven track record of leading development teams and delivering high-quality solutions using modern technologies.',
    skills: [
      { name: 'React', level: 90, category: 'Frontend' },
      { name: 'Node.js', level: 85, category: 'Backend' },
      { name: 'TypeScript', level: 88, category: 'Languages' },
      { name: 'Python', level: 75, category: 'Languages' },
      { name: 'AWS', level: 80, category: 'Cloud' },
      { name: 'Docker', level: 78, category: 'DevOps' },
      { name: 'MongoDB', level: 82, category: 'Database' },
      { name: 'GraphQL', level: 76, category: 'API' },
    ],
    experience: [
      {
        company: 'Tech Solutions Inc.',
        role: 'Senior Full Stack Developer',
        duration: '2021 - Present',
        highlights: ['Led team of 5 developers', 'Improved performance by 40%', 'Built microservices architecture']
      },
      {
        company: 'Startup Hub',
        role: 'Full Stack Developer',
        duration: '2019 - 2021',
        highlights: ['Developed core product features', 'Implemented CI/CD pipeline', 'Mentored junior developers']
      },
    ],
    recommendations: [
      'Consider highlighting leadership experience in technical discussions',
      'Your system design skills are a strong asset',
      'Practice behavioral questions around team conflict resolution',
    ]
  };

  if (!uploaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Resume Analysis</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Upload Your Resume</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI will extract your skills, experience, and provide personalized interview preparation insights
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-12 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
            <label htmlFor="resume-upload" className="cursor-pointer block">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
                  ) : (
                    <Upload className="w-12 h-12 text-white" />
                  )}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {uploading ? 'Analyzing Resume...' : 'Drop your resume here'}
                </h3>
                <p className="text-gray-600 mb-6">
                  or click to browse (PDF, DOC, DOCX up to 10MB)
                </p>

                {!uploading && (
                  <div className="inline-block">
                    <span className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow">
                      Select File
                    </span>
                  </div>
                )}
              </div>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <Code className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Skill Extraction</h4>
                <p className="text-sm text-gray-600">Identify technical and soft skills automatically</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Gap Analysis</h4>
                <p className="text-sm text-gray-600">Discover areas for improvement</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Interview Prep</h4>
                <p className="text-sm text-gray-600">Personalized question recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-3">
              <CheckCircle className="w-4 h-4" />
              <span>Analysis Complete</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Resume Analysis</h1>
          </div>
          <button
            onClick={() => setUploaded(false)}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:shadow-lg transition-shadow"
          >
            Upload New Resume
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <FileText className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-sm font-medium text-gray-600 mb-1">Resume File</h3>
            <p className="text-lg font-semibold text-gray-900">resume_sarah.pdf</p>
            <p className="text-sm text-gray-500 mt-1">Uploaded 2 minutes ago</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <Award className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="text-sm font-medium text-gray-600 mb-1">Skills Extracted</h3>
            <p className="text-lg font-semibold text-gray-900">{extractedData.skills.length} Skills</p>
            <p className="text-sm text-gray-500 mt-1">Across 5 categories</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="text-sm font-medium text-gray-600 mb-1">Match Score</h3>
            <p className="text-lg font-semibold text-gray-900">87%</p>
            <p className="text-sm text-gray-500 mt-1">For senior positions</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Summary</h2>
              <p className="text-gray-700 leading-relaxed">{extractedData.summary}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Skills Analysis</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {extractedData.skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-semibold text-gray-900">{skill.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{skill.category}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Experience</h2>
              <div className="space-y-6">
                {extractedData.experience.map((exp, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                      </div>
                      <span className="text-sm text-gray-500">{exp.duration}</span>
                    </div>
                    <ul className="space-y-1 mt-2">
                      {exp.highlights.map((highlight, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
              <Sparkles className="w-8 h-8 mb-3" />
              <h2 className="text-xl font-bold mb-4">AI Recommendations</h2>
              <div className="space-y-3">
                {extractedData.recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <Briefcase className="w-8 h-8 text-blue-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900 mb-4">Suggested Positions</h2>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="font-semibold text-gray-900 text-sm">Senior Full Stack Engineer</p>
                  <p className="text-xs text-gray-600 mt-1">95% match</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="font-semibold text-gray-900 text-sm">Tech Lead</p>
                  <p className="text-xs text-gray-600 mt-1">88% match</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="font-semibold text-gray-900 text-sm">Engineering Manager</p>
                  <p className="text-xs text-gray-600 mt-1">82% match</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
