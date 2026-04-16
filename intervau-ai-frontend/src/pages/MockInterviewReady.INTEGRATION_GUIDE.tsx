/**
 * Engagement Integration for MockInterviewReady
 *
 * This file provides instructions for integrating engagement tracking
 * into the MockInterviewReady component.
 *
 * STEPS TO INTEGRATE:
 *
 * 1. Import the necessary hooks and components at the top of MockInterviewReady.tsx:
 */

// Add these imports to MockInterviewReady.tsx
import { useEngagementTracking } from "../hooks/useEngagementTracking";
import { EngagementOverlay } from "../components/interview/EngagementOverlay";

/**
 * 2. Add engagement tracking hook after existing state declarations (around line 77):
 */

// Add after videoRef and streamRef declarations
const {
  isConnected: engagementConnected,
  isSessionActive: engagementActive,
  latestMetrics: engagementMetrics,
  startEngagementTracking,
  stopEngagementTracking,
} = useEngagementTracking({
  sessionId: sessionId || "",
  videoRef,
  enabled: !!sessionConfig && status.camera === "passed",
  frameInterval: 500, // 2 FPS
  onMetricsUpdate: (metrics) => {
    console.log("📊 Real-time engagement:", metrics);
  },
  onError: (error) => {
    console.error("❌ Engagement error:", error);
    toast.error("Engagement tracking unavailable");
  },
});

/**
 * 3. Add auto-start effect after the cleanup effect (around line 149):
 */

// Auto-start engagement tracking when camera check passes
useEffect(() => {
  if (
    status.camera === "passed" &&
    engagementConnected &&
    !engagementActive &&
    sessionId
  ) {
    console.log("🚀 Auto-starting engagement tracking...");
    startEngagementTracking();
  }
}, [
  status.camera,
  engagementConnected,
  engagementActive,
  sessionId,
  startEngagementTracking,
]);

/**
 * 4. Update the cleanup effect to stop engagement tracking (modify around line 136):
 */

// Cleanup on unmount (MODIFY EXISTING)
useEffect(() => {
  return () => {
    // Stop engagement tracking
    if (engagementActive) {
      stopEngagementTracking();
    }

    // Existing cleanup code...
    micActiveRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (_) {}
    }
  };
}, [engagementActive, stopEngagementTracking]);

/**
 * 5. Add engagement overlay to the video display section.
 *
 * Find the video element in the JSX (around line 400-450) and add the overlay:
 */

// FIND THIS SECTION (the video preview section):
<div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
  {/* Existing video element */}
  <video
    ref={videoRef}
    autoPlay
    playsInline
    muted
    className="w-full h-full object-cover mirror-effect"
  />

  {/* ADD THIS: Engagement Overlay */}
  {status.camera === "passed" && engagementMetrics && (
    <div className="absolute top-4 right-4 w-64 z-10">
      <EngagementOverlay metrics={engagementMetrics} />
    </div>
  )}

  {/* Engagement connection status indicator */}
  {status.camera === "passed" && (
    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-white bg-black/50 px-3 py-1 rounded-full">
      <div
        className={`w-2 h-2 rounded-full ${engagementConnected ? "bg-green-500" : "bg-red-500 animate-pulse"}`}
      />
      <span>{engagementConnected ? "Engagement Active" : "Connecting..."}</span>
    </div>
  )}
</div>;

/**
 * 6. (Optional) Display engagement status in the system check section:
 */

// Add after the speaker check section (around line 350)
{
  /* Engagement Tracking Status */
}
<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
  <div className="flex items-center gap-3">
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center ${
        engagementConnected
          ? "bg-green-100 text-green-600"
          : "bg-gray-100 text-gray-400"
      }`}
    >
      <Sparkles className="w-5 h-5" />
    </div>
    <div>
      <p className="font-medium text-gray-900">Engagement Tracking</p>
      <p className="text-sm text-gray-500">
        {engagementConnected && engagementActive
          ? "Monitoring your engagement"
          : engagementConnected
            ? "Ready to track"
            : "Connecting..."}
      </p>
    </div>
  </div>
  <div>
    {engagementConnected && engagementActive ? (
      <CheckCircle className="w-6 h-6 text-green-500" />
    ) : engagementConnected ? (
      <CheckCircle className="w-6 h-6 text-blue-500" />
    ) : (
      <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
    )}
  </div>
</div>;

/**
 * 7. Update the "Start Interview" button to ensure engagement is ready:
 */

// MODIFY the startInterview function (around line 280):
const startInterview = async () => {
  if (!allChecksPassed) {
    toast.error(t("mockInterview.systemCheckRequired"));
    return;
  }

  setStarting(true);
  try {
    // Ensure engagement tracking is active before starting
    if (!engagementActive && engagementConnected) {
      console.log("🚀 Starting engagement tracking before interview...");
      await startEngagementTracking();
      // Small delay to ensure tracking is initialized
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const response = await api.startMockInterviewSession(sessionId!);
    if (response.success) {
      localStorage.setItem("interviewStartedAt", new Date().toISOString());
      toast.success(t("mockInterview.interviewStarted"));
      navigate(ROUTES.MOCK_INTERVIEW_SESSION(sessionId!));
    } else {
      toast.error(t("mockInterview.failedToStart"));
    }
  } catch (err) {
    console.error("Error starting interview:", err);
    toast.error(t("mockInterview.failedToStart"));
  } finally {
    setStarting(false);
  }
};

/**
 * COMPLETE! Your MockInterviewReady component now has:
 * ✅ Automatic engagement tracking when camera is ready
 * ✅ Real-time engagement overlay on video preview
 * ✅ Connection status indicators
 * ✅ Proper cleanup on unmount
 * ✅ Integration with interview start flow
 */

export const ENGAGEMENT_INTEGRATION_COMPLETE = true;
