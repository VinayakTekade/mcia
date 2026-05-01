import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();
const controller = new NotificationController();

router.get('/', controller.getByUser.bind(controller));
router.patch('/:id/read', controller.markRead.bind(controller));
router.patch('/:id/unread', controller.markUnread.bind(controller));

export default router;
