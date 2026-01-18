import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Share2, ArrowLeft, TrendingUp, CheckCircle, AlertCircle, Award, BarChart3, MessageSquare } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import MetricIndicator from '../components/interview/MetricIndicator';
import { ROUTES } from '../router';

interface ReportMetric {
  label: string;
  value: number;
  color: 'blue' | 'green' | 'orange' | 'red' | 'cyan';
}

export default function InterviewReport() {
  const navigate = useNavigate();
  const { id } = useParams();
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

  // Get recommendation based on score
  const getRecommendation = (score: number) => {
    if (score >= 85) {
      return {
        rating: 'Excellent',
        action: 'Move to Next Round',
        bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800',
        textColor: 'text-green-600 dark:text-green-400'
      };
    } else if (score >= 70) {
      return {
        rating: 'Good',
        action: 'Consider for Next Round',
        bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-100 dark:border-blue-800',
        textColor: 'text-blue-600 dark:text-blue-400'
      };
    } else if (score >= 60) {
      return {
        rating: 'Fair',
        action: 'Additional Practice Recommended',
        bgColor: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-100 dark:border-orange-800',
        textColor: 'text-orange-600 dark:text-orange-400'
      };
    } else {
      return {
        rating: 'Needs Improvement',
        action: 'Retry After Practice',
        bgColor: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-100 dark:border-red-800',
        textColor: 'text-red-600 dark:text-red-400'
      };
    }
  };

  const recommendation = getRecommendation(reportData.overallScore);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (score >= 70) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    if (score >= 60) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  // Handle PDF download
  const handleDownload = async () => {
    try {
      toast.loading('Generating PDF...');

      const element = document.getElementById('report-content');
      if (!element) {
        toast.error('Report content not found');
        return;
      }

      // Capture as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Download with formatted filename
      const filename = `Interview-Report-${reportData.candidateName.replace(/ /g, '-')}.pdf`;
      pdf.save(filename);

      toast.dismiss();
      toast.success('PDF downloaded successfully!');

    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error('Failed to generate PDF');
    }
  };

  // Handle share (copy link to clipboard)
  const handleShare = async () => {
    try {
      const reportUrl = `${window.location.origin}/interview-report/${id || 'demo'}`;

      // Try modern Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(reportUrl);
        toast.success('Report link copied to clipboard!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = reportUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Link copied!');
      }

    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to copy link');
    }
  };

  // Handle back navigation
  const handleBackToHistory = () => {
    navigate(ROUTES.INTERVIEW_HISTORY);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBackToHistory}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to History</span>
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download</span>
            </button>
          </div>
        </div>

        <div id="report-content" className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{reportData.candidateName}</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">{reportData.position}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
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
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Score</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Analysis</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{reportData.aiScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Resume Match</span>
                  <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{reportData.resumeMatch}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {(['overview', 'metrics', 'transcript'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-medium transition-colors ${activeTab === tab
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <span>Strengths</span>
                      </h3>
                      <div className="space-y-3">
                        {strengths.map((strength, idx) => (
                          <div key={idx} className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                            <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-gray-700 dark:text-gray-300">{strength}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        <span>Areas for Improvement</span>
                      </h3>
                      <div className="space-y-3">
                        {improvements.map((improvement, idx) => (
                          <div key={idx} className="flex items-start space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800">
                            <div className="w-2 h-2 bg-orange-600 dark:bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-gray-700 dark:text-gray-300">{improvement}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <span>Recommendations</span>
                      </h3>
                      <div className="space-y-3">
                        {recommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-gray-700 dark:text-gray-300">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'metrics' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                        <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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

                    <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Key Insights</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-3">
                          <Award className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">Technical knowledge score of 91 indicates excellent preparation</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">Communication clarity is above average, making responses easy to follow</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <Award className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">Eye contact could be improved with camera practice techniques</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'transcript' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                      <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <span>Interview Transcript</span>
                    </h3>
                    <div className="space-y-6">
                      {transcript.map((entry, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-semibold ${entry.speaker === 'Candidate' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                              }`}>
                              {entry.speaker}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{entry.time}</span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Performance Summary</h3>
              <div className="space-y-4">
                <div className={`p-4 bg-gradient-to-br ${recommendation.bgColor} rounded-lg border`}>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Overall Rating</p>
                  <p className={`text-2xl font-bold ${recommendation.textColor}`}>{recommendation.rating}</p>
                </div>
                <div className={`p-4 bg-gradient-to-br ${recommendation.bgColor} rounded-lg border`}>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Recommendation</p>
                  <p className={`text-sm font-semibold ${recommendation.textColor}`}>{recommendation.action}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                  <span className="font-semibold text-gray-900 dark:text-white">3.2s avg</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Words Spoken</span>
                  <span className="font-semibold text-gray-900 dark:text-white">1,247</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Filler Words</span>
                  <span className="font-semibold text-gray-900 dark:text-white">12</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Speaking Pace</span>
                  <span className="font-semibold text-gray-900 dark:text-white">145 WPM</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 rounded-2xl shadow-lg p-6 text-white">
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
