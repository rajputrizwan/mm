import { useState } from 'react';
import { MessageSquare, Download, Search } from 'lucide-react';

interface TranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  time: string;
  isCandidate?: boolean;
}

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
  title?: string;
  maxHeight?: string;
  showSearch?: boolean;
  showDownload?: boolean;
}

export default function TranscriptPanel({
  entries,
  title = 'Transcript',
  maxHeight = 'max-h-96',
  showSearch = false,
  showDownload = true
}: TranscriptPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntries = searchTerm
    ? entries.filter(entry =>
        entry.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.speaker.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : entries;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
              {entries.length} messages
            </span>
          </div>
          {showDownload && (
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transcript..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      <div className={`${maxHeight} overflow-y-auto p-4`}>
        <div className="space-y-4">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="group">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    entry.isCandidate ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {entry.speaker}
                  </span>
                  <span className="text-xs text-gray-500">{entry.time}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{entry.text}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No messages found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
