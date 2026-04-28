import { Router } from 'express';
import { ChangeController } from '../controllers/change.controller';

const router = Router();
const controller = new ChangeController();

router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getOne.bind(controller));
router.post('/draft', controller.createDraft.bind(controller));
router.post('/:id/submit', controller.submit.bind(controller));
router.post('/:id/review', controller.review.bind(controller));

export default router;
