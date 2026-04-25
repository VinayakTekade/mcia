import { Router } from 'express';
import { DependencyController } from '../controllers/dependency.controller';

const router = Router();
const controller = new DependencyController();

router.get('/', controller.getAll.bind(controller));
router.post('/', controller.create.bind(controller));
router.get('/graph', controller.getGraph.bind(controller));
router.get('/:serviceId/upstream', controller.getUpstream.bind(controller));
router.get('/:serviceId/downstream', controller.getDownstream.bind(controller));
router.delete('/:id', controller.remove.bind(controller));

export default router;
