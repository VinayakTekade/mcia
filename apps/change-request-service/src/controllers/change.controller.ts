import { Request, Response, NextFunction } from 'express';
import { ChangeService } from '../services/change.service';
import { createDraftSchema, reviewSchema } from '../validators/change.validator';

const changeService = new ChangeService();

export class ChangeController {
  async createDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createDraftSchema.parse(req.body);
      const user = {
        id: req.headers['x-user-id'] as string || 'unknown',
        role: req.headers['x-user-role'] as string || 'DEVELOPER',
      };
      const cr = await changeService.createDraft(data, user.id, user.role);
      res.status(201).json(cr);
    } catch (error) {
      next(error);
    }
  }

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const user = {
        id: req.headers['x-user-id'] as string || 'unknown',
        role: req.headers['x-user-role'] as string || 'DEVELOPER',
      };
      const cr = await changeService.submitForReview(req.params.id, user.id, user.role);
      res.json(cr);
    } catch (error) {
      next(error);
    }
  }

  async review(req: Request, res: Response, next: NextFunction) {
    try {
      const data = reviewSchema.parse(req.body);
      const user = {
        id: req.headers['x-user-id'] as string || 'unknown',
        role: req.headers['x-user-role'] as string || 'DEVELOPER',
      };
      const cr = await changeService.review(req.params.id, user.id, user.role, data);
      res.json(cr);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const user = {
        id: req.headers['x-user-id'] as string || 'unknown',
        role: req.headers['x-user-role'] as string || 'DEVELOPER',
      };
      const crs = await changeService.getAll(user.role, user.id);
      res.json(crs);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const cr = await changeService.getById(req.params.id);
      res.json(cr);
    } catch (error) {
      next(error);
    }
  }
}
