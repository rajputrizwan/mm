import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface EngagementMetrics {
  timestamp: number;
  face_detected: boolean;
  eye_contact: boolean;
  eye_contact_duration: number;
  head_pose: {
    pitch: number;
    yaw: number;
    roll: number;
  };
  engagement_score: number;
  engagement_level: string;
  distraction_duration: number;
  yawn_detected: boolean;
  gaze_x: number;
  gaze_y: number;
  gaze_variation_x: number;
  gaze_variation_y: number;
  mar: number;
  blink_ratio: number;
  is_blinking: boolean;
  is_focused: boolean;
  face_landmarks: Array<{
    x: number;
    y: number;
    z: number;
  }>;
}

interface UseEngagementTrackingOptions {
  sessionId: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled?: boolean;
  frameInterval?: number; // milliseconds
  onMetricsUpdate?: (metrics: EngagementMetrics) => void;
  onError?: (error: string) => void;
}

export function useEngagementTracking({
  sessionId,
  videoRef,
  enabled = true,
  frameInterval = 500,
  onMetricsUpdate,
  onError,
}: UseEngagementTrackingOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestMetrics, setLatestMetrics] = useState<EngagementMetrics | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [framesSent, setFramesSent] = useState(0);
  const [metricsReceived, setMetricsReceived] = useState(0);
  const [lastTransportError, setLastTransportError] = useState<string | null>(null);

  // ── Refs ────────────────────────────────────────────────────────────────────
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameInFlightRef = useRef(false);
  const metricsCallbackRef = useRef<((metrics: EngagementMetrics) => void) | undefined>(onMetricsUpdate);
  const errorCallbackRef = useRef<((error: string) => void) | undefined>(onError);

  /**
   * KEY FIX: Track session-active state in a ref so that the frame-capture
   * closure (created once per interval) always reads the *current* value
   * instead of the stale boolean that existed when the interval was created.
   */
  const isSessionActiveRef = useRef(false);

  // Keep callback refs up-to-date without re-rendering
  useEffect(() => {
    metricsCallbackRef.current = onMetricsUpdate;
  }, [onMetricsUpdate]);

  useEffect(() => {
    errorCallbackRef.current = onError;
  }, [onError]);

  // Resolve the Node backend WebSocket URL
  const resolveBackendUrl = useCallback(() => {
    const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
    if (!raw) return "http://localhost:5000";
    try {
      const parsed = new URL(raw);
      return parsed.origin;
    } catch {
      return raw.replace(/\/api\/?$/, "");
    }
  }, []);

  // Create (and cache) the off-screen canvas for frame capture
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = 640;
      canvasRef.current.height = 480;
    }
  }, []);

  // ── WebSocket connection ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const backendUrl = resolveBackendUrl();
    console.log(`🔌 Connecting to engagement socket at ${backendUrl}/engagement`);

    const newSocket = io(`${backendUrl}/engagement`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 10000,
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to engagement socket:", newSocket.id);
      setIsConnected(true);
      setLastTransportError(null);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from engagement socket:", reason);
      setIsConnected(false);
    });

    newSocket.on("engagement-metrics", (metrics: EngagementMetrics) => {
      setLatestMetrics(metrics);
      setMetricsReceived((prev) => prev + 1);
      metricsCallbackRef.current?.(metrics);
    });

    newSocket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error.message);
      setIsConnected(false);
      const msg = `Socket error: ${error.message}`;
      setLastTransportError(msg);
      errorCallbackRef.current?.(msg);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [enabled, resolveBackendUrl]);

  // ── Frame capture ────────────────────────────────────────────────────────────
  /**
   * Uses `isSessionActiveRef` (not state) so stale-closure is avoided.
   * `socket`, `videoRef`, `sessionId` change infrequently; putting them in the
   * deps is fine.
   */
  const captureAndSendFrame = useCallback(() => {
    const socketNow = socket;
    if (
      !socketNow ||
      !socketNow.connected ||
      !videoRef.current ||
      !canvasRef.current ||
      !isSessionActiveRef.current ||    // ← ref, never stale
      frameInFlightRef.current
    ) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (
      !ctx ||
      video.readyState < video.HAVE_CURRENT_DATA ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      return;
    }

    try {
      const sourceWidth = video.videoWidth;
      const sourceHeight = video.videoHeight;
      const maxWidth = 640;
      const scale = sourceWidth > maxWidth ? maxWidth / sourceWidth : 1;
      const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
      const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameBase64 = canvas.toDataURL("image/jpeg", 0.7);

      frameInFlightRef.current = true;
      setFramesSent((prev) => prev + 1);

      const ackTimeoutId = window.setTimeout(() => {
        if (frameInFlightRef.current) {
          frameInFlightRef.current = false;
          const message = "Frame analyze timeout (no ack in 5s)";
          setLastTransportError(message);
          errorCallbackRef.current?.(message);
        }
      }, 5000);

      socketNow.emit(
        "analyze-frame",
        {
          sessionId,
          frame: frameBase64,
          timestamp: Date.now() / 1000,   // FastAPI expects float seconds
        },
        (response?: { success?: boolean; error?: string }) => {
          window.clearTimeout(ackTimeoutId);
          frameInFlightRef.current = false;
          if (!response?.success && response?.error) {
            setLastTransportError(response.error);
            errorCallbackRef.current?.(response.error);
          }
        },
      );
    } catch (error) {
      frameInFlightRef.current = false;
      console.error("Error capturing frame:", error);
    }
  }, [socket, videoRef, sessionId]);

  // ── Start session ────────────────────────────────────────────────────────────
  const startEngagementTracking = useCallback(async (): Promise<boolean> => {
    if (!socket || !socket.connected) {
      const msg = "Socket not connected – cannot start engagement session";
      console.warn(msg);
      errorCallbackRef.current?.(msg);
      return false;
    }

    return new Promise<boolean>((resolve) => {
      socket.emit("start-session", { sessionId }, (response: { success: boolean; error?: string }) => {
        if (response?.success) {
          // Update both state and ref atomically
          isSessionActiveRef.current = true;
          setIsSessionActive(true);
          setLastTransportError(null);
          setFramesSent(0);
          setMetricsReceived(0);

          // Start the interval – captureAndSendFrame reads isSessionActiveRef
          if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
          frameIntervalRef.current = setInterval(captureAndSendFrame, frameInterval);

          console.log("✅ Engagement tracking started for session:", sessionId);
          resolve(true);
        } else {
          const err = response?.error ?? "Failed to start engagement session";
          console.error("Failed to start session:", err);
          setLastTransportError(err);
          errorCallbackRef.current?.(err);
          resolve(false);
        }
      });
    });
  }, [socket, sessionId, captureAndSendFrame, frameInterval]);

  // ── Stop session ─────────────────────────────────────────────────────────────
  const stopEngagementTracking = useCallback(async (): Promise<unknown> => {
    // Stop interval first regardless of server state
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    frameInFlightRef.current = false;
    isSessionActiveRef.current = false;

    if (!socket || !isSessionActive) {
      setIsSessionActive(false);
      return null;
    }

    return new Promise((resolve) => {
      socket.emit("end-session", { sessionId }, (response: { success: boolean; summary?: unknown; error?: string }) => {
        isSessionActiveRef.current = false;
        setIsSessionActive(false);

        if (response?.success) {
          console.log("✅ Engagement tracking stopped, summary:", response.summary);
          resolve(response.summary ?? null);
        } else {
          console.error("Failed to end session:", response?.error);
          errorCallbackRef.current?.(response?.error ?? "Failed to end session");
          resolve(null);
        }
      });
    });
  }, [socket, sessionId, isSessionActive]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      isSessionActiveRef.current = false;
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    };
  }, []);

  return {
    isConnected,
    isSessionActive,
    latestMetrics,
    debug: {
      framesSent,
      metricsReceived,
      lastTransportError,
    },
    startEngagementTracking,
    stopEngagementTracking,
  };
}
