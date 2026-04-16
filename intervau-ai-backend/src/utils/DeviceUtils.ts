import { Request } from 'express';
import crypto from 'crypto';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  operatingSystem: string;
}

/**
 * Utility functions for device detection and management
 */
export class DeviceUtils {
  /**
   * Generate a unique device ID based on user agent and IP address
   */
  static generateDeviceId(userAgent: string, ipAddress: string): string {
    const combined = `${userAgent}${ipAddress}`;
    return crypto.createHash('sha256').update(combined).digest('hex');
  }

  /**
   * Extract device information from user agent and request
   */
  static getDeviceInfo(req: Request): DeviceInfo {
    const userAgent = req.get('user-agent') || 'Unknown';
    const ipAddress = this.getClientIp(req);

    const deviceInfo = this.parseUserAgent(userAgent);
    const deviceId = this.generateDeviceId(userAgent, ipAddress);

    return {
      deviceId,
      ...deviceInfo,
    };
  }

  /**
   * Parse user agent string to extract browser, OS, and device type
   */
  private static parseUserAgent(userAgent: string): Omit<DeviceInfo, 'deviceId'> {
    const ua = userAgent.toLowerCase();

    // Detect device type
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/mobile|android|iphone|ipod/.test(ua)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad|android/.test(ua)) {
      deviceType = 'tablet';
    }

    // Detect browser
    let browser = 'Unknown';
    if (/chrome|chromium|crios/.test(ua)) {
      browser = 'Chrome';
    } else if (/firefox|fxios/.test(ua)) {
      browser = 'Firefox';
    } else if (/safari/.test(ua) && !/chrome/.test(ua)) {
      browser = 'Safari';
    } else if (/edg/.test(ua)) {
      browser = 'Edge';
    } else if (/opr|opera/.test(ua)) {
      browser = 'Opera';
    }

    // Detect OS
    let operatingSystem = 'Unknown';
    if (/windows/.test(ua)) {
      operatingSystem = 'Windows';
    } else if (/mac/.test(ua)) {
      operatingSystem = 'macOS';
    } else if (/linux/.test(ua)) {
      operatingSystem = 'Linux';
    } else if (/iphone|ipad|ipod/.test(ua)) {
      operatingSystem = 'iOS';
    } else if (/android/.test(ua)) {
      operatingSystem = 'Android';
    }

    // Generate device name
    const deviceName = `${browser} on ${operatingSystem}`;

    return {
      deviceName,
      deviceType,
      browser,
      operatingSystem,
    };
  }

  /**
   * Extract client IP address from request
   */
  private static getClientIp(req: Request): string {
    const xForwardedFor = req.get('x-forwarded-for');
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }
    return req.ip || '0.0.0.0';
  }

  /**
   * Generate a human-readable device name with timestamp
   */
  static generateDeviceName(deviceInfo: Omit<DeviceInfo, 'deviceId'>): string {
    const timestamp = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return `${deviceInfo.browser} - ${deviceInfo.operatingSystem} (${timestamp})`;
  }
}
