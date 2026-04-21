import { Request, Response, NextFunction } from 'express';
import { RegistryService } from '../services/registry.service';
import { createServiceSchema, updateServiceSchema } from '../validators/registry.validator';

const registryService = new RegistryService();

export class RegistryController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createServiceSchema.parse(req.body);
      const userId = (req as any).user?.id; // Assuming gateway passes user via headers, or we implement shared-auth middleware.
      
      const service = await registryService.createService(data, userId);
      res.status(201).json(service);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await registryService.getServices(page, limit, search);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await registryService.getServiceById(req.params.id);
      res.json(service);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateServiceSchema.parse(req.body);
      const userId = (req as any).user?.id;
      const service = await registryService.updateService(req.params.id, data, userId);
      res.json(service);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await registryService.deleteService(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
