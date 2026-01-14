import { Request, Response } from "express";
import { Interview } from "../models/Interview";

export class InterviewController {
  static async create(req: Request, res: Response) {
    try {
      const { candidateId, jobPositionId, type } = req.body;

      const interview = new Interview({
        candidateId,
        jobPositionId,
        type,
        hrId: (req as any).user?.id,
        status: "scheduled",
        scheduledAt: new Date(),
      });

      await interview.save();

      res.status(201).json({
        success: true,
        data: interview,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create interview",
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const interviews = await Interview.find()
        .populate("candidateId", "name email")
        .populate("jobPositionId", "title");

      res.status(200).json({
        success: true,
        data: interviews,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch interviews",
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const interview = await Interview.findById(id)
        .populate("candidateId")
        .populate("jobPositionId")
        .populate("questions")
        .populate("answers");

      if (!interview) {
        return res.status(404).json({
          success: false,
          message: "Interview not found",
        });
      }

      res.status(200).json({
        success: true,
        data: interview,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch interview",
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const interview = await Interview.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.status(200).json({
        success: true,
        data: interview,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update interview",
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await Interview.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Interview deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete interview",
      });
    }
  }

  static async submitFeedback(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { feedback, score } = req.body;

      const interview = await Interview.findByIdAndUpdate(
        id,
        {
          feedback,
          score,
          status: "completed",
          endedAt: new Date(),
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        data: interview,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to submit feedback",
      });
    }
  }

  static async startInterview(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const interview = await Interview.findByIdAndUpdate(
        id,
        {
          status: "in_progress",
          startedAt: new Date(),
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        data: interview,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to start interview",
      });
    }
  }
}
