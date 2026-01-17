import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { Candidate } from '../models/Candidate';
import { HRProfile } from '../models/HRProfile';
import { config } from '../config/environment';
import { AppError } from '../utils/errors';

export class AuthController {
  /**
   * Register a new user with role-based profile creation
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name, role, companyName } = req.body;

      console.log('========================================');
      console.log('🟢 REGISTRATION REQUEST RECEIVED');
      console.log('Email:', email);
      console.log('Name:', name);
      console.log('Role:', role);
      console.log('Company Name:', companyName);
      console.log('========================================');

      // Validation
      if (!email || !password || !name || !role) {
        console.log('❌ VALIDATION FAILED: Missing required fields');
        return res.status(400).json({
          success: false,
          message: 'Email, password, name, and role are required',
        });
      }

      // HR role requires company name
      if (role === 'hr' && !companyName) {
        return res.status(400).json({
          success: false,
          message: 'Company name is required for HR registration',
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);

      // Create user
      const user = new User({
        email,
        password: hashedPassword,
        name,
        role,
        isActive: true,
      });

      await user.save();

      // Debug logging
      console.log('=== REGISTRATION DEBUG ===');
      console.log('Role received from request:', role);
      console.log('User role saved in DB:', user.role);
      console.log('Creating profile for role:', role);

      // Create role-specific profile
      if (role === 'candidate') {
        console.log('Creating Candidate profile...');
        try {
          const candidateProfile = await Candidate.create({
            userId: user._id,
            status: 'active',
          });

          console.log('✅ Candidate profile created successfully:', candidateProfile._id);
        } catch (candidateError) {
          console.log('❌ CANDIDATE PROFILE CREATION FAILED:');
          console.error(candidateError);
          throw new Error(`Failed to create candidate profile: ${candidateError instanceof Error ? candidateError.message : 'Unknown error'}`);
        }
      } else if (role === 'hr') {
        console.log('Creating HR profile with company:', companyName);
        try {
          const hrProfile = await HRProfile.create({
            userId: user._id,
            companyName,
            isVerified: false,
          });
          console.log('✅ HR profile created successfully:', hrProfile._id);
        } catch (hrError) {
          console.log('❌ HR PROFILE CREATION FAILED:');
          console.error(hrError);
          throw new Error(`Failed to create HR profile: ${hrError instanceof Error ? hrError.message : 'Unknown error'}`);
        }
      } else {
        console.log('WARNING: Unknown role, no profile created:', role);
      }

      // Generate tokens
      const accessToken = AuthController.generateAccessToken(user);
      const refreshToken = AuthController.generateRefreshToken(user);

      // Save refresh token to database
      user.refreshTokens.push(refreshToken);
      await user.save();

      // Set refresh token in cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          accessToken,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Login user with role-based response
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'User account is deactivated',
        });
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const accessToken = AuthController.generateAccessToken(user);
      const refreshToken = AuthController.generateRefreshToken(user);

      // Save refresh token to database
      user.refreshTokens.push(refreshToken);
      await user.save();

      // Set refresh token in cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Get role-specific profile info
      let profileData: any = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      if (user.role === 'candidate') {
        const candidateProfile = await Candidate.findOne({ userId: user._id });
        profileData.candidateProfile = candidateProfile;
      } else if (user.role === 'hr') {
        const hrProfile = await HRProfile.findOne({ userId: user._id });
        profileData.hrProfile = hrProfile;
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: profileData,
          accessToken,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret as string) as any;

      // Find user
      const user = await User.findById(decoded.id);
      if (!user || !user.refreshTokens.includes(refreshToken)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token',
        });
      }

      // Generate new access token
      const newAccessToken = AuthController.generateAccessToken(user);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: 'Token refresh failed',
      });
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const user = await User.findById(userId).select('-password -refreshTokens');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Get role-specific profile
      let profileData: any = { ...user.toObject() };

      if (user.role === 'candidate') {
        const candidateProfile = await Candidate.findOne({
          userId: user._id,
        }).populate('appliedPositions');
        profileData.candidateProfile = candidateProfile;
      } else if (user.role === 'hr') {
        const hrProfile = await HRProfile.findOne({ userId: user._id }).populate('postedPositions');
        profileData.hrProfile = hrProfile;
      }

      res.status(200).json({
        success: true,
        data: profileData,
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { name, bio, phone, avatar } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { name, bio, phone, avatar },
        { new: true, runValidators: true }
      ).select('-password -refreshTokens');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (refreshToken) {
        // Remove refresh token from database
        await User.findByIdAndUpdate(userId, {
          $pull: { refreshTokens: refreshToken },
        });
      }

      // Clear cookie
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  }

  /**
   * Change password
   */
  static async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'All password fields are required',
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'New passwords do not match',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters',
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      // Hash new password
      user.password = await bcrypt.hash(newPassword, config.bcryptSaltRounds);
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
      });
    }
  }

  /**
   * Delete account
   */
  static async deleteAccount(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required',
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password',
        });
      }

      // Delete user and related profiles
      await User.deleteOne({ _id: userId });
      await Candidate.deleteOne({ userId });
      await HRProfile.deleteOne({ userId });

      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete account',
      });
    }
  }

  /**
   * Forgot password - Send reset email
   */
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Validation
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase().trim() });

      // Don't reveal if user exists or not for security
      if (!user) {
        return res.status(200).json({
          success: true,
          message: 'If an account exists with this email, you will receive password reset instructions.',
        });
      }

      // Generate reset token (32 bytes = 64 hex characters)
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Hash token before storing in database
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Set token and expiry (1 hour)
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await user.save();

      // Send reset email
      try {
        const { sendPasswordResetEmail } = require('../services/emailService');
        await sendPasswordResetEmail(user.email, user.name, resetToken);

        console.log(`✓ Password reset email sent to: ${user.email}`);

        res.status(200).json({
          success: true,
          message: 'Password reset instructions have been sent to your email.',
        });
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);

        // Clear the reset token if email fails
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(500).json({
          success: false,
          message: 'Failed to send reset email. Please try again later.',
          error: emailError instanceof Error ? emailError.message : 'Email service error',
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Reset password using token
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      // Validation
      if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token, new password, and confirmation are required',
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long',
        });
      }

      // Hash the token from URL to compare with database
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid token
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token. Please request a new password reset.',
        });
      }

      // Hash new password
      user.password = await bcrypt.hash(newPassword, config.bcryptSaltRounds);

      // Clear reset token fields
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      // Clear all refresh tokens (force logout from all devices for security)
      user.refreshTokens = [];

      await user.save();

      // Send confirmation email
      try {
        const { sendPasswordResetConfirmation } = require('../services/emailService');
        await sendPasswordResetConfirmation(user.email, user.name);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the request if confirmation email fails
      }

      console.log(`✓ Password successfully reset for user: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully. You can now log in with your new password.',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update user language preference
   */
  static async updateLanguage(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { language } = req.body;

      // Validate language
      const validLanguages = ['en', 'es', 'fr', 'de', 'pt'];
      if (!language || !validLanguages.includes(language)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid language. Supported languages: en, es, fr, de, pt',
        });
      }

      // Update user language
      const user = await User.findByIdAndUpdate(userId, { language }, { new: true });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Language preference updated successfully',
        data: {
          language: user.language,
        },
      });
    } catch (error) {
      console.error('Update language error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update language preference',
      });
    }
  }

  /**
   * Helper method to generate access token
   */
  private static generateAccessToken(user: any): string {
    const options: SignOptions = { expiresIn: config.jwtExpiresIn as any };
    return jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      config.jwtSecret as string,
      options
    );
  }

  /**
   * Helper method to generate refresh token
   */
  private static generateRefreshToken(user: any): string {
    const options: SignOptions = { expiresIn: config.jwtRefreshExpiresIn as any };
    return jwt.sign(
      { id: user._id, email: user.email },
      config.jwtRefreshSecret as string,
      options
    );
  }
}
