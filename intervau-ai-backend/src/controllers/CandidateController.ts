import { Request, Response } from 'express';
import { Candidate } from '../models/Candidate';

export class CandidateController {
  static async create(req: Request, res: Response) {
    try {
      const candidate = new Candidate({
        ...req.body,
        userId: (req as any).user?.id,
      });

      await candidate.save();

      res.status(201).json({
        success: true,
        data: candidate,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create candidate',
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const candidates = await Candidate.find().populate('userId', 'name email');
      res.status(200).json({
        success: true,
        data: candidates,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch candidates',
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const candidate = await Candidate.findById(id).populate('userId');

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Candidate not found',
        });
      }

      res.status(200).json({
        success: true,
        data: candidate,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch candidate',
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const candidate = await Candidate.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.status(200).json({
        success: true,
        data: candidate,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update candidate',
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await Candidate.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Candidate deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete candidate',
      });
    }
  }

  static async updateResume(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { resumeUrl } = req.body;

      const candidate = await Candidate.findByIdAndUpdate(
        id,
        {
          resume: {
            url: resumeUrl,
            uploadedAt: new Date(),
          },
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        data: candidate,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update resume',
      });
    }
  }
}
