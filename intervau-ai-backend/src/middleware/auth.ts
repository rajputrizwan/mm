import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Verify JWT token and attach user to request
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided',
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwtSecret as string) as any;

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: 'Token has expired',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 */
export const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(
          ', '
        )}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is an HR member
 */
export const isHRMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  if (req.user.role !== 'hr') {
    return res.status(403).json({
      success: false,
      message: 'This action is only available to HR members',
    });
  }

  next();
};

/**
 * Middleware to check if user is a candidate
 */
export const isCandidateMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  if (req.user.role !== 'candidate') {
    return res.status(403).json({
      success: false,
      message: 'This action is only available to candidates',
    });
  }

  next();
};

/**
 * Middleware to check if user is an admin
 */
export const isAdminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'This action is only available to admins',
    });
  }

  next();
};

/**
 * Optional auth middleware - doesn't fail if no token, but parses it if present
 */
export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwtSecret as string) as any;

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // If token parsing fails, just continue without user
    next();
  }
};

/**
 * Middleware to verify ownership of a resource
 */
export const ownershipMiddleware = (paramName: string = 'userId') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const resourceUserId = req.params[paramName];
    if (resourceUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};
