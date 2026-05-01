import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';

const notificationService = new NotificationService();

export class NotificationController {
  async getByUser(req: Request, res: Response, next: NextFunction) {
    try {
      // userId from JWT (via gateway) or direct query param for MVP
      const userId = (req as any).user?.id || req.query.userId as string;
      if (!userId) return res.status(400).json({ error: 'userId is required' });
      const notifications = await notificationService.getForUser(userId);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markRead(req.params.id);
      res.json(notification);
    } catch (error) {
      next(error);
    }
  }

  async markUnread(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markUnread(req.params.id);
      res.json(notification);
    } catch (error) {
      next(error);
    }
  }
}
