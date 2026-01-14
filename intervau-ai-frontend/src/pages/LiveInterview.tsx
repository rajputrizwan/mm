import { useState, useEffect } from 'react';
import { Clock, User, Briefcase, Star, Tag, FileText, Plus, MessageSquare, Grid, Maximize2 } from 'lucide-react';
import VideoTile from '../components/interview/VideoTile';
import TranscriptPanel from '../components/interview/TranscriptPanel';
import MetricIndicator from '../components/interview/MetricIndicator';
import ControlBar from '../components/interview/ControlBar';

interface LiveInterviewProps {
  userRole?: 'hr' | 'candidate';
}

export default function LiveInterview({ userRole = 'hr' }: LiveInterviewProps) {
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(1245);
  const [layout, setLayout] = useState<'side-by-side' | 'focus-speaker'>('side-by-side');
  const [showNotes, setShowNotes] = useState(true);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>(['Strong communicator', 'Technical depth']);

  const candidateInfo = {
    name: 'Alex Martinez',
    position: 'Senior Full Stack Developer',
    experience: '6 years',
    aiScore: 92,
    resumeMatch: 88
  };

  const transcriptEntries = [
    { id: '1', speaker: 'Jennifer Smith (HR)', text: 'Hello Alex! Thanks for joining us today. How are you doing?', time: '00:15', isCandidate: false },
    { id: '2', speaker: 'Alex Martinez', text: 'Hi Jennifer! I\'m doing great, thank you. Excited to be here.', time: '00:22', isCandidate: true },
    { id: '3', speaker: 'Jennifer Smith (HR)', text: 'Wonderful! Let\'s start by having you tell me about your experience with React and Node.js.', time: '00:30', isCandidate: false },
    { id: '4', speaker: 'Alex Martinez', text: 'Sure! I\'ve been working with React for about 5 years now. I\'ve built several large-scale applications using React, Redux, and more recently React Query for state management. On the backend, I\'ve worked extensively with Node.js and Express, building RESTful APIs and microservices.', time: '00:38', isCandidate: true },
    { id: '5', speaker: 'Jennifer Smith (HR)', text: 'That\'s impressive. Can you walk me through a challenging project you worked on?', time: '01:25', isCandidate: false },
    { id: '6', speaker: 'Alex Martinez', text: 'Absolutely. One of the most challenging projects was rebuilding our company\'s main platform from a monolith to microservices. We had to maintain zero downtime while migrating thousands of users. I led the frontend migration, which involved creating a component library and establishing new patterns for our team.', time: '01:32', isCandidate: true }
  ];

  const behavioralIndicators = {
    engagement: 89,
    confidence: 85,
    clarity: 87,
    enthusiasm: 82,
    eyeContact: 78,
    responsiveness: 91
  };

  const quickTags = [
    'Team player',
    'Leadership potential',
    'Problem solver',
    'Quick learner',
    'Culture fit',
    'Technical expert',
    'Good communication',
    'Needs improvement',
    'Excellent fit',
    'Creative thinker'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    if (confirm('Are you sure you want to end this interview?')) {
      console.log('Interview ended');
    }
  };

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <span>Live Interview</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">{formatTime(elapsedTime)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setLayout(layout === 'side-by-side' ? 'focus-speaker' : 'side-by-side')}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {layout === 'side-by-side' ? (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Focus Mode</span>
                  </>
                ) : (
                  <>
                    <Grid className="w-4 h-4" />
                    <span className="text-sm font-medium">Split View</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              {layout === 'side-by-side' ? (
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <VideoTile
                    label={candidateInfo.name}
                    participant="candidate"
                    isVideoEnabled={true}
                    isAudioEnabled={true}
                    isActive={true}
                  />
                  <VideoTile
                    label="Jennifer Smith (HR)"
                    participant="hr"
                    isVideoEnabled={videoEnabled}
                    isAudioEnabled={micEnabled}
                    isActive={false}
                  />
                </div>
              ) : (
                <div className="mb-6">
                  <VideoTile
                    label={candidateInfo.name}
                    participant="candidate"
                    isVideoEnabled={true}
                    isAudioEnabled={true}
                    isActive={true}
                    size="large"
                  />
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    <div className="aspect-video rounded-lg overflow-hidden border-2 border-blue-500">
                      <VideoTile
                        label="You"
                        participant="hr"
                        isVideoEnabled={videoEnabled}
                        isAudioEnabled={micEnabled}
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              )}

              <ControlBar
                isMicEnabled={micEnabled}
                isVideoEnabled={videoEnabled}
                onToggleMic={() => setMicEnabled(!micEnabled)}
                onToggleVideo={() => setVideoEnabled(!videoEnabled)}
                onEndSession={handleEndSession}
                showChatToggle
                showParticipantsToggle
              />
            </div>

            {userRole === 'hr' && (
              <>
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Interview Notes</h3>
                    </div>
                    <button
                      onClick={() => setShowNotes(!showNotes)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showNotes ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {showNotes && (
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add your notes here... (e.g., strengths, concerns, follow-up questions)"
                      className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Quick Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleRemoveTag(tag)}
                        className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        <span>{tag}</span>
                        <span className="text-xs">×</span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs text-gray-500 mb-3">Available tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickTags.filter(t => !tags.includes(t)).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleAddTag(tag)}
                          className="inline-flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            <TranscriptPanel
              entries={transcriptEntries}
              title="Live Transcript"
              maxHeight="max-h-96"
              showSearch={userRole === 'hr'}
              showDownload={userRole === 'hr'}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{candidateInfo.name}</h3>
                  <p className="text-sm text-gray-600">{candidateInfo.position}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Experience</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{candidateInfo.experience}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">AI Score</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{candidateInfo.aiScore}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-gray-700">Resume Match</span>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">{candidateInfo.resumeMatch}%</span>
                </div>
              </div>

              {userRole === 'hr' && (
                <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                  View Full Profile
                </button>
              )}
            </div>

            {userRole === 'hr' && (
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center space-x-2 mb-4">
                  <MessageSquare className="w-5 h-5" />
                  <h3 className="font-semibold">Live Behavioral Indicators</h3>
                </div>
                <div className="space-y-4">
                  <MetricIndicator
                    label="Engagement"
                    value={behavioralIndicators.engagement}
                    color="green"
                    trend="up"
                    showTrend
                  />
                  <MetricIndicator
                    label="Confidence"
                    value={behavioralIndicators.confidence}
                    color="blue"
                    trend="stable"
                    showTrend
                  />
                  <MetricIndicator
                    label="Clarity"
                    value={behavioralIndicators.clarity}
                    color="cyan"
                    trend="up"
                    showTrend
                  />
                  <MetricIndicator
                    label="Enthusiasm"
                    value={behavioralIndicators.enthusiasm}
                    color="orange"
                    trend="up"
                    showTrend
                  />
                  <MetricIndicator
                    label="Eye Contact"
                    value={behavioralIndicators.eyeContact}
                    color="green"
                    trend="stable"
                    showTrend
                  />
                  <MetricIndicator
                    label="Responsiveness"
                    value={behavioralIndicators.responsiveness}
                    color="cyan"
                    trend="up"
                    showTrend
                  />
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Interview Guide</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-medium text-blue-900 mb-1">Technical Assessment</p>
                  <p className="text-xs text-gray-700">React, Node.js, System Design</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xs font-medium text-green-900 mb-1">Behavioral Questions</p>
                  <p className="text-xs text-gray-700">Leadership, Teamwork, Challenges</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-xs font-medium text-orange-900 mb-1">Culture Fit</p>
                  <p className="text-xs text-gray-700">Values, Work style, Goals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
