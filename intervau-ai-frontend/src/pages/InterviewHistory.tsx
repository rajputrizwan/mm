import { useState } from 'react';
import { Search, Filter, Calendar, Clock, Award, TrendingUp, ChevronRight, MoreVertical } from 'lucide-react';

interface InterviewSession {
  id: string;
  candidateOrHR: string;
  role: string;
  type: 'mock' | 'live';
  date: string;
  duration: string;
  score: number;
  status: 'completed' | 'pending' | 'scheduled';
}

export default function InterviewHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'mock' | 'live'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const sessions: InterviewSession[] = [
    {
      id: '1',
      candidateOrHR: 'Alex Martinez',
      role: 'Senior Full Stack Developer',
      type: 'mock',
      date: 'Nov 15, 2024',
      duration: '28 min',
      score: 87,
      status: 'completed'
    },
    {
      id: '2',
      candidateOrHR: 'Sarah Johnson',
      role: 'Product Manager',
      type: 'live',
      date: 'Nov 14, 2024',
      duration: '45 min',
      score: 92,
      status: 'completed'
    },
    {
      id: '3',
      candidateOrHR: 'Mike Chen',
      role: 'UI/UX Designer',
      type: 'mock',
      date: 'Nov 12, 2024',
      duration: '25 min',
      score: 78,
      status: 'completed'
    },
    {
      id: '4',
      candidateOrHR: 'Emily Rodriguez',
      role: 'Data Scientist',
      type: 'live',
      date: 'Nov 10, 2024',
      duration: '50 min',
      score: 88,
      status: 'completed'
    },
    {
      id: '5',
      candidateOrHR: 'James Wilson',
      role: 'DevOps Engineer',
      type: 'mock',
      date: 'Nov 8, 2024',
      duration: '32 min',
      score: 81,
      status: 'completed'
    },
    {
      id: '6',
      candidateOrHR: 'Lisa Park',
      role: 'Backend Engineer',
      type: 'live',
      date: 'Nov 5, 2024',
      duration: '42 min',
      score: 85,
      status: 'completed'
    },
    {
      id: '7',
      candidateOrHR: 'David Thompson',
      role: 'Frontend Developer',
      type: 'mock',
      date: 'Nov 1, 2024',
      duration: '29 min',
      score: 79,
      status: 'completed'
    },
    {
      id: '8',
      candidateOrHR: 'Jennifer Lee',
      role: 'QA Engineer',
      type: 'live',
      date: 'Oct 28, 2024',
      duration: '38 min',
      score: 86,
      status: 'completed'
    },
  ];

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.candidateOrHR.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || session.type === filterType;
    return matchesSearch && matchesType;
  });

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 75) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (score >= 65) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview History</h1>
          <p className="text-lg text-gray-600">View and analyze all your past interview sessions</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, role, or interview..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      filterType === 'all'
                        ? 'bg-white text-blue-600 border border-gray-200'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType('mock')}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      filterType === 'mock'
                        ? 'bg-white text-blue-600 border border-gray-200'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Mock
                  </button>
                  <button
                    onClick={() => setFilterType('live')}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      filterType === 'live'
                        ? 'bg-white text-blue-600 border border-gray-200'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Live
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name / Role</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Duration</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Score</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((session) => (
                      <tr key={session.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">{session.candidateOrHR}</p>
                            <p className="text-sm text-gray-600">{session.role}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            session.type === 'mock'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-cyan-100 text-cyan-700'
                          }`}>
                            {session.type === 'mock' ? '🤖' : '👥'} {session.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{session.date}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{session.duration}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getScoreBadgeColor(session.score)}`}>
                            {session.score}%
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(session.status)}`}>
                            <div className="w-2 h-2 rounded-full bg-current" />
                            <span>{session.status}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button className="inline-flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-blue-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">{session.candidateOrHR}</h3>
                        <p className="text-sm text-gray-600">{session.role}</p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Type</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          session.type === 'mock'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-cyan-100 text-cyan-700'
                        }`}>
                          {session.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Date</span>
                        <span className="text-sm font-semibold text-gray-900">{session.date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Duration</span>
                        <span className="text-sm font-semibold text-gray-900">{session.duration}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg mb-4 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Performance</span>
                        <div className="flex items-center space-x-1">
                          <Award className="w-4 h-4 text-blue-600" />
                          <span className="text-lg font-bold text-blue-600">{session.score}%</span>
                        </div>
                      </div>
                    </div>

                    <button className="w-full flex items-center justify-center space-x-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      <span>View Report</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {filteredSessions.length === 0 && (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No interviews found matching your search</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Total Interviews</h3>
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{filteredSessions.length}</p>
            <p className="text-xs text-gray-600 mt-1">Across all types</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Average Score</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {Math.round(filteredSessions.reduce((acc, s) => acc + s.score, 0) / filteredSessions.length)}%
            </p>
            <p className="text-xs text-gray-600 mt-1">Performance average</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Total Duration</h3>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {filteredSessions.reduce((acc, s) => {
                const minutes = parseInt(s.duration.split(' ')[0]);
                return acc + minutes;
              }, 0)} min
            </p>
            <p className="text-xs text-gray-600 mt-1">Total interview time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
