import { useState } from 'react';
import { X, Copy, Check, Mail, MessageSquare, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    interviewLink: string;
    jobPosition: string;
}

/**
 * ShareLinkModal - Modal for sharing interview links
 * Provides copy link, email, WhatsApp, and Slack sharing options
 */
export default function ShareLinkModal({
    isOpen,
    onClose,
    interviewLink,
    jobPosition,
}: ShareLinkModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const fullUrl = `${window.location.origin}/interview/${interviewLink}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    const handleEmailShare = () => {
        const subject = encodeURIComponent(`Interview Invitation: ${jobPosition}`);
        const body = encodeURIComponent(
            `You have been invited to an interview for the ${jobPosition} position.\n\nClick the link below to start your interview:\n${fullUrl}\n\nGood luck!`
        );
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    };

    const handleWhatsAppShare = () => {
        const text = encodeURIComponent(
            `🎯 Interview Invitation\n\nPosition: ${jobPosition}\n\nClick to start: ${fullUrl}`
        );
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const handleSlackShare = () => {
        // Slack doesn't have a direct share URL, but we can copy a formatted message
        const slackMessage = `🎯 *Interview Invitation*\n\n*Position:* ${jobPosition}\n*Link:* ${fullUrl}`;
        navigator.clipboard.writeText(slackMessage).then(() => {
            toast.success('Slack message copied! Paste in your Slack channel.');
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Share2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Share Interview</h2>
                                <p className="text-sm text-white/80">{jobPosition}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Copy Link Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Interview Link
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={fullUrl}
                                readOnly
                                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm overflow-hidden text-ellipsis"
                            />
                            <button
                                onClick={handleCopyLink}
                                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${copied
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg'
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Share Options */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Share via
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {/* Email */}
                            <button
                                onClick={handleEmailShare}
                                className="flex flex-col items-center gap-2 p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors group"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email
                                </span>
                            </button>

                            {/* WhatsApp */}
                            <button
                                onClick={handleWhatsAppShare}
                                className="flex flex-col items-center gap-2 p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors group"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <MessageSquare className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    WhatsApp
                                </span>
                            </button>

                            {/* Slack */}
                            <button
                                onClick={handleSlackShare}
                                className="flex flex-col items-center gap-2 p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors group"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Slack
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Tip:</strong> Candidates can access this link to start their AI-powered interview.
                            The link is unique and will remain active until you deactivate it.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
