import { useState, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  MessageSquare,
  ChevronRight,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

interface LiveInterviewRoomProps {
  userRole: 'candidate' | 'hr';
}

export default function LiveInterviewRoom({ userRole }: LiveInterviewRoomProps) {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string; time: string }>>([]);

  const mockQuestions = [
    'Tell me about yourself and your background.',
    'What interests you about this position?',
    'Describe a challenging project you worked on.',
    'How do you handle tight deadlines and pressure?',
    'Where do you see yourself in 5 years?',
  ];

  const mockMetrics = {
    confidence: 78,
    clarity: 85,
    engagement: 82,
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);

    const transcriptTimer = setInterval(() => {
      if (Math.random() > 0.7) {
        const mockTexts = [
          'I have over 5 years of experience in software development.',
          'My background includes working with React and Node.js.',
          'I led a team of developers on a major e-commerce project.',
          'Can you tell me more about the team structure?',
        ];
        setTranscript((prev) => [
          ...prev,
          {
            speaker: Math.random() > 0.5 ? 'Candidate' : 'Interviewer',
            text: mockTexts[Math.floor(Math.random() * mockTexts.length)],
            time: formatTime(sessionTime),
          },
        ]);
      }
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(transcriptTimer);
    };
  }, [sessionTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleEndSession = () => {
    if (confirm('Are you sure you want to end this interview session?')) {
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Live Interview Session</h1>
            <p className="text-sm text-gray-400">
              {userRole === 'hr' ? 'Interviewing: John Candidate' : 'Senior Frontend Developer Position'}
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-gray-400">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg text-white">{formatTime(sessionTime)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Recording</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card padding="none" className="relative overflow-hidden bg-gray-900 border-gray-800 aspect-video">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-cyan-900/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  {videoEnabled ? (
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <Users className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-white font-medium">
                        {userRole === 'hr' ? 'Your Video' : 'Interviewer Video'}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <VideoOff className="w-12 h-12 text-gray-500 mb-2 mx-auto" />
                      <p className="text-gray-400">Camera Off</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <p className="text-white text-sm font-medium">
                  {userRole === 'hr' ? 'You' : 'HR Manager'}
                </p>
              </div>
              {videoEnabled && (
                <div className="absolute top-4 right-4">
                  <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-green-500/30">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-400 text-xs font-medium">Active</span>
                  </div>
                </div>
              )}
            </Card>

            <Card padding="none" className="relative overflow-hidden bg-gray-900 border-gray-800 aspect-video">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  {videoEnabled ? (
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <Users className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-white font-medium">
                        {userRole === 'hr' ? 'Candidate Video' : 'Your Video'}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <VideoOff className="w-12 h-12 text-gray-500 mb-2 mx-auto" />
                      <p className="text-gray-400">Camera Off</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <p className="text-white text-sm font-medium">
                  {userRole === 'hr' ? 'John Candidate' : 'You'}
                </p>
              </div>
              {!audioEnabled && (
                <div className="absolute top-4 right-4 bg-red-500/20 backdrop-blur-sm p-2 rounded-lg border border-red-500/30">
                  <MicOff className="w-5 h-5 text-red-400" />
                </div>
              )}
            </Card>
          </div>

          {userRole === 'hr' && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="bg-gray-900 border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Confidence</p>
                    <p className="text-2xl font-bold text-white mt-1">{mockMetrics.confidence}%</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div className="mt-3 bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${mockMetrics.confidence}%` }}
                  ></div>
                </div>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Clarity</p>
                    <p className="text-2xl font-bold text-white mt-1">{mockMetrics.clarity}%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div className="mt-3 bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${mockMetrics.clarity}%` }}
                  ></div>
                </div>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Engagement</p>
                    <p className="text-2xl font-bold text-white mt-1">{mockMetrics.engagement}%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <div className="mt-3 bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${mockMetrics.engagement}%` }}
                  ></div>
                </div>
              </Card>
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Current Question</h3>
                  <p className="text-sm text-gray-400">
                    Question {currentQuestionIndex + 1} of {mockQuestions.length}
                  </p>
                </div>
              </div>
              {userRole === 'hr' && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ChevronRight className="w-4 h-4" />}
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === mockQuestions.length - 1}
                >
                  Next Question
                </Button>
              )}
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="text-white text-lg leading-relaxed">{mockQuestions[currentQuestionIndex]}</p>
            </div>
          </div>
        </div>

        <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col">
          <div className="border-b border-gray-800">
            <div className="flex">
              <button
                onClick={() => setShowNotes(false)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  !showNotes
                    ? 'text-white bg-gray-800 border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Transcript
              </button>
              <button
                onClick={() => setShowNotes(true)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  showNotes
                    ? 'text-white bg-gray-800 border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Notes
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!showNotes ? (
              <div className="space-y-3">
                {transcript.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Transcript will appear here during the interview</p>
                  </div>
                ) : (
                  transcript.map((entry, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-medium ${
                            entry.speaker === 'Candidate' ? 'text-purple-400' : 'text-blue-400'
                          }`}
                        >
                          {entry.speaker}
                        </span>
                        <span className="text-xs text-gray-500">{entry.time}</span>
                      </div>
                      <p className="text-sm text-gray-300">{entry.text}</p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Take notes during the interview..."
                  className="w-full h-full min-h-[400px] bg-gray-800 text-white placeholder-gray-500 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border-t border-gray-800 px-6 py-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              audioEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setVideoEnabled(!videoEnabled)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              videoEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={handleEndSession}
            className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all"
          >
            <Phone className="w-5 h-5 transform rotate-135" />
          </button>
        </div>
      </div>
    </div>
  );
}
