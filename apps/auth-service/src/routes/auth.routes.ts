import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const controller = new AuthController();

router.post('/register', controller.register.bind(controller));
router.post('/login', controller.login.bind(controller));
router.get('/profile', authenticate, controller.profile.bind(controller));
router.get('/verify', authenticate, controller.verify.bind(controller));

export default router;
