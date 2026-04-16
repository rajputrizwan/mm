import axios, { AxiosInstance } from 'axios';

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

class EngagementService {
  private client: AxiosInstance;
  private pythonServiceUrl: string;

  constructor() {
    this.pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    this.client = axios.create({
      baseURL: this.pythonServiceUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Check if Python service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/');
      return response.data.status === 'running';
    } catch (error) {
      console.error('Python service health check failed:', error);
      return false;
    }
  }

  /**
   * Start a new engagement tracking session
   */
  async startSession(
    sessionId: string,
    userId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.post('/start-session', {
        session_id: sessionId,
        user_id: userId,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error starting engagement session:', error.message);
      throw new Error(`Failed to start engagement session: ${error.message}`);
    }
  }

  /**
   * Analyze a single frame
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
        timestamp: timestamp,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error analyzing frame:', error.message);
      throw new Error(`Frame analysis failed: ${error.message}`);
    }
  }

  /**
   * End session and get summary
   */
  async endSession(sessionId: string): Promise<EngagementSummary> {
    try {
      const response = await this.client.post('/end-session', {
        session_id: sessionId,
      });
      return response.data.summary;
    } catch (error: any) {
      console.error('Error ending engagement session:', error.message);
      throw new Error(`Failed to end engagement session: ${error.message}`);
    }
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(): Promise<string[]> {
    try {
      const response = await this.client.get('/sessions');
      return response.data.active_sessions;
    } catch (error: any) {
      console.error('Error getting active sessions:', error.message);
      return [];
    }
  }
}

export default new EngagementService();
