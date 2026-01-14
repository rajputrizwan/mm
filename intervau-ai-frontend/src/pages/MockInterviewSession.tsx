import { useState, useEffect } from 'react';
import { Clock, ChevronRight, Sparkles, BarChart3, FileText, AlertCircle } from 'lucide-react';
import VideoTile from '../components/interview/VideoTile';
import QuestionCard from '../components/interview/QuestionCard';
import TranscriptPanel from '../components/interview/TranscriptPanel';
import MetricIndicator from '../components/interview/MetricIndicator';
import ControlBar from '../components/interview/ControlBar';

export default function MockInterviewSession() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(765);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const questions = [
    {
      id: '1',
      category: 'Technical',
      text: 'Can you explain the difference between RESTful and GraphQL APIs, and when would you use one over the other?',
      duration: '5 minutes'
    },
    {
      id: '2',
      category: 'Behavioral',
      text: 'Tell me about a time when you had to deal with a difficult team member. How did you handle the situation?',
      duration: '5 minutes'
    },
    {
      id: '3',
      category: 'Technical',
      text: 'How would you optimize the performance of a React application that is experiencing slow rendering?',
      duration: '5 minutes'
    },
    {
      id: '4',
      category: 'Problem Solving',
      text: 'Design a system for a ride-sharing application. What components would you include and how would they interact?',
      duration: '10 minutes'
    },
    {
      id: '5',
      category: 'Behavioral',
      text: 'Describe a situation where you had to make a critical decision with incomplete information. What was your approach?',
      duration: '5 minutes'
    }
  ];

  const transcriptEntries = [
    { id: '1', speaker: 'AI Interviewer', text: 'Hello! Welcome to your mock interview. Let\'s begin with some technical questions.', time: '00:15', isCandidate: false },
    { id: '2', speaker: 'You', text: 'Thank you, I\'m ready to start.', time: '00:22', isCandidate: true },
    { id: '3', speaker: 'AI Interviewer', text: 'Great! Can you explain the difference between RESTful and GraphQL APIs?', time: '00:28', isCandidate: false },
    { id: '4', speaker: 'You', text: 'Sure! REST is an architectural style that uses standard HTTP methods like GET, POST, PUT, and DELETE. It typically has multiple endpoints for different resources. GraphQL, on the other hand, uses a single endpoint and allows clients to specify exactly what data they need through queries.', time: '00:35', isCandidate: true },
    { id: '5', speaker: 'AI Interviewer', text: 'Excellent explanation. Can you elaborate on when you would choose one over the other?', time: '01:42', isCandidate: false },
    { id: '6', speaker: 'You', text: 'I would choose REST for simpler applications with well-defined resources and standard CRUD operations. It\'s easier to cache and has better tooling support. GraphQL is better for complex applications where clients need flexible data fetching, especially mobile apps that need to minimize data transfer.', time: '01:50', isCandidate: true },
    { id: '7', speaker: 'AI Interviewer', text: 'That\'s a comprehensive answer. Let\'s move to the next question.', time: '02:45', isCandidate: false }
  ];

  const liveMetrics = {
    confidence: 82,
    clarity: 78,
    pace: 75,
    eyeContact: 71,
    technicalAccuracy: 88,
    articulation: 85
  };

  const speakingPatterns = {
    fillerWords: 12,
    avgResponseTime: '3.2s',
    totalWords: 458,
    avgWordsPerMinute: 145
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      setIsSpeaking(Math.random() > 0.7);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleEndSession = () => {
    if (confirm('Are you sure you want to end this interview session?')) {
      console.log('Session ended');
    }
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <span>Recording</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">{formatTime(elapsedTime)}</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">30:00</span>
              </div>
              {isSpeaking && (
                <div className="flex items-center space-x-2 bg-green-100 text-green-600 px-4 py-2 rounded-lg font-medium">
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-green-600 rounded-full animate-pulse" />
                    <div className="w-1 h-4 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-4 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span>Speaking</span>
                </div>
              )}
            </div>
            <div className="text-gray-600 font-medium">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-600 to-cyan-600 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="lg:col-span-2 xl:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <VideoTile
                label="You"
                participant="candidate"
                isVideoEnabled={videoEnabled}
                isAudioEnabled={micEnabled}
                isActive={isSpeaking}
              />

              <div className="mt-6">
                <ControlBar
                  isMicEnabled={micEnabled}
                  isVideoEnabled={videoEnabled}
                  onToggleMic={() => setMicEnabled(!micEnabled)}
                  onToggleVideo={() => setVideoEnabled(!videoEnabled)}
                  onEndSession={handleEndSession}
                />
              </div>
            </div>

            <QuestionCard
              question={questions[currentQuestionIndex].text}
              category={questions[currentQuestionIndex].category}
              duration={questions[currentQuestionIndex].duration}
              number={currentQuestionIndex + 1}
              total={questions.length}
            />

            {currentQuestionIndex < questions.length - 1 && (
              <button
                onClick={handleNextQuestion}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                <span>Next Question</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Speaking Patterns</h3>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{speakingPatterns.fillerWords}</p>
                  <p className="text-xs text-gray-600 mt-1">Filler Words</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{speakingPatterns.avgResponseTime}</p>
                  <p className="text-xs text-gray-600 mt-1">Avg Response</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{speakingPatterns.totalWords}</p>
                  <p className="text-xs text-gray-600 mt-1">Total Words</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-cyan-600">{speakingPatterns.avgWordsPerMinute}</p>
                  <p className="text-xs text-gray-600 mt-1">Words/Minute</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-semibold">Live AI Analysis</h3>
              </div>
              <div className="space-y-4">
                <MetricIndicator
                  label="Confidence"
                  value={liveMetrics.confidence}
                  color="green"
                  trend="up"
                  showTrend
                />
                <MetricIndicator
                  label="Clarity"
                  value={liveMetrics.clarity}
                  color="blue"
                  trend="stable"
                  showTrend
                />
                <MetricIndicator
                  label="Pace"
                  value={liveMetrics.pace}
                  color="cyan"
                  trend="up"
                  showTrend
                />
                <MetricIndicator
                  label="Eye Contact"
                  value={liveMetrics.eyeContact}
                  color="orange"
                  trend="down"
                  showTrend
                />
                <MetricIndicator
                  label="Technical Accuracy"
                  value={liveMetrics.technicalAccuracy}
                  color="green"
                  trend="up"
                  showTrend
                />
                <MetricIndicator
                  label="Articulation"
                  value={liveMetrics.articulation}
                  color="cyan"
                  trend="stable"
                  showTrend
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <h4 className="text-sm font-semibold text-gray-900">Real-time Tips</h4>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-700">Maintain eye contact with the camera</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xs text-gray-700">Great use of technical examples!</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-xs text-gray-700">Try to reduce filler words</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-4 h-4 text-gray-600" />
                <h4 className="text-sm font-semibold text-gray-900">Question List</h4>
              </div>
              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`p-3 rounded-lg border transition-all ${
                      idx === currentQuestionIndex
                        ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                        : idx < currentQuestionIndex
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-900">Q{idx + 1}</span>
                      <span className="text-xs bg-white px-2 py-0.5 rounded text-gray-600">
                        {q.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2">{q.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <TranscriptPanel
              entries={transcriptEntries}
              maxHeight="max-h-80"
              showDownload
            />
          </div>
        </div>
      </div>
    </div>
  );
}
