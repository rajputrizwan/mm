import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Video,
  Mic,
  CheckCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { ROUTES } from "../router";
import toast from "react-hot-toast";

export default function MockInterview() {
  const navigate = useNavigate();

  // Permission states
  const [cameraReady, setCameraReady] = useState(false);
  const [microphoneReady, setMicrophoneReady] = useState(false);
  const [checking, setChecking] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);

  // Session configuration
  const [sessionConfig] = useState({
    position: "Senior Full Stack Developer",
    duration: 30,
    questionCount: 4,
    difficulty: "Intermediate",
  });

  // Question pool for AI session
  const questionPool = {
    technical: [
      {
        id: 1,
        category: "Technical",
        difficulty: "Intermediate",
        text: "Can you explain the difference between RESTful and GraphQL APIs, and when would you use one over the other?",
        duration: 5,
      },
      {
        id: 3,
        category: "Technical",
        difficulty: "Intermediate",
        text: "How would you optimize the performance of a React application that is experiencing slow rendering?",
        duration: 5,
      },
      {
        id: 5,
        category: "Technical",
        difficulty: "Advanced",
        text: "Explain the concept of closures in JavaScript and provide a practical use case.",
        duration: 5,
      },
      {
        id: 7,
        category: "Technical",
        difficulty: "Intermediate",
        text: "What are the key differences between SQL and NoSQL databases? When would you choose each?",
        duration: 5,
      },
    ],
    behavioral: [
      {
        id: 2,
        category: "Behavioral",
        difficulty: "Intermediate",
        text: "Tell me about a time when you had to deal with a difficult team member. How did you handle the situation?",
        duration: 5,
      },
      {
        id: 4,
        category: "Behavioral",
        difficulty: "Intermediate",
        text: "Describe a situation where you had to meet a tight deadline. What was your approach?",
        duration: 5,
      },
      {
        id: 6,
        category: "Behavioral",
        difficulty: "Intermediate",
        text: "Tell me about a project you're particularly proud of. What made it successful?",
        duration: 5,
      },
    ],
    problemSolving: [
      {
        id: 8,
        category: "Problem Solving",
        difficulty: "Advanced",
        text: "Design a system for a ride-sharing application. What components would you include and how would they interact?",
        duration: 10,
      },
    ],
  };

  // Check camera and microphone permissions
  const checkPermissions = async () => {
    try {
      setChecking(true);
      setPermissionError(null);

      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Success - permissions granted
      setCameraReady(true);
      setMicrophoneReady(true);
      toast.success("Camera and microphone access granted.");

      // Stop the stream (we don't need it running continuously)
      stream.getTracks().forEach((track) => track.stop());
    } catch (error: any) {
      console.error("Permission error:", error);

      if (error.name === "NotAllowedError") {
        setPermissionError(
          "Camera and microphone access was denied. Please allow access to continue.",
        );
        toast.error("Please allow camera and microphone access.");
      } else if (error.name === "NotFoundError") {
        setPermissionError(
          "No camera or microphone detected. Please connect your devices.",
        );
        toast.error("No camera or microphone found.");
      } else if (error.name === "NotReadableError") {
        setPermissionError(
          "Camera or microphone is in use by another application.",
        );
        toast.error("Device is already in use.");
      } else {
        setPermissionError(
          "Unable to access the camera or microphone. Please check your browser settings.",
        );
        toast.error("Unable to access the camera or microphone.");
      }

      setCameraReady(false);
      setMicrophoneReady(false);
    } finally {
      setChecking(false);
    }
  };

  // Generate question queue based on difficulty and count
  const generateQuestionQueue = (count: number) => {
    const techCount = Math.floor(count / 2);
    const behavCount = Math.ceil(count / 2);

    const selectedQuestions = [
      ...questionPool.technical.slice(0, techCount),
      ...questionPool.behavioral.slice(0, behavCount),
    ];

    // Shuffle questions
    return selectedQuestions.sort(() => Math.random() - 0.5);
  };

  // Generate unique session ID
  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Initialize AI session
  const initializeAISession = async (): Promise<string> => {
    // Generate question queue
    const questions = generateQuestionQueue(sessionConfig.questionCount);

    // Create session object
    const session = {
      id: generateSessionId(),
      position: sessionConfig.position,
      duration: sessionConfig.duration,
      questionCount: sessionConfig.questionCount,
      difficulty: sessionConfig.difficulty,
      questions,
      startedAt: new Date().toISOString(),
    };

    // Store in localStorage
    localStorage.setItem("currentInterviewSession", JSON.stringify(session));

    // Simulate initialization delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return session.id;
  };

  // Handle start interview button click
  const handleStartInterview = async () => {
    if (!cameraReady || !microphoneReady) {
      toast.error("Please allow camera and microphone access first.");
      return;
    }

    try {
      setInitializing(true);

      // Initialize AI session
      const sessionId = await initializeAISession();

      // Navigate to interview session
      navigate(ROUTES.MOCK_INTERVIEW_SESSION.replace(":sessionId", sessionId), {
        state: {
          sessionConfig,
        },
      });
    } catch (error) {
      console.error("Failed to start interview:", error);
      toast.error("Unable to start the interview. Please try again.");
    } finally {
      setInitializing(false);
    }
  };

  // Check permissions on component mount
  useEffect(() => {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError(
        "Your browser does not support camera or microphone access. Please use a modern browser like Chrome, Firefox, or Edge.",
      );
      return;
    }

    checkPermissions();
  }, []);

  // Get permission status display
  const getPermissionStatus = (ready: boolean, checking: boolean) => {
    if (checking)
      return {
        text: "Checking...",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    if (ready)
      return {
        text: "Ready",
        color: "text-green-600 dark:text-green-400",
      };
    return {
      text: "Access Denied",
      color: "text-red-600 dark:text-red-400",
    };
  };

  const isButtonDisabled = !cameraReady || !microphoneReady || initializing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Mock Interview
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Practice with our intelligent interviewer and get instant feedback
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Interview Details
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                Position
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {sessionConfig.position}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                Duration
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {sessionConfig.duration} minutes
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                Questions
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {sessionConfig.questionCount} Questions
              </p>
            </div>
            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-100 dark:border-cyan-800">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                Difficulty
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {sessionConfig.difficulty}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              What to expect:
            </h3>
            <div className="space-y-3">
              {[
                "Mix of technical and behavioral questions",
                "Real-time AI analysis of your responses",
                "Evaluation of communication clarity and confidence",
                "Detailed performance report at the end",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              System Check
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Camera Access
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {checking ? (
                    <Loader2 className="w-4 h-4 text-yellow-600 dark:text-yellow-400 animate-spin" />
                  ) : null}
                  <span
                    className={`font-medium ${
                      getPermissionStatus(cameraReady, checking).color
                    }`}
                  >
                    {getPermissionStatus(cameraReady, checking).text}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mic className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Microphone Access
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {checking ? (
                    <Loader2 className="w-4 h-4 text-yellow-600 dark:text-yellow-400 animate-spin" />
                  ) : null}
                  <span
                    className={`font-medium ${
                      getPermissionStatus(microphoneReady, checking).color
                    }`}
                  >
                    {getPermissionStatus(microphoneReady, checking).text}
                  </span>
                </div>
              </div>
            </div>

            {permissionError && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-700 dark:text-red-400 text-sm">
                    {permissionError}
                  </p>
                </div>
              </div>
            )}

            {(!cameraReady || !microphoneReady) && !checking && (
              <button
                onClick={checkPermissions}
                className="mt-4 w-full py-2 px-4 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Permission Check</span>
              </button>
            )}
          </div>

          <button
            onClick={handleStartInterview}
            disabled={isButtonDisabled}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              isButtonDisabled
                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-gray-200"
                : "bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 hover:shadow-xl text-white"
            }`}
          >
            {initializing ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Initializing AI...</span>
              </div>
            ) : (
              "Start Interview"
            )}
          </button>

          {isButtonDisabled && !initializing && (
            <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
              Please allow camera and microphone access to start the interview
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
