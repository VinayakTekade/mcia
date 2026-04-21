import { Router } from 'express';
import { RegistryController } from '../controllers/registry.controller';

const router = Router();
const controller = new RegistryController();

// Basic CRUD routes. Note: Auth middleware is assumed to run at API Gateway or shared-auth package level.
// For MVP, we'll leave them open if hit directly, or protected if hit via Gateway.
router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getOne.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.remove.bind(controller));

export default router;
