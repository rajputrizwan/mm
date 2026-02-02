import { Request, Response } from 'express';
import { RememberMeSession } from '../models/RememberMeSession';
import { User } from '../models/User';

export class DeviceSessionController {
  /**
   * Get all active Remember Me sessions for the current user
   */
  static async getActiveSessions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - User ID not found',
        });
      }

      const sessions = await RememberMeSession.find({
        userId,
        isActive: true,
      })
        .select('-refreshToken') // Don't send refresh token to client
        .sort({ lastActivityAt: -1 });

      res.status(200).json({
        success: true,
        message: 'Active sessions retrieved successfully',
        data: {
          sessions,
          total: sessions.length,
        },
      });
    } catch (error) {
      console.error('Get active sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve active sessions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Revoke a specific Remember Me session
   */
  static async revokeSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { sessionId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - User ID not found',
        });
      }

      // Verify that the session belongs to the current user
      const session = await RememberMeSession.findOne({
        _id: sessionId,
        userId,
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      // Mark session as inactive
      session.isActive = false;
      await session.save();

      // Also remove the refresh token from user's token list
      const user = await User.findById(userId);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(token => token !== session.refreshToken);
        await user.save();
      }

      res.status(200).json({
        success: true,
        message: 'Session revoked successfully',
        data: {
          sessionId,
        },
      });
    } catch (error) {
      console.error('Revoke session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to revoke session',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Revoke all other sessions (keep only current session)
   */
  static async revokeAllOtherSessions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { currentSessionId } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - User ID not found',
        });
      }

      // Get all sessions except the current one
      const sessionsToRevoke = await RememberMeSession.find({
        userId,
        _id: { $ne: currentSessionId },
        isActive: true,
      });

      // Collect all refresh tokens to remove
      const tokensToRemove = sessionsToRevoke.map(s => s.refreshToken);

      // Deactivate all other sessions
      await RememberMeSession.updateMany(
        {
          userId,
          _id: { $ne: currentSessionId },
        },
        { isActive: false }
      );

      // Remove tokens from user's token list
      const user = await User.findById(userId);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(token => !tokensToRemove.includes(token));
        await user.save();
      }

      res.status(200).json({
        success: true,
        message: 'All other sessions revoked successfully',
        data: {
          revokedCount: sessionsToRevoke.length,
        },
      });
    } catch (error) {
      console.error('Revoke all other sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to revoke other sessions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update last activity timestamp for a session
   */
  static async updateSessionActivity(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { sessionId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - User ID not found',
        });
      }

      const session = await RememberMeSession.findOneAndUpdate(
        {
          _id: sessionId,
          userId,
        },
        { lastActivityAt: new Date() },
        { new: true }
      );

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Session activity updated',
        data: {
          session,
        },
      });
    } catch (error) {
      console.error('Update session activity error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update session activity',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get session details
   */
  static async getSessionDetails(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { sessionId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - User ID not found',
        });
      }

      const session = await RememberMeSession.findOne({
        _id: sessionId,
        userId,
      }).select('-refreshToken');

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Session details retrieved',
        data: {
          session,
        },
      });
    } catch (error) {
      console.error('Get session details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve session details',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
