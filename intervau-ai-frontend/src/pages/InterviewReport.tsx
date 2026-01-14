import { useState } from 'react';
import { Download, Share2, ArrowLeft, TrendingUp, CheckCircle, AlertCircle, Award, BarChart3, MessageSquare } from 'lucide-react';
import MetricIndicator from '../components/interview/MetricIndicator';

interface ReportMetric {
  label: string;
  value: number;
  color: 'blue' | 'green' | 'orange' | 'red' | 'cyan';
}

export default function InterviewReport() {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'transcript'>('overview');

  const reportData = {
    candidateName: 'Alex Martinez',
    position: 'Senior Full Stack Developer',
    interviewType: 'Mock Interview',
    date: 'November 15, 2024',
    duration: '28 minutes',
    overallScore: 87,
    aiScore: 92,
    resumeMatch: 88,
  };

  const metrics: ReportMetric[] = [
    { label: 'Confidence', value: 85, color: 'green' },
    { label: 'Clarity', value: 88, color: 'blue' },
    { label: 'Communication', value: 82, color: 'cyan' },
    { label: 'Technical Knowledge', value: 91, color: 'green' },
    { label: 'Problem Solving', value: 84, color: 'orange' },
    { label: 'Eye Contact', value: 76, color: 'orange' },
  ];

  const strengths = [
    'Excellent technical depth and system design knowledge',
    'Clear and articulate communication of complex concepts',
    'Strong problem-solving approach with practical examples',
    'Good time management and pacing of responses',
    'Demonstrates genuine interest in the role',
  ];

  const improvements = [
    'Could elaborate more on teamwork and collaboration examples',
    'Reduce filler words (um, like) by 15-20%',
    'Maintain more consistent eye contact with camera',
    'Provide more specific metrics when discussing achievements',
    'Practice transitions between topics for smoother flow',
  ];

  const recommendations = [
    'Focus on behavioral questions to strengthen culture fit assessment',
    'Prepare specific STAR (Situation, Task, Action, Result) examples',
    'Review company values and mission before next interview',
    'Practice speaking at natural pace with shorter pauses',
  ];

  const transcript = [
    { speaker: 'Interviewer', text: 'Can you explain the difference between RESTful and GraphQL APIs?', time: '00:30' },
    { speaker: 'Candidate', text: 'Great question. REST is an architectural style that uses standard HTTP methods like GET, POST, PUT, and DELETE. Each resource typically has its own endpoint...', time: '00:45' },
    { speaker: 'Interviewer', text: 'How would you handle errors in a REST API?', time: '02:15' },
    { speaker: 'Candidate', text: 'I\'d use standard HTTP status codes. 400 for bad requests, 401 for unauthorized, 404 for not found, and 500 for server errors. I\'d also include meaningful error messages in the response body...', time: '02:30' },
    { speaker: 'Interviewer', text: 'Tell me about a challenging project where you had to make critical decisions.', time: '05:00' },
    { speaker: 'Candidate', text: 'Sure. I led a project to migrate our monolithic backend to microservices. The challenge was maintaining zero downtime while handling thousands of concurrent users. We used a strangler fig pattern...', time: '05:15' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-blue-50 border-blue-200';
    if (score >= 60) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to History</span>
          </button>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{reportData.candidateName}</h1>
                  <p className="text-lg text-gray-600">{reportData.position}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                    <span>{reportData.interviewType}</span>
                    <span>•</span>
                    <span>{reportData.date}</span>
                    <span>•</span>
                    <span>{reportData.duration}</span>
                  </div>
                </div>
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center border-4 ${getScoreBgColor(reportData.overallScore)}`}>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(reportData.overallScore)}`}>
                      {reportData.overallScore}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Score</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">AI Analysis</span>
                  <span className="text-lg font-bold text-blue-600">{reportData.aiScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Resume Match</span>
                  <span className="text-lg font-bold text-cyan-600">{reportData.resumeMatch}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="flex border-b border-gray-200">
                {['overview', 'metrics', 'transcript'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <span>Strengths</span>
                      </h3>
                      <div className="space-y-3">
                        {strengths.map((strength, idx) => (
                          <div key={idx} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-gray-700">{strength}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                        <span>Areas for Improvement</span>
                      </h3>
                      <div className="space-y-3">
                        {improvements.map((improvement, idx) => (
                          <div key={idx} className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
                            <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-gray-700">{improvement}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                        <span>Recommendations</span>
                      </h3>
                      <div className="space-y-3">
                        {recommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-gray-700">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'metrics' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                        <span>Performance Metrics</span>
                      </h3>
                      <div className="grid md:grid-cols-2 gap-8">
                        {metrics.map((metric, idx) => (
                          <MetricIndicator
                            key={idx}
                            label={metric.label}
                            value={metric.value}
                            color={metric.color}
                            variant="bar"
                            showTrend={idx % 2 === 0}
                            trend={idx % 3 === 0 ? 'up' : idx % 3 === 1 ? 'down' : 'stable'}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-4">Key Insights</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-3">
                          <Award className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">Technical knowledge score of 91 indicates excellent preparation</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <Award className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">Communication clarity is above average, making responses easy to follow</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <Award className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">Eye contact could be improved with camera practice techniques</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'transcript' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                      <span>Interview Transcript</span>
                    </h3>
                    <div className="space-y-6">
                      {transcript.map((entry, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-semibold ${
                              entry.speaker === 'Candidate' ? 'text-blue-600' : 'text-gray-900'
                            }`}>
                              {entry.speaker}
                            </span>
                            <span className="text-xs text-gray-500">{entry.time}</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {entry.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Summary</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <p className="text-xs text-gray-600 mb-1">Overall Rating</p>
                  <p className="text-2xl font-bold text-green-600">Excellent</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-600 mb-1">Recommendation</p>
                  <p className="text-sm font-semibold text-blue-600">Move to Next Round</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="font-semibold text-gray-900">3.2s avg</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Words Spoken</span>
                  <span className="font-semibold text-gray-900">1,247</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Filler Words</span>
                  <span className="font-semibold text-gray-900">12</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Speaking Pace</span>
                  <span className="font-semibold text-gray-900">145 WPM</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Next Steps</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 flex-shrink-0 mt-0.5 text-sm font-bold">
                    1
                  </div>
                  <p className="text-sm">Review feedback and areas for improvement</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 flex-shrink-0 mt-0.5 text-sm font-bold">
                    2
                  </div>
                  <p className="text-sm">Practice STAR method for behavioral questions</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 flex-shrink-0 mt-0.5 text-sm font-bold">
                    3
                  </div>
                  <p className="text-sm">Schedule live interview with HR</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
