import { Router, Request, Response } from 'express';
import authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorize';

const router = Router();

// ✅ Cadastro de paciente sem exigir autenticação
router.post('/register', authController.register);

// ✅ Login do paciente ou profissional
router.post('/login', authController.login);

// 🔒 Rota protegida: qualquer usuário autenticado
router.get('/perfil', authMiddleware, (req: Request, res: Response) => {
  const usuario = req.user;
  res.json({ usuario });
});

// 🔒 Acesso restrito a profissionais
router.get('/area-profissional', authMiddleware, authorize('profissional'), (req, res) => {
  res.json({ message: 'Bem-vindo à área dos profissionais!' });
});

// 🔒 Acesso restrito a pacientes
router.get('/area-paciente', authMiddleware, authorize('paciente'), (req, res) => {
  res.json({ message: 'Área exclusiva para pacientes!' });
});

export default router;
