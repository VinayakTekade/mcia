import { Request, Response, NextFunction } from 'express';
import { ImpactService } from '../services/impact.service';
import { generateImpactSchema } from '../validators/impact.validator';

const impactService = new ImpactService();

export class ImpactController {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const data = generateImpactSchema.parse(req.body);
      const report = await impactService.analyzeImpact(data);
      res.status(201).json(report);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await impactService.getReport(req.params.changeRequestId);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }
}
