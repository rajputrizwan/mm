import { Server, Socket } from 'socket.io';
import engagementService from '../services/engagementService';

export function setupEngagementSocket(io: Server) {
  // Create a namespace for engagement tracking
  const engagementNamespace = io.of('/engagement');

  engagementNamespace.on('connection', (socket: Socket) => {
    console.log(`✅ Engagement client connected: ${socket.id}`);

    // ── Start engagement session ─────────────────────────────────────────────
    socket.on(
      'start-session',
      async (data: { sessionId: string; userId?: string }, callback) => {
        if (!data?.sessionId) {
          callback({ success: false, error: 'sessionId is required' });
          return;
        }

        try {
          // Quick health check — if Python is down, fail fast (2 s timeout)
          const pythonHealthy = await Promise.race([
            engagementService.healthCheck(),
            new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000)),
          ]);

          if (!pythonHealthy) {
            console.error('❌ Python engagement service unavailable on port 8000');
            callback({
              success: false,
              error:
                'Engagement service is unavailable. Make sure FastAPI is running on port 8000.',
            });
            return;
          }

          const result = await engagementService.startSession(data.sessionId, data.userId);
          console.log(`📝 Started engagement session: ${data.sessionId}`);
          callback({ success: true, data: result });
        } catch (error: any) {
          console.error('Error starting engagement session:', error.message);
          callback({ success: false, error: error.message });
        }
      },
    );

    // ── Analyze frame ────────────────────────────────────────────────────────
    socket.on(
      'analyze-frame',
      async (
        data: { sessionId: string; frame: string; timestamp: number },
        callback,
      ) => {
        try {
          if (!data?.sessionId || !data?.frame) {
            if (typeof callback === 'function')
              callback({ success: false, error: 'Missing sessionId or frame' });
            return;
          }

          const metrics = await engagementService.analyzeFrame(
            data.sessionId,
            data.frame,
            data.timestamp ?? Date.now() / 1000,
          );

          // Send metrics back to THIS client
          socket.emit('engagement-metrics', metrics);

          if (typeof callback === 'function') callback({ success: true });
        } catch (error: any) {
          console.error('Error analyzing frame:', error.message);
          if (typeof callback === 'function')
            callback({ success: false, error: error.message });
        }
      },
    );

    // ── End engagement session ───────────────────────────────────────────────
    socket.on(
      'end-session',
      async (data: { sessionId: string }, callback) => {
        if (!data?.sessionId) {
          if (typeof callback === 'function')
            callback({ success: false, error: 'sessionId is required' });
          return;
        }

        try {
          const summary = await engagementService.endSession(data.sessionId);
          console.log(`🏁 Ended engagement session: ${data.sessionId}`);
          if (typeof callback === 'function')
            callback({ success: true, summary });
        } catch (error: any) {
          console.error('Error ending engagement session:', error.message);
          if (typeof callback === 'function')
            callback({ success: false, error: error.message });
        }
      },
    );

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`❌ Engagement client disconnected: ${socket.id} (${reason})`);
    });
  });

  return engagementNamespace;
}
