import axios, { AxiosInstance, AxiosError } from 'axios';

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
}

interface EngagementSummary {
  session_id: string;
  total_frames_analyzed: number;
  average_engagement_score: number;
  total_eye_contact_duration: number;
  total_distraction_duration: number;
  yawn_count: number;
  engagement_trend: number[];
}

/**
 * Build a structured log prefix for engagement service calls.
 * Makes it easy to filter these lines in logs.
 */
const tag = (method: string, sessionId?: string) =>
  `[EngagementSvc:${method}]${sessionId ? ` session=${sessionId}` : ''}`;

class EngagementService {
  private client: AxiosInstance;
  private pythonServiceUrl: string;

  constructor() {
    this.pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    this.client = axios.create({
      baseURL: this.pythonServiceUrl,
      // Increased from 5 s → 8 s: inference can spike under load.
      // Frame analysis runs every 500 ms so a single slow frame should not
      // back-pressure the queue; we just discard slow frames gracefully.
      timeout: 8_000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Extract a clean error message from any axios / network error.
   */
  private describeError(err: unknown, context: string): string {
    if (err instanceof AxiosError) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail ?? err.response?.data?.message ?? err.message;
      return `${context}: HTTP ${status ?? 'network'} — ${detail}`;
    }
    if (err instanceof Error) return `${context}: ${err.message}`;
    return `${context}: unknown error`;
  }

  /**
   * Check if Python service is available.
   * Uses the dedicated /health endpoint (falls back to /) so that
   * the health check is not accidentally caught by the analyze-frame pipeline.
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try the proper /health endpoint first; fall back to / for compatibility.
      const response = await this.client.get('/health', { timeout: 3_000 });
      return response.data?.status === 'healthy' || response.data?.status === 'running';
    } catch {
      try {
        const response = await this.client.get('/', { timeout: 3_000 });
        return response.data?.status === 'running';
      } catch (err) {
        console.error(`${tag('healthCheck')} Python service unreachable:`, this.describeError(err, 'GET /health'));
        return false;
      }
    }
  }

  /**
   * Start a new engagement tracking session.
   */
  async startSession(
    sessionId: string,
    userId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`${tag('startSession', sessionId)} → POST /start-session`);
      const response = await this.client.post('/start-session', {
        session_id: sessionId,
        user_id: userId,
      });
      console.log(`${tag('startSession', sessionId)} ✓ started`);
      return response.data;
    } catch (err) {
      const msg = this.describeError(err, 'startSession');
      console.error(`${tag('startSession', sessionId)} ✗`, msg);
      throw new Error(msg);
    }
  }

  /**
   * Analyze a single frame.
   *
   * Errors here are logged but NOT re-thrown in production because a single
   * failed frame should not crash the interview. The socket handler decides
   * how to surface this to the client.
   */
  async analyzeFrame(
    sessionId: string,
    frameBase64: string,
    timestamp: number
  ): Promise<EngagementMetrics> {
    try {
      const response = await this.client.post('/analyze-frame', {
        session_id: sessionId,
        frame: frameBase64,
        timestamp,
      });
      return response.data;
    } catch (err) {
      const msg = this.describeError(err, 'analyzeFrame');
      // Log at warn level — a single dropped frame is not fatal.
      console.warn(`${tag('analyzeFrame', sessionId)} dropped frame: ${msg}`);
      throw new Error(msg);
    }
  }

  /**
   * End session and get summary.
   *
   * This is on the critical path (needed for the final report), so we retry
   * once on failure with a short back-off.
   */
  async endSession(sessionId: string): Promise<EngagementSummary> {
    const attempt = async (): Promise<EngagementSummary> => {
      const response = await this.client.post('/end-session', {
        session_id: sessionId,
      });
      return response.data.summary;
    };

    try {
      console.log(`${tag('endSession', sessionId)} → POST /end-session`);
      const summary = await attempt();
      console.log(`${tag('endSession', sessionId)} ✓ summary received`);
      return summary;
    } catch (firstErr) {
      const firstMsg = this.describeError(firstErr, 'endSession attempt 1');
      console.warn(`${tag('endSession', sessionId)} ✗ ${firstMsg} — retrying in 1.5 s…`);

      await new Promise((r) => setTimeout(r, 1_500));

      try {
        const summary = await attempt();
        console.log(`${tag('endSession', sessionId)} ✓ summary received on retry`);
        return summary;
      } catch (retryErr) {
        const msg = this.describeError(retryErr, 'endSession attempt 2');
        console.error(`${tag('endSession', sessionId)} ✗ both attempts failed: ${msg}`);
        throw new Error(msg);
      }
    }
  }

  /**
   * Get active sessions.
   */
  async getActiveSessions(): Promise<string[]> {
    try {
      const response = await this.client.get('/sessions');
      return response.data.active_sessions;
    } catch (err) {
      console.error(`${tag('getActiveSessions')}`, this.describeError(err, 'GET /sessions'));
      return [];
    }
  }
}

export default new EngagementService();
