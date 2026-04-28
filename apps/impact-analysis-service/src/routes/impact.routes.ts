import { Router } from 'express';
import { ImpactController } from '../controllers/impact.controller';

const router = Router();
const controller = new ImpactController();

router.post('/generate', controller.generate.bind(controller));
router.get('/:changeRequestId', controller.getOne.bind(controller));

export default router;
