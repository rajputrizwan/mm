import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, Clock, Target, Zap } from "lucide-react";
import toast from "react-hot-toast";

interface InterviewConfig {
    jobPosition: string;
    jobDescription: string;
    duration: number;
    interviewType: "technical" | "behavioral" | "mixed";
    difficulty: "beginner" | "intermediate" | "advanced";
}

export default function MockInterviewSetup() {
    const navigate = useNavigate();
    const [config, setConfig] = useState<InterviewConfig>({
        jobPosition: "",
        jobDescription: "",
        duration: 30,
        interviewType: "mixed",
        difficulty: "intermediate",
    });

    const durationOptions = [15, 30, 45, 60];

    const interviewTypes = [
        {
            value: "technical" as const,
            label: "Technical",
            description: "Coding, system design, technical knowledge",
            icon: "💻",
            color: "from-blue-500 to-cyan-500",
        },
        {
            value: "behavioral" as const,
            label: "Behavioral",
            description: "STAR method, soft skills, experience",
            icon: "💬",
            color: "from-green-500 to-teal-500",
        },
        {
            value: "mixed" as const,
            label: "Mixed",
            description: "Balanced combination of both types",
            icon: "⚡",
            color: "from-purple-500 to-pink-500",
        },
    ];

    const difficultyLevels = [
        {
            value: "beginner" as const,
            label: "Beginner",
            description: "Entry-level questions",
        },
        {
            value: "intermediate" as const,
            label: "Intermediate",
            description: "Mid-level professional",
        },
        {
            value: "advanced" as const,
            label: "Advanced",
            description: "Senior/Expert level",
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!config.jobPosition.trim()) {
            toast.error("Please enter a job position");
            return;
        }

        // TODO: Navigate to interview session with config
        console.log("Mock Interview Config:", config);
        toast.success("Starting your mock interview...");

        // For now, just show success
        // Later: navigate("/candidate/mock-interview/session", { state: config });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Create Your Mock Interview
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Customize your practice session to match your goals
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Main Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                        {/* Job Position */}
                        <div className="mb-8">
                            <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                Job Position *
                            </label>
                            <input
                                type="text"
                                value={config.jobPosition}
                                onChange={(e) =>
                                    setConfig({ ...config, jobPosition: e.target.value })
                                }
                                placeholder="e.g., Senior Full Stack Developer"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        {/* Job Description */}
                        <div className="mb-8">
                            <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                Job Description{" "}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                    (Optional)
                                </span>
                            </label>
                            <textarea
                                value={config.jobDescription}
                                onChange={(e) =>
                                    setConfig({ ...config, jobDescription: e.target.value })
                                }
                                placeholder="Paste the job description here to help tailor questions to the role..."
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            />
                        </div>

                        {/* Duration */}
                        <div className="mb-8">
                            <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                Interview Duration
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {durationOptions.map((duration) => (
                                    <button
                                        key={duration}
                                        type="button"
                                        onClick={() => setConfig({ ...config, duration })}
                                        className={`py-3 px-4 rounded-xl font-semibold transition-all ${config.duration === duration
                                                ? "bg-blue-600 text-white shadow-lg scale-105"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                            }`}
                                    >
                                        {duration} min
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Interview Type */}
                        <div className="mb-8">
                            <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                Interview Type
                            </label>
                            <div className="grid md:grid-cols-3 gap-4">
                                {interviewTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() =>
                                            setConfig({ ...config, interviewType: type.value })
                                        }
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${config.interviewType === type.value
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105"
                                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">{type.icon}</div>
                                        <div className="font-semibold text-gray-900 dark:text-white mb-1">
                                            {type.label}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {type.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Difficulty Level */}
                        <div>
                            <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                Difficulty Level
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {difficultyLevels.map((level) => (
                                    <button
                                        key={level.value}
                                        type="button"
                                        onClick={() =>
                                            setConfig({ ...config, difficulty: level.value })
                                        }
                                        className={`p-4 rounded-xl border-2 transition-all ${config.difficulty === level.value
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105"
                                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                            }`}
                                    >
                                        <div className="font-semibold text-gray-900 dark:text-white mb-1">
                                            {level.label}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            {level.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            Start Interview →
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
