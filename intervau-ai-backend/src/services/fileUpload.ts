import cloudinary from 'cloudinary';
import { config } from '../config/environment';

/**
 * File upload service with Cloudinary
 */
export class FileUploadService {
  private cloudinary: any;

  constructor() {
    this.cloudinary = cloudinary.v2;
    this.cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
    });
  }

  /**
   * Upload file to Cloudinary
   */
  async uploadFile(file: any, folder: string) {
    try {
      const result = await this.cloudinary.uploader.upload(file.path, {
        folder: `intervau-ai/${folder}`,
        resource_type: 'auto',
      });
      console.log('✓ File uploaded:', result.public_id);
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
      };
    } catch (error) {
      console.error('✗ File upload failed:', error);
      throw error;
    }
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId: string) {
    try {
      const result = await this.cloudinary.uploader.destroy(publicId);
      console.log('✓ File deleted:', publicId);
      return result;
    } catch (error) {
      console.error('✗ File delete failed:', error);
      throw error;
    }
  }

  /**
   * Upload resume PDF
   */
  async uploadResume(file: any) {
    return this.uploadFile(file, 'resumes');
  }

  /**
   * Upload video file
   */
  async uploadVideo(file: any) {
    return this.uploadFile(file, 'videos');
  }

  /**
   * Upload audio file
   */
  async uploadAudio(file: any) {
    return this.uploadFile(file, 'audio');
  }
}

export const fileUploadService = new FileUploadService();
