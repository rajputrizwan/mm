import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/environment';

/**
 * Auth utility functions for token management and security
 */
export class AuthUtils {
  /**
   * Generate access token
   */
  static generateAccessToken(userId: string, email: string, role: string): string {
    return jwt.sign({ id: userId, email, role }, config.jwtSecret as string, {
      expiresIn: config.jwtExpiresIn,
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: string, email: string): string {
    return jwt.sign({ id: userId, email }, config.jwtRefreshSecret as string, {
      expiresIn: config.jwtRefreshExpiresIn,
    });
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, config.jwtSecret as string);
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, config.jwtRefreshSecret as string);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Hash password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.bcryptSaltRounds);
  }

  /**
   * Compare passwords
   */
  static async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): any {
    return jwt.decode(token);
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwt.decode(token);
      if (!decoded || !decoded.exp) return true;
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /**
   * Generate verification token for email
   */
  static generateVerificationToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Generate password reset token
   */
  static generateResetToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Extract token from authorization header
   */
  static extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}
