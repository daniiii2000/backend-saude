import { Router } from 'express';
import authController from '../controllers/authController'; // seu controlador
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/perfil', authMiddleware, (req, res) => {
  res.json({ usuario: req.user });
});

export default router;
