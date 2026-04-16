import { Request } from 'express';

/**
 * Device information extracted from user agent
 */
export interface DeviceInfo {
    deviceName: string;
    deviceType: 'mobile' | 'tablet' | 'desktop';
    browser: string;
    operatingSystem: string;
    ipAddress: string;
}

/**
 * Parse User-Agent string and extract device information
 */
export function parseUserAgent(req: Request): DeviceInfo {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim()
        || req.socket.remoteAddress
        || 'Unknown';

    // Detect browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browser = 'Chrome';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'Safari';
    } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
    } else if (userAgent.includes('Edg')) {
        browser = 'Edge';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
        browser = 'Opera';
    }

    // Detect operating system
    let operatingSystem = 'Unknown';
    if (userAgent.includes('Windows NT 10.0')) {
        operatingSystem = 'Windows 10';
    } else if (userAgent.includes('Windows NT 6.3')) {
        operatingSystem = 'Windows 8.1';
    } else if (userAgent.includes('Windows NT 6.2')) {
        operatingSystem = 'Windows 8';
    } else if (userAgent.includes('Windows NT 6.1')) {
        operatingSystem = 'Windows 7';
    } else if (userAgent.includes('Windows')) {
        operatingSystem = 'Windows';
    } else if (userAgent.includes('Mac OS X')) {
        const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
        operatingSystem = match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS';
    } else if (userAgent.includes('Linux')) {
        operatingSystem = 'Linux';
    } else if (userAgent.includes('Android')) {
        const match = userAgent.match(/Android (\d+(\.\d+)?)/);
        operatingSystem = match ? `Android ${match[1]}` : 'Android';
    } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        const match = userAgent.match(/OS (\d+[._]\d+)/);
        operatingSystem = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
    }

    // Detect device type
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (userAgent.includes('Mobile') || userAgent.includes('Android') && !userAgent.includes('Tablet')) {
        deviceType = 'mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
        deviceType = 'tablet';
    }

    // Create device name
    const deviceName = `${browser} on ${operatingSystem}`;

    return {
        deviceName,
        deviceType,
        browser,
        operatingSystem,
        ipAddress,
    };
}

/**
 * Generate a unique device ID based on user agent and IP
 */
export function generateDeviceId(userAgent: string, ipAddress: string): string {
    const crypto = require('crypto');
    return crypto
        .createHash('sha256')
        .update(`${userAgent}-${ipAddress}-${Date.now()}`)
        .digest('hex');
}
