import { Request, Response, NextFunction } from 'express';
import { DependencyService } from '../services/dependency.service';
import { createDependencySchema } from '../validators/dependency.validator';

const dependencyService = new DependencyService();

export class DependencyController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createDependencySchema.parse(req.body);
      const dependency = await dependencyService.createDependency(data as any);
      res.status(201).json(dependency);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const deps = await dependencyService.getAllDependencies();
      res.json(deps);
    } catch (error) {
      next(error);
    }
  }

  async getGraph(req: Request, res: Response, next: NextFunction) {
    try {
      const graph = await dependencyService.getGraph();
      res.json(graph);
    } catch (error) {
      next(error);
    }
  }

  async getUpstream(req: Request, res: Response, next: NextFunction) {
    try {
      const deps = await dependencyService.getUpstream(req.params.serviceId);
      res.json(deps);
    } catch (error) {
      next(error);
    }
  }

  async getDownstream(req: Request, res: Response, next: NextFunction) {
    try {
      const deps = await dependencyService.getDownstream(req.params.serviceId);
      res.json(deps);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await dependencyService.deleteDependency(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
