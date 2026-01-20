import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Briefcase,
    FileText,
    Clock,
    Users,
    Eye,
    Settings,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Check,
    Loader2,
    ArrowLeft,
    Calendar,
    Trash2,
    RefreshCw,
} from "lucide-react";
import { ROUTES } from "../router";
import toast from "react-hot-toast";
import { api } from "../services/api";
import ShareLinkModal from "../components/interview/ShareLinkModal";
import { getQuestionTypeColor } from "../constants/interviewConstants";

// Types
interface InterviewQuestion {
    text: string;
    type: string;
    expectedAnswer?: string;
}

interface FormData {
    jobPosition: string;
    jobDescription: string;
    interviewType: "mock" | "live";
    interviewModes: string[];
    duration: 15 | 30 | 45 | 60;
    availability: {
        type: "anytime" | "scheduled";
        scheduledDate?: string;
    };
    visibility: "public" | "private";
    aiSettings: {
        difficultyLevel: "junior" | "mid" | "senior";
        autoScore: boolean;
        enableAiFeedback: boolean;
    };
}

const INTERVIEW_MODES = [
    { id: "technical", label: "Technical", icon: "💻" },
    { id: "behavioral", label: "Behavioral", icon: "🤝" },
    { id: "experience", label: "Experience", icon: "📋" },
    { id: "problem_solving", label: "Problem Solving", icon: "🧩" },
    { id: "leadership", label: "Leadership", icon: "👑" },
];

const DURATION_OPTIONS = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "60 minutes" },
];

const DIFFICULTY_LEVELS = [
    { value: "junior", label: "Junior", description: "Entry-level questions" },
    { value: "mid", label: "Mid-Level", description: "Intermediate questions" },
    { value: "senior", label: "Senior", description: "Advanced questions" },
];

