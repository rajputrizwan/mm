import { Request, Response } from 'express';
import { JobPosition } from '../models/JobPosition';

export class PositionController {
  static async create(req: Request, res: Response) {
    try {
      const position = new JobPosition({
        ...req.body,
        hrId: (req as any).user?.id,
      });

      await position.save();

      res.status(201).json({
        success: true,
        data: position,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create position',
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const positions = await JobPosition.find()
        .populate('hrId', 'name email')
        .populate('applicants')
        .populate('interviews');

      res.status(200).json({
        success: true,
        data: positions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch positions',
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const position = await JobPosition.findById(id)
        .populate('hrId')
        .populate('applicants')
        .populate('interviews');

      if (!position) {
        return res.status(404).json({
          success: false,
          message: 'Position not found',
        });
      }

      res.status(200).json({
        success: true,
        data: position,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch position',
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const position = await JobPosition.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.status(200).json({
        success: true,
        data: position,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update position',
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await JobPosition.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Position deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete position',
      });
    }
  }

  static async addApplicant(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { candidateId } = req.body;

      const position = await JobPosition.findByIdAndUpdate(
        id,
        {
          $addToSet: { applicants: candidateId },
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        data: position,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add applicant',
      });
    }
  }
}
