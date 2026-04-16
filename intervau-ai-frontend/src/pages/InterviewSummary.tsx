import { Download, Share2, TrendingUp, Clock, CheckCircle, AlertCircle, Star } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription } from '../components/common/Card';
import Button from '../components/common/Button';

export default function InterviewSummary() {
  const mockData = {
    candidateName: 'John Candidate',
    position: 'Senior Frontend Developer',
    date: 'November 20, 2025',
    duration: '45:32',
    overallScore: 82,
    metrics: {
      confidence: 78,
      clarity: 85,
      engagement: 82,
      technicalKnowledge: 88,
      communication: 80,
      problemSolving: 84,
    },
    strengths: [
      'Strong technical knowledge in React and TypeScript',
      'Excellent communication skills',
      'Confident and articulate responses',
      'Good problem-solving approach',
    ],
    improvements: [
      'Could provide more specific examples from past projects',
      'Work on structuring answers more concisely',
    ],
    questions: [
      {
        question: 'Tell me about yourself and your background.',
        response: 'Answered confidently with relevant experience',
        score: 85,
      },
      {
        question: 'What interests you about this position?',
        response: 'Clear motivation and alignment with role',
        score: 90,
      },
      {
        question: 'Describe a challenging project you worked on.',
        response: 'Good technical detail but could be more concise',
        score: 75,
      },
    ],
    recommendation: 'Recommend for next round',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Interview Summary</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {mockData.candidateName} - {mockData.position}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" icon={<Share2 className="w-4 h-4" />}>
            Share
          </Button>
          <Button variant="primary" icon={<Download className="w-4 h-4" />}>
            Download Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Overall Score</p>
              <p className="text-4xl font-bold">{mockData.overallScore}%</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Date</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{mockData.date}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Duration</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{mockData.duration}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Questions</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{mockData.questions.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Detailed breakdown of interview performance</CardDescription>
          </CardHeader>

          <div className="space-y-4 mt-4">
            {Object.entries(mockData.metrics).map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}%</span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      value >= 80
                        ? 'bg-green-500'
                        : value >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>Strengths and areas for improvement</CardDescription>
          </CardHeader>

          <div className="space-y-4 mt-4">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Strengths</h4>
              </div>
              <ul className="space-y-2">
                {mockData.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Areas for Improvement</h4>
              </div>
              <ul className="space-y-2">
                {mockData.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Analysis</CardTitle>
          <CardDescription>Performance on individual questions</CardDescription>
        </CardHeader>

        <div className="space-y-4 mt-4">
          {mockData.questions.map((q, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white flex-1">
                  {index + 1}. {q.question}
                </h4>
                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{q.score}%</span>
                  <div className={`w-3 h-3 rounded-full ${
                    q.score >= 80 ? 'bg-green-500' : q.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{q.response}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Recommendation</h3>
            <p className="text-gray-700 dark:text-gray-300">{mockData.recommendation}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