export default function HRCreateInterview() {
    const navigate = useNavigate();
    const [showAiSettings, setShowAiSettings] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [shareableLink, setShareableLink] = useState<string | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        jobPosition: "",
        jobDescription: "",
        interviewType: "mock",
        interviewModes: [],
        duration: 30,
        availability: {
            type: "anytime",
        },
        visibility: "public",
        aiSettings: {
            difficultyLevel: "mid",
            autoScore: true,
            enableAiFeedback: true,
        },
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Handle input changes
    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    // Handle interview mode toggle
    const toggleInterviewMode = (modeId: string) => {
        setFormData((prev) => ({
            ...prev,
            interviewModes: prev.interviewModes.includes(modeId)
                ? prev.interviewModes.filter((m) => m !== modeId)
                : [...prev.interviewModes, modeId],
        }));
        if (errors.interviewModes) {
            setErrors((prev) => ({ ...prev, interviewModes: "" }));
        }
    };

    // Handle AI setting toggle
    const handleAiSettingToggle = (setting: "autoScore" | "enableAiFeedback") => {
        setFormData((prev) => ({
            ...prev,
            aiSettings: {
                ...prev.aiSettings,
                [setting]: !prev.aiSettings[setting],
            },
        }));
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.jobPosition.trim()) {
            newErrors.jobPosition = "Job position is required";
        }
        if (!formData.jobDescription.trim()) {
            newErrors.jobDescription = "Job description is required";
        }
        if (formData.interviewModes.length === 0) {
            newErrors.interviewModes = "Select at least one interview mode";
        }
        if (
            formData.interviewType === "live" &&
            formData.availability.type === "scheduled" &&
            !formData.availability.scheduledDate
        ) {
            newErrors.scheduledDate = "Please select a date and time";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Generate questions using AI
    const handleGenerateQuestions = async () => {
        if (!validateForm()) {
            toast.error("Please fill in all required fields");
            return;
        }

        setGenerating(true);
        try {
            const response = await api.generateInterviewQuestions({
                jobPosition: formData.jobPosition,
                jobDescription: formData.jobDescription,
                interviewModes: formData.interviewModes,
                difficultyLevel: formData.aiSettings.difficultyLevel,
                questionCount: Math.ceil(formData.duration / 5), // ~1 question per 5 minutes
                duration: `${formData.duration} Min`,
            });

            if (response.success && response.data) {
                setQuestions(response.data);
                toast.success(`Generated ${response.data.length} interview questions!`);
            } else {
                toast.error(response.error || "Failed to generate questions");
            }
        } catch (error: any) {
            console.error("Error generating questions:", error);
            toast.error("Failed to generate questions. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    // Remove a question
    const removeQuestion = (index: number) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    // Save interview template
    const handleSaveInterview = async () => {
        if (!validateForm()) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (questions.length === 0) {
            toast.error("Please generate questions before saving");
            return;
        }

        setSaving(true);
        try {
            const response = await api.createInterviewTemplate({
                ...formData,
                questions: questions.map((q, index) => ({ ...q, id: index + 1 })),
            });

            if (response.success && response.data) {
                toast.success("Interview created successfully!");
                // Show share modal with the generated link
                setShareableLink(response.data.shareableLink);
                setShowShareModal(true);
            } else {
                toast.error(response.error || "Failed to create interview");
            }
        } catch (error: any) {
            console.error("Error saving interview:", error);
            toast.error("Failed to save interview. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(ROUTES.HR_DASHBOARD)}
                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Create Interview
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Configure AI-powered interviews for candidates
                    </p>
                </div>

                {/* Form Container */}
                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center mb-6">
                            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg mr-3">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Basic Information
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {/* Job Position */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Job Position <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="jobPosition"
                                    value={formData.jobPosition}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Senior React Developer"
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.jobPosition
                                        ? "border-red-500 dark:border-red-500"
                                        : "border-gray-200 dark:border-gray-600"
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                />
                                {errors.jobPosition && (
                                    <p className="mt-1 text-sm text-red-500">{errors.jobPosition}</p>
                                )}
                            </div>

                            {/* Job Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Job Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="jobDescription"
                                    value={formData.jobDescription}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Describe the role, responsibilities, and requirements..."
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.jobDescription
                                        ? "border-red-500 dark:border-red-500"
                                        : "border-gray-200 dark:border-gray-600"
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
                                />
                                {errors.jobDescription && (
                                    <p className="mt-1 text-sm text-red-500">{errors.jobDescription}</p>
                                )}
                            </div>

                            {/* Interview Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Interview Type <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    {["mock", "live"].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    interviewType: type as "mock" | "live",
                                                    availability: {
                                                        type: type === "mock" ? "anytime" : prev.availability.type,
                                                    },
                                                }))
                                            }
                                            className={`p-4 rounded-lg border-2 transition-all ${formData.interviewType === type
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                                }`}
                                        >
                                            <div className="flex items-center justify-center mb-2">
                                                {type === "mock" ? (
                                                    <span className="text-2xl">🎭</span>
                                                ) : (
                                                    <span className="text-2xl">🎥</span>
                                                )}
                                            </div>
                                            <p className="font-semibold text-gray-900 dark:text-white capitalize">
                                                {type} Interview
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {type === "mock"
                                                    ? "AI-powered practice"
                                                    : "Real-time with recruiter"}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interview Configuration */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center mb-6">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-lg mr-3">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Interview Configuration
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {/* Interview Modes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Interview Modes <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {INTERVIEW_MODES.map((mode) => (
                                        <button
                                            key={mode.id}
                                            type="button"
                                            onClick={() => toggleInterviewMode(mode.id)}
                                            className={`p-3 rounded-lg border-2 transition-all text-center ${formData.interviewModes.includes(mode.id)
                                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                                }`}
                                        >
                                            <span className="text-xl block mb-1">{mode.icon}</span>
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {mode.label}
                                            </span>
                                            {formData.interviewModes.includes(mode.id) && (
                                                <Check className="w-4 h-4 text-green-500 mx-auto mt-1" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {errors.interviewModes && (
                                    <p className="mt-2 text-sm text-red-500">{errors.interviewModes}</p>
                                )}
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Interview Duration
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {DURATION_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    duration: option.value as 15 | 30 | 45 | 60,
                                                }))
                                            }
                                            className={`py-3 px-4 rounded-lg border-2 transition-all ${formData.duration === option.value
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                                }`}
                                        >
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {option.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Availability & Visibility */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center mb-6">
                            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg mr-3">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Availability & Visibility
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Availability */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Availability
                                </label>
                                {formData.interviewType === "mock" ? (
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            Anytime / On-demand
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Candidates can take this mock interview at any time
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="availabilityType"
                                                    checked={formData.availability.type === "anytime"}
                                                    onChange={() =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            availability: { type: "anytime" },
                                                        }))
                                                    }
                                                    className="mr-2"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    Flexible
                                                </span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="availabilityType"
                                                    checked={formData.availability.type === "scheduled"}
                                                    onChange={() =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            availability: { type: "scheduled" },
                                                        }))
                                                    }
                                                    className="mr-2"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    Scheduled
                                                </span>
                                            </label>
                                        </div>
                                        {formData.availability.type === "scheduled" && (
                                            <div>
                                                <input
                                                    type="datetime-local"
                                                    value={formData.availability.scheduledDate || ""}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            availability: {
                                                                ...prev.availability,
                                                                scheduledDate: e.target.value,
                                                            },
                                                        }))
                                                    }
                                                    className={`w-full px-4 py-3 rounded-lg border ${errors.scheduledDate
                                                        ? "border-red-500"
                                                        : "border-gray-200 dark:border-gray-600"
                                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                                />
                                                {errors.scheduledDate && (
                                                    <p className="mt-1 text-sm text-red-500">
                                                        {errors.scheduledDate}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Visibility */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    <Eye className="w-4 h-4 inline mr-1" />
                                    Visibility
                                </label>
                                <div className="space-y-3">
                                    {[
                                        {
                                            value: "public",
                                            label: "Public",
                                            desc: "Available to all candidates",
                                        },
                                        {
                                            value: "private",
                                            label: "Private",
                                            desc: "Invite-only access",
                                        },
                                    ].map((option) => (
                                        <label
                                            key={option.value}
                                            className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.visibility === option.value
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="visibility"
                                                value={option.value}
                                                checked={formData.visibility === option.value}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        visibility: e.target.value as "public" | "private",
                                                    }))
                                                }
                                                className="mt-1 mr-3"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {option.label}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {option.desc}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Settings (Collapsible) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setShowAiSettings(!showAiSettings)}
                            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <div className="flex items-center">
                                <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-lg mr-3">
                                    <Settings className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        AI Settings
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Optional configuration for AI behavior
                                    </p>
                                </div>
                            </div>
                            {showAiSettings ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                        </button>

                        {showAiSettings && (
                            <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700 pt-6">
                                <div className="space-y-6">
                                    {/* Difficulty Level */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Difficulty Level
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {DIFFICULTY_LEVELS.map((level) => (
                                                <button
                                                    key={level.value}
                                                    type="button"
                                                    onClick={() =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            aiSettings: {
                                                                ...prev.aiSettings,
                                                                difficultyLevel: level.value as
                                                                    | "junior"
                                                                    | "mid"
                                                                    | "senior",
                                                            },
                                                        }))
                                                    }
                                                    className={`p-3 rounded-lg border-2 transition-all text-center ${formData.aiSettings.difficultyLevel === level.value
                                                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                                        }`}
                                                >
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {level.label}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {level.description}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* AI Toggles */}
                                    <div className="space-y-4">
                                        {/* Auto-score */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    Auto-score answers
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    AI will automatically score candidate responses
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleAiSettingToggle("autoScore")}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${formData.aiSettings.autoScore
                                                    ? "bg-green-500"
                                                    : "bg-gray-300 dark:bg-gray-600"
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.aiSettings.autoScore
                                                        ? "translate-x-7"
                                                        : "translate-x-1"
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        {/* AI Feedback */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    Enable AI feedback
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Provide detailed feedback to candidates after interview
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleAiSettingToggle("enableAiFeedback")}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${formData.aiSettings.enableAiFeedback
                                                    ? "bg-green-500"
                                                    : "bg-gray-300 dark:bg-gray-600"
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.aiSettings.enableAiFeedback
                                                        ? "translate-x-7"
                                                        : "translate-x-1"
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Generate Questions Button */}
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={handleGenerateQuestions}
                            disabled={generating}
                            className="flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Generating Questions...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Generate Questions with AI
                                </>
                            )}
                        </button>
                    </div>

                    {/* Generated Questions */}
                    {questions.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="bg-gradient-to-br from-cyan-500 to-blue-500 p-2 rounded-lg mr-3">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Generated Questions ({questions.length})
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleGenerateQuestions}
                                    disabled={generating}
                                    className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                >
                                    <RefreshCw className={`w-4 h-4 mr-1 ${generating ? "animate-spin" : ""}`} />
                                    Regenerate
                                </button>
                            </div>

                            <div className="space-y-4">
                                {questions.map((question, index) => (
                                    <div
                                        key={index}
                                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-2">
                                                    <span className={`${getQuestionTypeColor(question.type).bg} ${getQuestionTypeColor(question.type).text} text-xs font-semibold px-2.5 py-1 rounded-full mr-2 capitalize border ${getQuestionTypeColor(question.type).border}`}>
                                                        {question.type.replace("_", " ")}
                                                    </span>
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                        Q{index + 1}
                                                    </span>
                                                </div>
                                                <p className="text-gray-900 dark:text-white font-medium mb-2">
                                                    {question.text}
                                                </p>
                                                {question.expectedAnswer && (
                                                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                                                        <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                                                            Expected Answer:
                                                        </p>
                                                        <p className="text-sm text-green-600 dark:text-green-300">
                                                            {question.expectedAnswer}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(index)}
                                                className="ml-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    {questions.length > 0 && (
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate(ROUTES.HR_DASHBOARD)}
                                className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveInterview}
                                disabled={saving}
                                className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5 mr-2" />
                                        Save Interview
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Share Link Modal */}
            <ShareLinkModal
                isOpen={showShareModal}
                onClose={() => {
                    setShowShareModal(false);
                    navigate(ROUTES.HR_DASHBOARD);
                }}
                interviewLink={shareableLink || ''}
                jobPosition={formData.jobPosition}
            />
        </div>
    );
}
