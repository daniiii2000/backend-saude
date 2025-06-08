import { Router, Request, Response } from 'express';
import authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorize';

const router = Router();

// Rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rota protegida genérica (qualquer usuário autenticado)
router.get('/perfil', authMiddleware, (req: Request, res: Response) => {
  const usuario = req.user;
  res.json({ usuario });
});

// Rota só para profissionais
router.get('/area-profissional', authMiddleware, authorize('profissional'), (req, res) => {
  res.json({ message: 'Bem-vindo à área dos profissionais!' });
});

// Rota só para pacientes
router.get('/area-paciente', authMiddleware, authorize('paciente'), (req, res) => {
  res.json({ message: 'Área exclusiva para pacientes!' });
});

export default router;
